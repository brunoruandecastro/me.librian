package io.github.brunoruandecastro.librian.dto.user;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class UserCreateResponseDTO {

    private UUID id;
    private String name;
    private String email;

    public UserCreateResponseDTO(UUID id, String userName, String email){
        this.id = id;
        this.name = userName;
        this.email = email;
    }

}
