package io.github.brunoruandecastro.librian.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.brunoruandecastro.librian.entity.Book;

public interface BookRepository extends JpaRepository<Book, UUID> {

}
