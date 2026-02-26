package io.github.brunoruandecastro.librian.extensions;

import io.github.brunoruandecastro.librian.dto.user.*;
import io.github.brunoruandecastro.librian.entity.User;

import org.springframework.stereotype.Component;


@Component
public class UserMapper implements BaseMapper<UserCreateRequestDTO, User, UserCreateResponseDTO> {

    @Override
    public User toEntity(UserCreateRequestDTO dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        return user;
    }

    @Override
    public UserCreateResponseDTO toResponse(User user) {
        return new UserCreateResponseDTO(user.getId(), user.getName(), user.getEmail());
    }

}
