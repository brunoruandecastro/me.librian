package io.github.brunoruandecastro.librian.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import io.github.brunoruandecastro.librian.config.JwtService;
import io.github.brunoruandecastro.librian.dto.auth.AuthProfileResponseDTO;
import io.github.brunoruandecastro.librian.dto.auth.AuthTokenResponseDTO;
import io.github.brunoruandecastro.librian.dto.auth.MagicLinkRequestDTO;
import io.github.brunoruandecastro.librian.dto.auth.MagicLinkResponseDTO;
import io.github.brunoruandecastro.librian.dto.auth.MagicLinkVerifyResponseDTO;
import io.github.brunoruandecastro.librian.dto.auth.PasswordLoginRequestDTO;
import io.github.brunoruandecastro.librian.dto.auth.SetPasswordRequestDTO;
import io.github.brunoruandecastro.librian.entity.MagicLinkToken;
import io.github.brunoruandecastro.librian.entity.User;
import io.github.brunoruandecastro.librian.repository.MagicLinkTokenRepository;
import io.github.brunoruandecastro.librian.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final MagicLinkTokenRepository magicLinkTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final MagicLinkMailService magicLinkMailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${librian.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${librian.magic-link.expiration-minutes:30}")
    private long magicLinkExpirationMinutes;

    public AuthService(
            UserRepository userRepository,
            MagicLinkTokenRepository magicLinkTokenRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            MagicLinkMailService magicLinkMailService) {
        this.userRepository = userRepository;
        this.magicLinkTokenRepository = magicLinkTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.magicLinkMailService = magicLinkMailService;
    }

    @Transactional
    public MagicLinkResponseDTO requestMagicLink(MagicLinkRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User created = new User();
            created.setEmail(email);
            created.setName(request.getName() != null && !request.getName().isBlank()
                    ? request.getName().trim()
                    : email.split("@")[0]);
            created.setEmailVerified(false);
            return userRepository.save(created);
        });

        if (request.getName() != null && !request.getName().isBlank()
                && (user.getName() == null || user.getName().isBlank())) {
            user.setName(request.getName().trim());
            userRepository.save(user);
        }

        String rawToken = generateRawToken();
        MagicLinkToken token = new MagicLinkToken();
        token.setUser(user);
        token.setTokenHash(hashToken(rawToken));
        token.setExpiresAt(Date.from(Instant.now().plusSeconds(magicLinkExpirationMinutes * 60)));
        magicLinkTokenRepository.save(token);

        String magicLinkUrl = UriComponentsBuilder
                .fromUriString(frontendUrl)
                .path("/auth/callback")
                .queryParam("token", rawToken)
                .build()
                .toUriString();

        magicLinkMailService.sendMagicLink(email, magicLinkUrl);

        return new MagicLinkResponseDTO(
                "Se o email existir ou for válido, enviamos um link de acesso.",
                magicLinkMailService.isExposeInResponse() ? magicLinkUrl : null);
    }

    @Transactional
    public MagicLinkVerifyResponseDTO verifyMagicLink(String rawToken) {
        MagicLinkToken token = magicLinkTokenRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link inválido"));

        if (token.isUsed() || token.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link expirado ou já utilizado");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        token.setUsedAt(new Date());
        userRepository.save(user);
        magicLinkTokenRepository.save(token);

        if (user.hasPassword()) {
            String jwt = jwtService.generateToken(user.getId(), user.getEmail());
            return new MagicLinkVerifyResponseDTO(
                    user.getEmail(),
                    true,
                    true,
                    false,
                    null,
                    jwt,
                    toProfile(user));
        }

        String setupToken = jwtService.generateSetupToken(user.getId(), user.getEmail());
        return new MagicLinkVerifyResponseDTO(
                user.getEmail(),
                true,
                false,
                true,
                setupToken,
                null,
                toProfile(user));
    }

    @Transactional
    public AuthTokenResponseDTO setPassword(SetPasswordRequestDTO request) {
        if (!jwtService.isValidSetupToken(request.getSetupToken())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token de configuração inválido ou expirado");
        }

        UUID userId = jwtService.extractUserId(request.getSetupToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Email ainda não confirmado");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        String jwt = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthTokenResponseDTO(jwt, toProfile(user));
    }

    @Transactional(readOnly = true)
    public AuthTokenResponseDTO loginWithPassword(PasswordLoginRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));

        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Confirme seu email pelo magic link antes de usar senha");
        }

        if (!user.hasPassword()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Defina uma senha após confirmar o email pelo magic link");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        String jwt = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthTokenResponseDTO(jwt, toProfile(user));
    }

    @Transactional(readOnly = true)
    public AuthProfileResponseDTO getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toProfile(user);
    }

    private AuthProfileResponseDTO toProfile(User user) {
        return new AuthProfileResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPicture(),
                user.isEmailVerified(),
                user.hasPassword());
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to hash magic link token", e);
        }
    }
}
