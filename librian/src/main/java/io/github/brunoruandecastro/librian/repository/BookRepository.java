package io.github.brunoruandecastro.librian.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import io.github.brunoruandecastro.librian.entity.Book;
import io.github.brunoruandecastro.librian.enums.BookStatus;

public interface BookRepository extends JpaRepository<Book, UUID> {
    List<Book> findByUserId(UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, BookStatus status);

    @Query("""
            select b from Book b
            where b.user.id = :userId
              and (:status is null or b.status = :status)
              and (
                   :q is null or :q = ''
                   or lower(b.title) like lower(concat('%', cast(:q as string), '%'))
                   or lower(b.author) like lower(concat('%', cast(:q as string), '%'))
                   or lower(coalesce(b.publisher, '')) like lower(concat('%', cast(:q as string), '%'))
                   or lower(coalesce(b.isbn, '')) like lower(concat('%', cast(:q as string), '%'))
              )
            """)
    Page<Book> searchByUser(
            @Param("userId") UUID userId,
            @Param("status") BookStatus status,
            @Param("q") String q,
            Pageable pageable);

    @Query("select avg(b.rating) from Book b where b.user.id = :userId and b.rating is not null")
    Double averageRatingByUserId(@Param("userId") UUID userId);

    @Query("select coalesce(sum(b.pages), 0) from Book b where b.user.id = :userId and b.status = io.github.brunoruandecastro.librian.enums.BookStatus.READ")
    Long sumPagesReadByUserId(@Param("userId") UUID userId);
}
