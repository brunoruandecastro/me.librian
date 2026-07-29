package io.github.brunoruandecastro.librian.entity;

import java.util.Date;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import io.github.brunoruandecastro.librian.config.UuidV7Generator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "magic_link_tokens")
@Getter
@Setter
@NoArgsConstructor
public class MagicLinkToken {

    @Id
    @GeneratedValue(generator = "uuid-v7")
    @GenericGenerator(name = "uuid-v7", type = UuidV7Generator.class)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Date expiresAt;

    @Column(name = "used_at")
    private Date usedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = new Date();
    }

    public boolean isExpired() {
        return expiresAt.before(new Date());
    }

    public boolean isUsed() {
        return usedAt != null;
    }
}
