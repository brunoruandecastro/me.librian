package io.github.brunoruandecastro.librian.service;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import io.github.brunoruandecastro.librian.dto.user.UserCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.user.UserCreateResponseDTO;
import io.github.brunoruandecastro.librian.dto.user.UserStatsResponseDTO;
import io.github.brunoruandecastro.librian.entity.User;
import io.github.brunoruandecastro.librian.enums.BookStatus;
import io.github.brunoruandecastro.librian.extensions.UserMapper;
import io.github.brunoruandecastro.librian.repository.BookRepository;
import io.github.brunoruandecastro.librian.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final BookRepository bookRepository;

    public UserService(UserRepository userRepository, UserMapper userMapper, BookRepository bookRepository) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.bookRepository = bookRepository;
    }

    public UserCreateResponseDTO registerUser(UserCreateRequestDTO userCreateRequestDTO) {
        User user = userMapper.toEntity(userCreateRequestDTO);
        return userMapper.toResponse(userRepository.save(user));
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public UserStatsResponseDTO getStats(UUID userId) {
        User user = getById(userId);
        String joinDate = user.getCreatedAt()
                .toInstant()
                .atZone(ZoneOffset.UTC)
                .toLocalDate()
                .format(DateTimeFormatter.ISO_LOCAL_DATE);

        Double averageRating = bookRepository.averageRatingByUserId(userId);
        Long pagesRead = bookRepository.sumPagesReadByUserId(userId);

        return new UserStatsResponseDTO(
                bookRepository.countByUserId(userId),
                bookRepository.countByUserIdAndStatus(userId, BookStatus.READ),
                bookRepository.countByUserIdAndStatus(userId, BookStatus.READING)
                        + bookRepository.countByUserIdAndStatus(userId, BookStatus.PAUSED_READING),
                bookRepository.countByUserIdAndStatus(userId, BookStatus.OWNED),
                bookRepository.countByUserIdAndStatus(userId, BookStatus.WISHLIST),
                bookRepository.countByUserIdAndStatus(userId, BookStatus.DONATING),
                bookRepository.countByUserIdAndStatus(userId, BookStatus.SELLING),
                averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : null,
                pagesRead != null ? pagesRead : 0L,
                joinDate);
    }
}
