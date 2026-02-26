package io.github.brunoruandecastro.librian.service;

import java.util.List;
import java.util.UUID;

import io.github.brunoruandecastro.librian.dto.book.BookCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.book.BookCreateResponseDTO;
import io.github.brunoruandecastro.librian.entity.Book;
import io.github.brunoruandecastro.librian.entity.User;
import io.github.brunoruandecastro.librian.extensions.BookMapper;
import io.github.brunoruandecastro.librian.repository.BookRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;
    private final UserService userService;

    public BookService(BookRepository bookRepository, BookMapper bookMapper, UserService userService) {
        this.bookRepository = bookRepository;
        this.bookMapper = bookMapper;
        this.userService = userService;
    }

    public BookCreateResponseDTO registerBook(BookCreateRequestDTO bookCreateRequestDTO, UUID userId) {
        User user = userService.getById(userId);
        Book book = bookMapper.toEntity(bookCreateRequestDTO);
        book.setUser(user);

        return bookMapper.toResponse(bookRepository.save(book));
    }

    public BookCreateResponseDTO getBookById(UUID id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));

        return bookMapper.toResponse(book);
    }

    public List<BookCreateResponseDTO> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(bookMapper::toResponse)
                .toList();
    }

}
