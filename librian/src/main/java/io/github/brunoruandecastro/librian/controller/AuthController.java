package io.github.brunoruandecastro.librian.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.github.brunoruandecastro.librian.config.SecurityUtils;
import io.github.brunoruandecastro.librian.dto.auth.AuthProfileResponseDTO;
import io.github.brunoruandecastro.librian.dto.auth.AuthTokenResponseDTO;
import io.github.brunoruandecastro.librian.dto.auth.MagicLinkRequestDTO;
import io.github.brunoruandecastro.librian.dto.auth.MagicLinkResponseDTO;
import io.github.brunoruandecastro.librian.dto.auth.MagicLinkVerifyRequestDTO;
import io.github.brunoruandecastro.librian.dto.auth.MagicLinkVerifyResponseDTO;
import io.github.brunoruandecastro.librian.dto.auth.PasswordLoginRequestDTO;
import io.github.brunoruandecastro.librian.dto.auth.SetPasswordRequestDTO;
import io.github.brunoruandecastro.librian.service.AuthService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/magic-link")
    public ResponseEntity<MagicLinkResponseDTO> requestMagicLink(@Valid @RequestBody MagicLinkRequestDTO request) {
        return ResponseEntity.ok(authService.requestMagicLink(request));
    }

    @GetMapping("/magic-link/verify")
    public ResponseEntity<MagicLinkVerifyResponseDTO> verifyMagicLinkGet(@RequestParam("token") String token) {
        return ResponseEntity.ok(authService.verifyMagicLink(token));
    }

    @PostMapping("/magic-link/verify")
    public ResponseEntity<MagicLinkVerifyResponseDTO> verifyMagicLinkPost(
            @Valid @RequestBody MagicLinkVerifyRequestDTO request) {
        return ResponseEntity.ok(authService.verifyMagicLink(request.getToken()));
    }

    @PostMapping("/set-password")
    public ResponseEntity<AuthTokenResponseDTO> setPassword(@Valid @RequestBody SetPasswordRequestDTO request) {
        return ResponseEntity.ok(authService.setPassword(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthTokenResponseDTO> login(@Valid @RequestBody PasswordLoginRequestDTO request) {
        return ResponseEntity.ok(authService.loginWithPassword(request));
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthProfileResponseDTO> profile() {
        return ResponseEntity.ok(authService.getProfile(SecurityUtils.currentUserId()));
    }
}
