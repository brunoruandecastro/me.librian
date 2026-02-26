package io.github.brunoruandecastro.librian.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequestDTO {

    public UserCreateRequestDTO(String email, String password){
        this.email = email;
        this.password = password;
    }

    @NotEmpty(message = "Email is required")
    @Email(message = "Email is invalid")
    private String email;

    @NotEmpty(message = "Password is required")
    private String password;

    private String name;

}
