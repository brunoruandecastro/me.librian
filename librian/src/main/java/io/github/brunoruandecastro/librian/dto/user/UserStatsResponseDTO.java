package io.github.brunoruandecastro.librian.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserStatsResponseDTO {
    private long totalBooks;
    private long readBooks;
    private long readingBooks;
    private long ownedBooks;
    private long wishlistBooks;
    private long donatingBooks;
    private long sellingBooks;
    private Double averageRating;
    private long pagesRead;
    private String joinDate;
}
