package io.github.brunoruandecastro.librian.dto.book;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookImportResultDTO {

    private int imported;
    private int failed;
    private List<BookCreateResponseDTO> books = new ArrayList<>();
    private List<RowError> errors = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RowError {
        private int row;
        private String message;
    }
}
