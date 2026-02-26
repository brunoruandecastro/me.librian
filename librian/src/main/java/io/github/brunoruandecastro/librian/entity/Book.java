package io.github.brunoruandecastro.librian.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import io.github.brunoruandecastro.librian.config.UuidV7Generator;
import io.github.brunoruandecastro.librian.enums.BookStatus;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
public class Book {

    @Id
    @GeneratedValue(generator = "uuid-v7")
    @GenericGenerator(
    name = "uuid-v7",
    type = UuidV7Generator.class
    )
    @Column(updatable = false, nullable = false)
    private UUID id;

    private String title;

    // entity author
    private String author;

    private String description;

    private String isbn;

    private String publisher;

    @Enumerated(EnumType.STRING)
    private BookStatus status;

    private Integer year;

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
