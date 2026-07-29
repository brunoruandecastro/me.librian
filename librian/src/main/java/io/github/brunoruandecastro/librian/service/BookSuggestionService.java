package io.github.brunoruandecastro.librian.service;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import io.github.brunoruandecastro.librian.dto.suggestion.BookSuggestionDTO;
import io.github.brunoruandecastro.librian.dto.suggestion.google.GoogleImageLinks;
import io.github.brunoruandecastro.librian.dto.suggestion.google.GoogleIndustryIdentifier;
import io.github.brunoruandecastro.librian.dto.suggestion.google.GoogleVolumeInfo;
import io.github.brunoruandecastro.librian.dto.suggestion.google.GoogleVolumeItem;
import io.github.brunoruandecastro.librian.dto.suggestion.google.GoogleVolumesResponse;
import io.github.brunoruandecastro.librian.gateway.GoogleBooksGateway;

/**
 * Normaliza o payload do Google Books para {@link BookSuggestionDTO}
 * e aplica a busca "smart" (ISBN quando o termo parecer ISBN).
 */
@Service
public class BookSuggestionService {

    /** ISBN-10 ou ISBN-13 (com ou sem hífens/espaços). */
    private static final Pattern ISBN_PATTERN = Pattern.compile(
            "^(97[89])?\\d{9}[\\dX]$",
            Pattern.CASE_INSENSITIVE);

    private final GoogleBooksGateway googleBooksGateway;

    public BookSuggestionService(GoogleBooksGateway googleBooksGateway) {
        this.googleBooksGateway = googleBooksGateway;
    }

    public List<BookSuggestionDTO> search(String query) {
        return mapList(googleBooksGateway.search(query));
    }

    public List<BookSuggestionDTO> searchByIsbn(String isbn) {
        return mapList(googleBooksGateway.searchByIsbn(isbn));
    }

    public List<BookSuggestionDTO> searchByTitle(String title) {
        return mapList(googleBooksGateway.searchByTitle(title));
    }

    public List<BookSuggestionDTO> searchByAuthor(String author) {
        return mapList(googleBooksGateway.searchByAuthor(author));
    }

    public BookSuggestionDTO getDetails(String volumeId) {
        GoogleVolumeItem item = googleBooksGateway.getVolume(volumeId);
        if (item == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Volume not found");
        }
        return toSuggestion(item);
    }

    /**
     * Se {@code q} parecer ISBN, busca por ISBN; caso contrário, busca livre.
     */
    public List<BookSuggestionDTO> smartSearch(String query) {
        if (!StringUtils.hasText(query)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Query is required");
        }
        String trimmed = query.trim();
        if (looksLikeIsbn(trimmed)) {
            return searchByIsbn(trimmed);
        }
        return search(trimmed);
    }

    static boolean looksLikeIsbn(String raw) {
        if (!StringUtils.hasText(raw)) {
            return false;
        }
        String normalized = raw.replaceAll("[\\s-]", "").toUpperCase(Locale.ROOT);
        return ISBN_PATTERN.matcher(normalized).matches();
    }

    private List<BookSuggestionDTO> mapList(GoogleVolumesResponse response) {
        if (response == null || response.getItems() == null || response.getItems().isEmpty()) {
            return Collections.emptyList();
        }
        return response.getItems().stream()
                .map(this::toSuggestion)
                .collect(Collectors.toList());
    }

    BookSuggestionDTO toSuggestion(GoogleVolumeItem item) {
        BookSuggestionDTO dto = new BookSuggestionDTO();
        if (item == null) {
            return dto;
        }
        dto.setVolumeId(item.getId());

        GoogleVolumeInfo info = item.getVolumeInfo();
        if (info == null) {
            return dto;
        }

        dto.setTitle(truncate(info.getTitle(), 150));
        dto.setSubtitle(info.getSubtitle());
        dto.setAuthors(info.getAuthors());
        dto.setAuthor(truncate(joinAuthors(info.getAuthors()), 120));
        dto.setPublisher(truncate(info.getPublisher(), 120));
        dto.setYear(parseYear(info.getPublishedDate()));
        dto.setDescription(truncate(stripHtml(info.getDescription()), 1000));
        dto.setPages(normalizePages(info.getPageCount()));
        dto.setCategories(info.getCategories());
        dto.setGenre(truncate(firstCategory(info.getCategories()), 120));
        dto.setLanguage(truncate(info.getLanguage(), 80));
        dto.setAverageRating(info.getAverageRating());
        dto.setRatingsCount(info.getRatingsCount());
        dto.setCoverUrl(resolveCoverUrl(info.getImageLinks()));

        applyIsbns(dto, info.getIndustryIdentifiers());
        return dto;
    }

    private static void applyIsbns(BookSuggestionDTO dto, List<GoogleIndustryIdentifier> identifiers) {
        if (identifiers == null) {
            return;
        }
        String isbn10 = null;
        String isbn13 = null;
        for (GoogleIndustryIdentifier id : identifiers) {
            if (id == null || !StringUtils.hasText(id.getType()) || !StringUtils.hasText(id.getIdentifier())) {
                continue;
            }
            String type = id.getType().trim().toUpperCase(Locale.ROOT);
            String value = normalizeIsbn(id.getIdentifier());
            if ("ISBN_13".equals(type)) {
                isbn13 = value;
            } else if ("ISBN_10".equals(type)) {
                isbn10 = value;
            }
        }
        dto.setIsbn10(isbn10);
        dto.setIsbn13(isbn13);
        dto.setIsbn(isbn13 != null ? isbn13 : isbn10);
    }

    private static String normalizeIsbn(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        String normalized = raw.replaceAll("[\\s-]", "").toUpperCase(Locale.ROOT);
        return normalized.isEmpty() ? null : normalized;
    }

    private static Integer normalizePages(Integer pages) {
        if (pages == null || pages < 1) {
            return null;
        }
        return pages;
    }

    private static String firstCategory(List<String> categories) {
        if (categories == null || categories.isEmpty()) {
            return null;
        }
        return categories.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .findFirst()
                .orElse(null);
    }

    private static String stripHtml(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.replaceAll("(?is)<[^>]*>", " ")
                .replace("&nbsp;", " ")
                .replace("&amp;", "&")
                .replace("&quot;", "\"")
                .replace("&#39;", "'")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static String truncate(String value, int max) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.length() <= max) {
            return trimmed;
        }
        return trimmed.substring(0, max).trim();
    }

    private static String resolveCoverUrl(GoogleImageLinks links) {
        if (links == null) {
            return null;
        }
        String url = firstNonBlank(
                links.getExtraLarge(),
                links.getLarge(),
                links.getMedium(),
                links.getThumbnail(),
                links.getSmall(),
                links.getSmallThumbnail());
        return preferHttps(url);
    }

    private static String preferHttps(String url) {
        if (url == null) {
            return null;
        }
        if (url.startsWith("http://")) {
            return "https://" + url.substring("http://".length());
        }
        return url;
    }

    private static Integer parseYear(String publishedDate) {
        if (!StringUtils.hasText(publishedDate) || publishedDate.length() < 4) {
            return null;
        }
        try {
            return Integer.valueOf(publishedDate.substring(0, 4));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String joinAuthors(List<String> authors) {
        if (authors == null || authors.isEmpty()) {
            return null;
        }
        return authors.stream()
                .filter(StringUtils::hasText)
                .map(a -> a.trim())
                .collect(Collectors.joining(", "));
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }
}
