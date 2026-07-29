package io.github.brunoruandecastro.librian.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.brunoruandecastro.librian.config.SecurityUtils;
import io.github.brunoruandecastro.librian.dto.user.UserCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.user.UserCreateResponseDTO;
import io.github.brunoruandecastro.librian.dto.user.UserStatsResponseDTO;
import io.github.brunoruandecastro.librian.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserCreateResponseDTO> registerUser(@Valid @RequestBody UserCreateRequestDTO userCreated) {
        UserCreateResponseDTO userCreatedResponse = userService.registerUser(userCreated);
        return ResponseEntity.status(HttpStatus.CREATED).body(userCreatedResponse);
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsResponseDTO> getStats() {
        return ResponseEntity.ok(userService.getStats(SecurityUtils.currentUserId()));
    }
}
