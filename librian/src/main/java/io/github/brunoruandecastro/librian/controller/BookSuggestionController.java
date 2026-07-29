package io.github.brunoruandecastro.librian.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.github.brunoruandecastro.librian.dto.suggestion.BookSuggestionDTO;
import io.github.brunoruandecastro.librian.service.BookSuggestionService;

@RestController
@RequestMapping("/book-suggestions")
public class BookSuggestionController {

    private final BookSuggestionService bookSuggestionService;

    public BookSuggestionController(BookSuggestionService bookSuggestionService) {
        this.bookSuggestionService = bookSuggestionService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookSuggestionDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(bookSuggestionService.search(q));
    }

    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<List<BookSuggestionDTO>> byIsbn(@PathVariable String isbn) {
        return ResponseEntity.ok(bookSuggestionService.searchByIsbn(isbn));
    }

    @GetMapping("/title/{title}")
    public ResponseEntity<List<BookSuggestionDTO>> byTitle(@PathVariable String title) {
        return ResponseEntity.ok(bookSuggestionService.searchByTitle(title));
    }

    @GetMapping("/author/{author}")
    public ResponseEntity<List<BookSuggestionDTO>> byAuthor(@PathVariable String author) {
        return ResponseEntity.ok(bookSuggestionService.searchByAuthor(author));
    }

    @GetMapping("/details/{volumeId}")
    public ResponseEntity<BookSuggestionDTO> details(@PathVariable String volumeId) {
        return ResponseEntity.ok(bookSuggestionService.getDetails(volumeId));
    }

    @GetMapping("/smart")
    public ResponseEntity<List<BookSuggestionDTO>> smart(@RequestParam String q) {
        return ResponseEntity.ok(bookSuggestionService.smartSearch(q));
    }
}
