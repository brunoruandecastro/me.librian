package io.github.brunoruandecastro.librian.adapter;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import io.github.brunoruandecastro.librian.dto.book.BookCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.book.BookCreateResponseDTO;
import io.github.brunoruandecastro.librian.enums.BookStatus;

/**
 * Única fonte de verdade do formato de planilha de livros (XLSX).
 * Export e import usam as mesmas colunas — ao adicionar um campo,
 * inclua-o em {@link #COLUMNS} e nos métodos {@link #toRow}/{@link #fromRow}.
 */
@Component
public class BookXlsxAdapter {

    /**
     * Ordem canônica. {@code key} é interno; {@code header} é o título em português no XLSX.
     * Título e Autor são obrigatórios no import.
     */
    public static final List<Column> COLUMNS = List.of(
            new Column("title", "Título"),
            new Column("author", "Autor"),
            new Column("isbn", "ISBN"),
            new Column("publisher", "Editora"),
            new Column("year", "Ano"),
            new Column("description", "Descrição"),
            new Column("coverUrl", "URL da capa"),
            new Column("status", "Status"),
            new Column("rating", "Avaliação"),
            new Column("pages", "Páginas"),
            new Column("notes", "Notas"),
            new Column("genre", "Gênero"),
            new Column("language", "Idioma"),
            new Column("readDate", "Data de leitura"));

    private static final String SHEET_NAME = "Biblioteca";
    private static final int BRAND_ROW = 0;
    private static final int SUBTITLE_ROW = 1;
    private static final int HEADER_ROW = 2;
    private static final int DATA_START_ROW = 3;

    // Paleta acolhedora (papel + cobre suave do Librian)
    private static final byte[] COLOR_PAPER = hex("f7f3ec");
    private static final byte[] COLOR_PAPER_ALT = hex("f1ebe1");
    private static final byte[] COLOR_BAND = hex("efe6d8");
    private static final byte[] COLOR_HEADER = hex("e6d5be");
    private static final byte[] COLOR_INK = hex("3d3429");
    private static final byte[] COLOR_MUTED = hex("7a7064");
    private static final byte[] COLOR_BORDER = hex("e2d7c8");

    private final DataFormatter dataFormatter = new DataFormatter(Locale.forLanguageTag("pt-BR"));
    private final Map<String, String> headerAliases = buildHeaderAliases();

    public byte[] export(List<BookCreateResponseDTO> books) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(SHEET_NAME);
            Styles styles = createStyles(workbook);

            createBrandRow(sheet, styles);
            createSubtitleRow(sheet, styles, books.size());
            createHeaderRow(sheet, styles);

            int rowIdx = DATA_START_ROW;
            boolean alt = false;
            for (BookCreateResponseDTO book : books) {
                Row row = sheet.createRow(rowIdx++);
                List<String> values = toRow(book);
                for (int c = 0; c < COLUMNS.size(); c++) {
                    Cell cell = row.createCell(c);
                    cell.setCellValue(values.get(c));
                    cell.setCellStyle(alt ? styles.dataAlt : styles.data);
                }
                alt = !alt;
            }

            sheet.setColumnWidth(0, 6500);
            for (int c = 1; c < COLUMNS.size(); c++) {
                sheet.autoSizeColumn(c);
                int width = sheet.getColumnWidth(c);
                sheet.setColumnWidth(c, Math.min(Math.max(width + 640, 3200), 16000));
            }

