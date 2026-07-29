package io.github.brunoruandecastro.librian.dto.auth;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthProfileResponseDTO {
    private UUID id;
    private String email;
    private String name;
    private String picture;
    private boolean emailVerified;
    private boolean hasPassword;
}
