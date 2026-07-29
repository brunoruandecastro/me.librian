package io.github.brunoruandecastro.librian.dto.suggestion;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookSuggestionDTO {
    private String volumeId;
    private String title;
    private String subtitle;
    private List<String> authors;
    /** Autores unidos por vírgula — pronto para o formulário de Book. */
    private String author;
    private String isbn;
    private String isbn10;
    private String isbn13;
    private String publisher;
    private Integer year;
    private String description;
    private String coverUrl;
    private Integer pages;
    private List<String> categories;
    /** Primeira categoria (ou união) — alinhado ao campo genre do Book. */
    private String genre;
    private String language;
    private Double averageRating;
    private Integer ratingsCount;
}