            sheet.createFreezePane(0, DATA_START_ROW);
            if (rowIdx > HEADER_ROW) {
                sheet.setAutoFilter(new CellRangeAddress(HEADER_ROW, Math.max(HEADER_ROW, rowIdx - 1), 0, COLUMNS.size() - 1));
            }
            sheet.setDisplayGridlines(false);

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao gerar XLSX");
        }
    }

    public ParsedImport parseLenient(byte[] content) {
        if (content == null || content.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo XLSX vazio");
        }

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(content))) {
            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
            if (sheet == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Planilha vazia");
            }

            int headerRowIndex = findHeaderRow(sheet);
            Map<String, Integer> columnIndex = resolveHeader(readRowCells(sheet.getRow(headerRowIndex)));

            List<ParsedRow> rows = new ArrayList<>();
            List<RowError> errors = new ArrayList<>();

            for (int r = headerRowIndex + 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || isBlankRow(row)) {
                    continue;
                }
                int excelRowNumber = r + 1;
                try {
                    rows.add(new ParsedRow(excelRowNumber, fromRow(readRowCells(row), columnIndex, excelRowNumber)));
                } catch (RuntimeException ex) {
                    String message = ex instanceof ResponseStatusException rse && rse.getReason() != null
                            ? rse.getReason()
                            : ex.getMessage();
                    errors.add(new RowError(excelRowNumber, message != null ? message : "Linha inválida"));
                }
            }

            return new ParsedImport(rows, errors);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Arquivo inválido. Envie um .xlsx exportado pelo Librian.");
        }
    }

    private void createBrandRow(Sheet sheet, Styles styles) {
        Row row = sheet.createRow(BRAND_ROW);
        row.setHeightInPoints(36);

        Cell brandCell = row.createCell(0);
        brandCell.setCellValue("Librian");
        brandCell.setCellStyle(styles.brand);
        for (int c = 1; c < COLUMNS.size(); c++) {
            Cell filler = row.createCell(c);
            filler.setCellStyle(styles.brand);
        }
        sheet.addMergedRegion(new CellRangeAddress(BRAND_ROW, BRAND_ROW, 0, COLUMNS.size() - 1));
    }

    private void createSubtitleRow(Sheet sheet, Styles styles, int bookCount) {
        Row row = sheet.createRow(SUBTITLE_ROW);
        row.setHeightInPoints(20);
        Cell cell = row.createCell(0);
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        cell.setCellValue("Sua biblioteca pessoal · " + bookCount + " livro(s) · exportado em " + date);
        cell.setCellStyle(styles.subtitle);
        for (int c = 1; c < COLUMNS.size(); c++) {
            Cell filler = row.createCell(c);
            filler.setCellStyle(styles.subtitle);
        }
        sheet.addMergedRegion(new CellRangeAddress(SUBTITLE_ROW, SUBTITLE_ROW, 0, COLUMNS.size() - 1));
    }

    private void createHeaderRow(Sheet sheet, Styles styles) {
        Row row = sheet.createRow(HEADER_ROW);
        row.setHeightInPoints(22);
        for (int c = 0; c < COLUMNS.size(); c++) {
            Cell cell = row.createCell(c);
            cell.setCellValue(COLUMNS.get(c).header());
            cell.setCellStyle(styles.header);
        }
    }

    private int findHeaderRow(Sheet sheet) {
        int maxScan = Math.min(sheet.getLastRowNum(), 15);
        for (int r = 0; r <= maxScan; r++) {
            List<String> cells = readRowCells(sheet.getRow(r));
            boolean hasTitle = cells.stream().anyMatch(v -> "title".equals(normalizeHeader(v)));
            boolean hasAuthor = cells.stream().anyMatch(v -> "author".equals(normalizeHeader(v)));
            if (hasTitle && hasAuthor) {
                return r;
            }
        }
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Cabeçalho inválido: colunas Título e Autor não encontradas. Esperado: "
                        + COLUMNS.stream().map(Column::header).reduce((a, b) -> a + ", " + b).orElse(""));
    }

    private List<String> readRowCells(Row row) {
        List<String> cells = new ArrayList<>();
        if (row == null) {
            return cells;
        }
        int last = Math.max(row.getLastCellNum(), COLUMNS.size());
        for (int c = 0; c < last; c++) {
            cells.add(readCellAsString(row.getCell(c)));
        }
        return cells;
    }

    private String readCellAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case BOOLEAN -> Boolean.toString(cell.getBooleanCellValue());
            case NUMERIC -> {
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    Date date = cell.getDateCellValue();
                    LocalDate localDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    yield localDate.toString();
                }
                double value = cell.getNumericCellValue();
                if (value == Math.rint(value) && !Double.isInfinite(value)) {
                    yield Long.toString((long) value);
                }
                yield dataFormatter.formatCellValue(cell);
            }
            case FORMULA -> dataFormatter.formatCellValue(cell);
            case BLANK -> "";
            default -> dataFormatter.formatCellValue(cell);
        };
    }

    private boolean isBlankRow(Row row) {
        for (int c = 0; c < COLUMNS.size(); c++) {
            String value = readCellAsString(row.getCell(c));
            if (value != null && !value.trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    List<String> toRow(BookCreateResponseDTO book) {
        return List.of(
                nullToEmpty(book.getTitle()),
                nullToEmpty(book.getAuthor()),
                nullToEmpty(book.getIsbn()),
                nullToEmpty(book.getPublisher()),
                book.getYear() != null ? book.getYear().toString() : "",
                nullToEmpty(book.getDescription()),
                nullToEmpty(book.getCoverUrl()),
                nullToEmpty(book.getStatus()),
                book.getRating() != null ? book.getRating().toString() : "",
                book.getPages() != null ? book.getPages().toString() : "",
                nullToEmpty(book.getNotes()),
                nullToEmpty(book.getGenre()),
                nullToEmpty(book.getLanguage()),
                book.getReadDate() != null ? book.getReadDate().toString() : "");
    }

    BookCreateRequestDTO fromRow(List<String> cells, Map<String, Integer> columnIndex, int rowNumber) {
        BookCreateRequestDTO dto = new BookCreateRequestDTO();

        dto.setTitle(required(cell(cells, columnIndex, "title"), "Título", rowNumber));
        dto.setAuthor(required(cell(cells, columnIndex, "author"), "Autor", rowNumber));
        dto.setIsbn(optional(cell(cells, columnIndex, "isbn")));
        dto.setPublisher(optional(cell(cells, columnIndex, "publisher")));
        dto.setDescription(optional(cell(cells, columnIndex, "description")));
        dto.setCoverUrl(optional(cell(cells, columnIndex, "coverUrl")));
        dto.setNotes(optional(cell(cells, columnIndex, "notes")));
        dto.setGenre(optional(cell(cells, columnIndex, "genre")));
        dto.setLanguage(optional(cell(cells, columnIndex, "language")));

        String yearRaw = optional(cell(cells, columnIndex, "year"));
        if (yearRaw != null) {
            try {
                dto.setYear(Integer.valueOf(yearRaw));
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Linha " + rowNumber + ": Ano inválido");
            }
        }

        String ratingRaw = optional(cell(cells, columnIndex, "rating"));
        if (ratingRaw != null) {
            try {
                dto.setRating(Integer.valueOf(ratingRaw));
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Linha " + rowNumber + ": Avaliação inválida");
            }
        }

        String pagesRaw = optional(cell(cells, columnIndex, "pages"));
        if (pagesRaw != null) {
            try {
                dto.setPages(Integer.valueOf(pagesRaw));
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Linha " + rowNumber + ": Páginas inválidas");
            }
        }

        String statusRaw = optional(cell(cells, columnIndex, "status"));
        if (statusRaw != null) {
            try {
                dto.setStatus(BookStatus.valueOf(statusRaw.trim().toUpperCase(Locale.ROOT)));
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Linha " + rowNumber + ": Status inválido (" + statusRaw + ")");
            }
        }

        String readDateRaw = optional(cell(cells, columnIndex, "readDate"));
        if (readDateRaw != null) {
            try {
                dto.setReadDate(LocalDate.parse(readDateRaw));
            } catch (DateTimeParseException ex) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Linha " + rowNumber + ": Data de leitura deve ser yyyy-MM-dd");
            }
        }

        return dto;
    }

    private Map<String, Integer> resolveHeader(List<String> headerCells) {
        Map<String, Integer> indexByKey = new LinkedHashMap<>();
        for (int i = 0; i < headerCells.size(); i++) {
            String key = normalizeHeader(headerCells.get(i));
            if (key != null) {
                indexByKey.putIfAbsent(key, i);
            }
        }

        for (String required : List.of("title", "author")) {
            if (!indexByKey.containsKey(required)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Cabeçalho inválido: coluna obrigatória ausente. Esperado: "
                                + COLUMNS.stream().map(Column::header).reduce((a, b) -> a + ", " + b).orElse(""));
            }
        }

        for (Column column : COLUMNS) {
            indexByKey.putIfAbsent(column.key(), -1);
        }
        return indexByKey;
    }

    private String normalizeHeader(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        String alias = headerAliases.get(trimmed.toLowerCase(Locale.ROOT));
        if (alias != null) {
            return alias;
        }
        // Aceita a própria key em inglês
        for (Column column : COLUMNS) {
            if (column.key().equalsIgnoreCase(trimmed)) {
                return column.key();
            }
        }
        return null;
    }

    private Map<String, String> buildHeaderAliases() {
        Map<String, String> aliases = new HashMap<>();
        for (Column column : COLUMNS) {
            aliases.put(column.header().toLowerCase(Locale.ROOT), column.key());
            aliases.put(column.key().toLowerCase(Locale.ROOT), column.key());
        }
        // Variações comuns
        aliases.put("titulo", "title");
        aliases.put("título", "title");
        aliases.put("url da capa", "coverUrl");
        aliases.put("url capa", "coverUrl");
        aliases.put("avaliacao", "rating");
        aliases.put("avaliação", "rating");
        aliases.put("paginas", "pages");
        aliases.put("páginas", "pages");
        aliases.put("genero", "genre");
        aliases.put("gênero", "genre");
        aliases.put("data de leitura", "readDate");
        aliases.put("data leitura", "readDate");
        return aliases;
    }

    private String cell(List<String> cells, Map<String, Integer> columnIndex, String column) {
        Integer idx = columnIndex.get(column);
        if (idx == null || idx < 0 || idx >= cells.size()) {
            return "";
        }
        return cells.get(idx);
    }

    private String required(String value, String columnLabel, int rowNumber) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Linha " + rowNumber + ": " + columnLabel + " é obrigatório");
        }
        return trimmed;
    }

    private String optional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private Styles createStyles(XSSFWorkbook workbook) {
        DefaultIndexedColorMap colorMap = new DefaultIndexedColorMap();

        XSSFFont brandFont = workbook.createFont();
        brandFont.setBold(true);
        brandFont.setFontHeightInPoints((short) 22);
        brandFont.setFontName("Calibri");
        brandFont.setColor(new XSSFColor(COLOR_INK, colorMap));

        XSSFFont subtitleFont = workbook.createFont();
        subtitleFont.setFontHeightInPoints((short) 10);
        subtitleFont.setFontName("Calibri");
        subtitleFont.setColor(new XSSFColor(COLOR_MUTED, colorMap));

        XSSFFont headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 11);
        headerFont.setFontName("Calibri");
        headerFont.setColor(new XSSFColor(COLOR_INK, colorMap));

        XSSFFont dataFont = workbook.createFont();
        dataFont.setFontHeightInPoints((short) 10);
        dataFont.setFontName("Calibri");
        dataFont.setColor(new XSSFColor(COLOR_INK, colorMap));

        XSSFCellStyle brand = workbook.createCellStyle();
        brand.setFont(brandFont);
        brand.setFillForegroundColor(new XSSFColor(COLOR_BAND, colorMap));
        brand.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        brand.setAlignment(HorizontalAlignment.LEFT);
        brand.setVerticalAlignment(VerticalAlignment.CENTER);
        applySoftBorder(brand, colorMap);

        XSSFCellStyle subtitle = workbook.createCellStyle();
        subtitle.setFont(subtitleFont);
        subtitle.setFillForegroundColor(new XSSFColor(COLOR_PAPER, colorMap));
        subtitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        subtitle.setAlignment(HorizontalAlignment.LEFT);
        subtitle.setVerticalAlignment(VerticalAlignment.CENTER);
        applySoftBorder(subtitle, colorMap);

        XSSFCellStyle header = workbook.createCellStyle();
        header.setFont(headerFont);
        header.setFillForegroundColor(new XSSFColor(COLOR_HEADER, colorMap));
        header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        header.setAlignment(HorizontalAlignment.CENTER);
        header.setVerticalAlignment(VerticalAlignment.CENTER);
        applySoftBorder(header, colorMap);

        XSSFCellStyle data = workbook.createCellStyle();
        data.setFont(dataFont);
        data.setFillForegroundColor(new XSSFColor(COLOR_PAPER, colorMap));
        data.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        data.setVerticalAlignment(VerticalAlignment.CENTER);
        data.setWrapText(true);
        applySoftBorder(data, colorMap);

        XSSFCellStyle dataAlt = workbook.createCellStyle();
        dataAlt.cloneStyleFrom(data);
        dataAlt.setFillForegroundColor(new XSSFColor(COLOR_PAPER_ALT, colorMap));
        dataAlt.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        return new Styles(brand, subtitle, header, data, dataAlt);
    }

    private void applySoftBorder(XSSFCellStyle style, DefaultIndexedColorMap colorMap) {
        XSSFColor border = new XSSFColor(COLOR_BORDER, colorMap);
        style.setBorderTop(BorderStyle.HAIR);
        style.setBorderBottom(BorderStyle.HAIR);
        style.setBorderLeft(BorderStyle.HAIR);
        style.setBorderRight(BorderStyle.HAIR);
        style.setTopBorderColor(border);
        style.setBottomBorderColor(border);
        style.setLeftBorderColor(border);
        style.setRightBorderColor(border);
    }

    private static byte[] hex(String value) {
        int rgb = Integer.parseInt(value, 16);
        return new byte[] {
                (byte) ((rgb >> 16) & 0xFF),
                (byte) ((rgb >> 8) & 0xFF),
                (byte) (rgb & 0xFF)
        };
    }

    public record Column(String key, String header) {
    }

    private record Styles(
            CellStyle brand,
            CellStyle subtitle,
            CellStyle header,
            CellStyle data,
            CellStyle dataAlt) {
    }

    public record RowError(int row, String message) {
    }

    public record ParsedRow(int row, BookCreateRequestDTO book) {
    }

    public record ParsedImport(List<ParsedRow> rows, List<RowError> errors) {
    }
}
