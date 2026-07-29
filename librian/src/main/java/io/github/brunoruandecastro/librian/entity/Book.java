package io.github.brunoruandecastro.librian.entity;

import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import io.github.brunoruandecastro.librian.config.UuidV7Generator;
import io.github.brunoruandecastro.librian.enums.BookStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
public class Book {

    @Id
    @GeneratedValue(generator = "uuid-v7")
    @GenericGenerator(name = "uuid-v7", type = UuidV7Generator.class)
    @Column(updatable = false, nullable = false)
    private UUID id;

    private String title;

    private String author;

    private String description;

    private String isbn;

    private String publisher;

    @Enumerated(EnumType.STRING)
    private BookStatus status;

    private Integer year;

    private Integer rating;

    private Integer pages;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String genre;

    private String language;

    @Column(name = "read_date")
    private LocalDate readDate;

    @Column(name = "cover_url")
    private String coverUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @Column(name = "updated_at", nullable = false)
    private Date updatedAt;

    @PrePersist
    void onCreate() {
        Date now = new Date();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = new Date();
    }
}
