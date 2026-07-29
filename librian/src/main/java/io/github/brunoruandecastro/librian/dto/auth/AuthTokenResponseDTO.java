package io.github.brunoruandecastro.librian.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthTokenResponseDTO {
    private String token;
    private AuthProfileResponseDTO user;
}
