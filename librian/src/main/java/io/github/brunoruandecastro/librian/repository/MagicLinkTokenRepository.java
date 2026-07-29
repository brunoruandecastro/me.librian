package io.github.brunoruandecastro.librian.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.brunoruandecastro.librian.entity.MagicLinkToken;

public interface MagicLinkTokenRepository extends JpaRepository<MagicLinkToken, UUID> {
    Optional<MagicLinkToken> findByTokenHash(String tokenHash);
}
