package io.github.brunoruandecastro.librian.dto.book;

import io.github.brunoruandecastro.librian.dto.user.UserCreateRequestDTO;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

import io.github.brunoruandecastro.librian.enums.BookStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Getter
@Setter
public class BookCreateRequestDTO {

 
    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must have at most 150 characters")
    private String title;

    @NotBlank(message = "Author is required")
    @Size(max = 120, message = "Author must have at most 120 characters")
    private String author;

    @NotBlank(message = "ISBN is required")
    @Pattern(
        regexp = "^(97[89])?\\d{9}[\\dX]$",
        message = "ISBN must be a valid ISBN-10 or ISBN-13"
    )
    private String isbn;

    @Size(max = 120, message = "Publisher must have at most 120 characters")
    private String publisher;

    @NotNull(message = "Year is required")
    @Min(value = 1450, message = "Year must be greater than 1450")
    @Max(value = 2100, message = "Year must be less than or equal to 2100")
    private Integer year;

    @Size(max = 1000, message = "Description must have at most 1000 characters")
    private String description;

    @Pattern(
        regexp = "^(http|https)://.*$",
        message = "Cover URL must be a valid URL"
    )
    private String coverUrl;

    @NotNull(message = "Status is required")
    private BookStatus status;

    @NotNull(message = "User is required")
    private UUID userId;

}
