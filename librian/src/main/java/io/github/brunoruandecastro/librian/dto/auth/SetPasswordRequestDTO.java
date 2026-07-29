package io.github.brunoruandecastro.librian.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SetPasswordRequestDTO {

    @NotBlank
    private String setupToken;

    @NotBlank
    @Size(min = 8, max = 72)
    private String password;
}
