package io.github.brunoruandecastro.librian.dto.book;

// import io.github.brunoruandecastro.librian.dto.user.UserCreateResponseDTO;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.util.Date;

@Getter
@Setter
public class BookCreateResponseDTO {
    private UUID id;
    private String title;
    private String author;
    private String isbn;
    private String publisher;
    private Integer year;
    private String description;
    private String coverUrl;
    private String status;
    // private UserCreateResponseDTO user;
    private Date createdAt;
    private Date updatedAt;
}
