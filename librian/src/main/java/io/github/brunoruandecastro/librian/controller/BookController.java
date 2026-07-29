package io.github.brunoruandecastro.librian.controller;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.github.brunoruandecastro.librian.config.SecurityUtils;
import io.github.brunoruandecastro.librian.dto.book.BookCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.book.BookCreateResponseDTO;
import io.github.brunoruandecastro.librian.dto.book.BookImportResultDTO;
import io.github.brunoruandecastro.librian.dto.common.PageResponseDTO;
import io.github.brunoruandecastro.librian.enums.BookStatus;
import io.github.brunoruandecastro.librian.service.BookService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/books")
public class BookController {

    private static final MediaType XLSX = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    public ResponseEntity<BookCreateResponseDTO> createBook(@Valid @RequestBody BookCreateRequestDTO bookRequest) {
        UUID userId = SecurityUtils.currentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.registerBook(bookRequest, userId));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportBooksXlsx() {
        byte[] xlsx = bookService.exportBooksXlsx(SecurityUtils.currentUserId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"librian-books.xlsx\"")
                .contentType(XLSX)
                .body(xlsx);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookImportResultDTO> importBooksXlsx(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(bookService.importBooksXlsx(file, SecurityUtils.currentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookCreateResponseDTO> getBookById(@PathVariable UUID id) {
        return ResponseEntity.ok(bookService.getBookById(id, SecurityUtils.currentUserId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookCreateResponseDTO> updateBook(
            @PathVariable UUID id,
            @Valid @RequestBody BookCreateRequestDTO bookRequest) {
        return ResponseEntity.ok(bookService.updateBook(id, SecurityUtils.currentUserId(), bookRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable UUID id) {
        bookService.deleteBook(id, SecurityUtils.currentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<BookCreateResponseDTO>> getBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) BookStatus status,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(
                bookService.getBooksPage(SecurityUtils.currentUserId(), page, size, status, q));
    }
}
