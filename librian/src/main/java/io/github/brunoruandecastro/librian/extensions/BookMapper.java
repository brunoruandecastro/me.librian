package io.github.brunoruandecastro.librian.extensions;

import org.springframework.stereotype.Component;

import io.github.brunoruandecastro.librian.dto.book.BookCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.book.BookCreateResponseDTO;
import io.github.brunoruandecastro.librian.entity.Book;
import io.github.brunoruandecastro.librian.enums.BookStatus;

@Component
public class BookMapper implements BaseMapper<BookCreateRequestDTO, Book, BookCreateResponseDTO> {

    @Override
    public Book toEntity(BookCreateRequestDTO dto) {
        Book book = new Book();
        apply(dto, book);
        return book;
    }

    public void apply(BookCreateRequestDTO dto, Book book) {
        book.setAuthor(blankToNull(dto.getAuthor()));
        book.setIsbn(blankToNull(dto.getIsbn()));
        book.setCoverUrl(blankToNull(dto.getCoverUrl()));
        book.setPublisher(blankToNull(dto.getPublisher()));
        book.setTitle(dto.getTitle());
        book.setDescription(blankToNull(dto.getDescription()));
        book.setYear(dto.getYear());
        book.setStatus(dto.getStatus() != null ? dto.getStatus() : BookStatus.OWNED);
        book.setRating(dto.getRating());
        book.setPages(dto.getPages());
        book.setNotes(blankToNull(dto.getNotes()));
        book.setGenre(blankToNull(dto.getGenre()));
        book.setLanguage(blankToNull(dto.getLanguage()));
        book.setReadDate(dto.getReadDate());
    }

    @Override
    public BookCreateResponseDTO toResponse(Book entity) {
        BookCreateResponseDTO res = new BookCreateResponseDTO();
        res.setId(entity.getId());
        res.setAuthor(entity.getAuthor());
        res.setIsbn(entity.getIsbn());
        res.setPublisher(entity.getPublisher());
        res.setTitle(entity.getTitle());
        res.setDescription(entity.getDescription());
        res.setCoverUrl(entity.getCoverUrl());
        res.setYear(entity.getYear());
        res.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        res.setRating(entity.getRating());
        res.setPages(entity.getPages());
        res.setNotes(entity.getNotes());
        res.setGenre(entity.getGenre());
        res.setLanguage(entity.getLanguage());
        res.setReadDate(entity.getReadDate());
        res.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
