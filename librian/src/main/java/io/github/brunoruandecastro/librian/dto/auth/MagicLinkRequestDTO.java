package io.github.brunoruandecastro.librian.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MagicLinkRequestDTO {

    @NotBlank
    @Email
    private String email;

    @Size(max = 120)
    private String name;
}
