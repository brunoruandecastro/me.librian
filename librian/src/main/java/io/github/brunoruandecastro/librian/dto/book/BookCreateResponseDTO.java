package io.github.brunoruandecastro.librian.dto.book;

import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookCreateResponseDTO {
    private UUID id;
    private String title;
    private String author;
    private String isbn;
    private String publisher;
    private Integer year;
    private String description;
    private String coverUrl;
    private String status;
    private Integer rating;
    private Integer pages;
    private String notes;
    private String genre;
    private String language;
    private LocalDate readDate;
    private UUID userId;
    private Date createdAt;
    private Date updatedAt;
}
