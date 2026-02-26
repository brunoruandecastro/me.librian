package io.github.brunoruandecastro.librian.entity;

import java.util.Date;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import io.github.brunoruandecastro.librian.config.UuidV7Generator;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(generator = "uuid-v7")
    @GenericGenerator(
    name = "uuid-v7",
    type = UuidV7Generator.class
    )
    @Column(updatable = false, nullable = false)
    private UUID id;
    private String name;
    private String email;
    
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
