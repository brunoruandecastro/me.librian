package io.github.brunoruandecastro.librian.service;

import io.github.brunoruandecastro.librian.dto.user.UserCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.user.UserCreateResponseDTO;
import io.github.brunoruandecastro.librian.entity.User;
import io.github.brunoruandecastro.librian.extensions.UserMapper;
import io.github.brunoruandecastro.librian.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public UserCreateResponseDTO registerUser(UserCreateRequestDTO userCreateRequestDTO) {
        User user = userMapper.toEntity(userCreateRequestDTO);

        return userMapper.toResponse(userRepository.save(user));
    }

    public User getById(UUID id) {
        return userRepository.findById(id).orElseThrow();
    }
}
