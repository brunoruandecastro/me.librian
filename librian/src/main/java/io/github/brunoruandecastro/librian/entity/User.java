package io.github.brunoruandecastro.librian.entity;

import java.util.Date;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import io.github.brunoruandecastro.librian.config.UuidV7Generator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
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
    @GenericGenerator(name = "uuid-v7", type = UuidV7Generator.class)
    @Column(updatable = false, nullable = false)
    private UUID id;

    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    private String picture;

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

    public boolean hasPassword() {
        return passwordHash != null && !passwordHash.isBlank();
    }
}
