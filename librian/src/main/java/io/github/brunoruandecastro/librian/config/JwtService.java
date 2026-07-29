package io.github.brunoruandecastro.librian.config;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String CLAIM_TYPE = "typ";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_SETUP = "setup";

    private final SecretKey secretKey;
    private final long expirationMs;
    private final long setupExpirationMs;

    public JwtService(
            @Value("${librian.jwt.secret}") String secret,
            @Value("${librian.jwt.expiration-ms}") long expirationMs,
            @Value("${librian.jwt.setup-expiration-ms:900000}") long setupExpirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.setupExpirationMs = setupExpirationMs;
    }

    public String generateToken(UUID userId, String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim(CLAIM_TYPE, TYPE_ACCESS)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    public String generateSetupToken(UUID userId, String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim(CLAIM_TYPE, TYPE_SETUP)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + setupExpirationMs))
                .signWith(secretKey)
                .compact();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public boolean isValidAccessToken(String token) {
        try {
            Claims claims = parseClaims(token);
            if (!claims.getExpiration().after(new Date())) {
                return false;
            }
            String type = claims.get(CLAIM_TYPE, String.class);
            return type == null || TYPE_ACCESS.equals(type);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isValidSetupToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date())
                    && TYPE_SETUP.equals(claims.get(CLAIM_TYPE, String.class));
        } catch (Exception e) {
            return false;
        }
    }

    /** @deprecated use isValidAccessToken */
    public boolean isValid(String token) {
        return isValidAccessToken(token);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
