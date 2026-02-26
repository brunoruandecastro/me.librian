package io.github.brunoruandecastro.librian.controller;

import io.github.brunoruandecastro.librian.dto.book.BookCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.book.BookCreateResponseDTO;
import io.github.brunoruandecastro.librian.service.BookService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;


@RestController
@RequestMapping("/book")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    public ResponseEntity<BookCreateResponseDTO> createBook(@RequestBody BookCreateRequestDTO bookRequest, @RequestParam UUID userId) {
        BookCreateResponseDTO bookResponse = bookService.registerBook(bookRequest, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(bookResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookCreateResponseDTO> getBookById(@Valid @PathVariable UUID id) {
        BookCreateResponseDTO book = bookService.getBookById(id);
        return ResponseEntity.ok(book);
    }

    @GetMapping
    public ResponseEntity<List<BookCreateResponseDTO>> getAllBooks() {
        List<BookCreateResponseDTO> books = bookService.getAllBooks();
        return ResponseEntity.ok(books);
    }

}
