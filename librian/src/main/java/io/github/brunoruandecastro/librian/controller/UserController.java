package io.github.brunoruandecastro.librian.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.brunoruandecastro.librian.dto.user.UserCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.user.UserCreateResponseDTO;
import io.github.brunoruandecastro.librian.service.UserService;

@RestController
@RequestMapping("/user")
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

}
