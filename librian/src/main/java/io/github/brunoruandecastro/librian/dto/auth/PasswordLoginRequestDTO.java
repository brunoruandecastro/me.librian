package io.github.brunoruandecastro.librian.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PasswordLoginRequestDTO {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;
}
