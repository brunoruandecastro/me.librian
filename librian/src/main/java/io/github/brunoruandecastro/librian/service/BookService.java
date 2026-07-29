package io.github.brunoruandecastro.librian.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import io.github.brunoruandecastro.librian.adapter.BookXlsxAdapter;
import io.github.brunoruandecastro.librian.dto.book.BookCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.book.BookCreateResponseDTO;
import io.github.brunoruandecastro.librian.dto.book.BookImportResultDTO;
import io.github.brunoruandecastro.librian.dto.common.PageResponseDTO;
import io.github.brunoruandecastro.librian.entity.Book;
import io.github.brunoruandecastro.librian.entity.User;
import io.github.brunoruandecastro.librian.enums.BookStatus;
import io.github.brunoruandecastro.librian.extensions.BookMapper;
import io.github.brunoruandecastro.librian.repository.BookRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;
    private final UserService userService;
    private final BookXlsxAdapter bookXlsxAdapter;
    private final Validator validator;

    public BookService(
            BookRepository bookRepository,
            BookMapper bookMapper,
            UserService userService,
            BookXlsxAdapter bookXlsxAdapter,
            Validator validator) {
        this.bookRepository = bookRepository;
        this.bookMapper = bookMapper;
        this.userService = userService;
        this.bookXlsxAdapter = bookXlsxAdapter;
        this.validator = validator;
    }

    @Transactional
    public BookCreateResponseDTO registerBook(BookCreateRequestDTO bookCreateRequestDTO, UUID userId) {
        User user = userService.getById(userId);
        Book book = bookMapper.toEntity(bookCreateRequestDTO);
        book.setUser(user);
        return bookMapper.toResponse(bookRepository.save(book));
    }

    @Transactional(readOnly = true)
    public BookCreateResponseDTO getBookById(UUID id, UUID userId) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        assertOwnership(book, userId);
        return bookMapper.toResponse(book);
    }

    @Transactional
    public BookCreateResponseDTO updateBook(UUID id, UUID userId, BookCreateRequestDTO request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        assertOwnership(book, userId);
        bookMapper.apply(request, book);
        return bookMapper.toResponse(bookRepository.save(book));
    }

    @Transactional
    public void deleteBook(UUID id, UUID userId) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        assertOwnership(book, userId);
        bookRepository.delete(book);
    }

    @Transactional(readOnly = true)
    public List<BookCreateResponseDTO> getBooksByUser(UUID userId) {
        return bookRepository.findByUserId(userId).stream()
                .map(bookMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<BookCreateResponseDTO> getBooksPage(
            UUID userId,
            int page,
            int size,
            BookStatus status,
            String q) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        String query = q != null && !q.isBlank() ? q.trim() : null;

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Book> result = bookRepository.searchByUser(userId, status, query, pageable);
        return PageResponseDTO.from(result.map(bookMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public byte[] exportBooksXlsx(UUID userId) {
        return bookXlsxAdapter.export(getBooksByUser(userId));
    }

    @Transactional
    public BookImportResultDTO importBooksXlsx(MultipartFile file, UUID userId) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo XLSX é obrigatório");
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!filename.endsWith(".xlsx")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie um arquivo .xlsx");
        }

        byte[] content;
        try {
            content = file.getBytes();
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível ler o arquivo XLSX");
        }

        BookXlsxAdapter.ParsedImport parsed = bookXlsxAdapter.parseLenient(content);
        BookImportResultDTO result = new BookImportResultDTO();
        result.setErrors(new ArrayList<>(parsed.errors().stream()
                .map(e -> new BookImportResultDTO.RowError(e.row(), e.message()))
                .toList()));

        for (BookXlsxAdapter.ParsedRow parsedRow : parsed.rows()) {
            BookCreateRequestDTO request = parsedRow.book();
            Set<ConstraintViolation<BookCreateRequestDTO>> violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String message = violations.stream()
                        .map(ConstraintViolation::getMessage)
                        .collect(Collectors.joining("; "));
                result.getErrors().add(new BookImportResultDTO.RowError(parsedRow.row(), message));
                continue;
            }
            try {
                result.getBooks().add(registerBook(request, userId));
            } catch (RuntimeException ex) {
                String message = ex instanceof ResponseStatusException rse && rse.getReason() != null
                        ? rse.getReason()
                        : ex.getMessage();
                result.getErrors().add(new BookImportResultDTO.RowError(
                        parsedRow.row(),
                        message != null ? message : "Falha ao importar linha"));
            }
        }

        result.setImported(result.getBooks().size());
        result.setFailed(result.getErrors().size());
        return result;
    }

    private void assertOwnership(Book book, UUID userId) {
        if (book.getUser() == null || !book.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Book does not belong to user");
        }
    }
}
