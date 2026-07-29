package io.github.brunoruandecastro.librian.gateway;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import io.github.brunoruandecastro.librian.dto.suggestion.google.GoogleVolumeItem;
import io.github.brunoruandecastro.librian.dto.suggestion.google.GoogleVolumesResponse;

/**
 * Cliente HTTP para a Google Books API ({@code https://www.googleapis.com/books/v1}).
 * Encapsula apenas I/O externo — sem regra de domínio.
 */
@Component
public class GoogleBooksGateway {

    private final RestClient restClient;
    private final String apiKey;
    private final int defaultMaxResults;

    public GoogleBooksGateway(
            @Qualifier("googleBooksRestClient") RestClient restClient,
            @Value("${librian.google-books.api-key:}") String apiKey,
            @Value("${librian.google-books.max-results:12}") int defaultMaxResults) {
        this.restClient = restClient;
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.defaultMaxResults = defaultMaxResults;
        if (StringUtils.hasText(this.apiKey) && !looksLikeApiKey(this.apiKey)) {
            throw new IllegalStateException(
                    "librian.google-books.api-key seems invalid. Use a Google API Key (starts with AIza), "
                            + "not an OAuth Client ID or Client Secret (GOCSPX-...).");
        }
    }

    public GoogleVolumesResponse search(String query) {
        return search(query, defaultMaxResults);
    }

    public GoogleVolumesResponse search(String query, int maxResults) {
        if (!StringUtils.hasText(query)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Query is required");
        }
        int capped = Math.min(Math.max(maxResults, 1), 40);
        try {
            GoogleVolumesResponse body = restClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/volumes")
                                .queryParam("q", query.trim())
                                .queryParam("maxResults", capped);
                        appendApiKey(uriBuilder);
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        throw googleError(response.getStatusCode(), response.getBody());
                    })
                    .body(GoogleVolumesResponse.class);
            return body != null ? body : emptyResponse();
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to reach Google Books API",
                    ex);
        }
    }

    public GoogleVolumesResponse searchByIsbn(String isbn) {
        return search("isbn:" + normalizeIsbn(isbn));
    }

    public GoogleVolumesResponse searchByTitle(String title) {
        requireText(title, "Title is required");
        return search("intitle:" + title.trim());
    }

    public GoogleVolumesResponse searchByAuthor(String author) {
        requireText(author, "Author is required");
        return search("inauthor:" + author.trim());
    }

    public GoogleVolumeItem getVolume(String volumeId) {
        requireText(volumeId, "Volume id is required");
        try {
            return restClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/volumes/{volumeId}");
                        appendApiKey(uriBuilder);
                        return uriBuilder.build(volumeId.trim());
                    })
                    .retrieve()
                    .onStatus(status -> status.value() == 404, (request, response) -> {
                        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Volume not found");
                    })
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        throw googleError(response.getStatusCode(), response.getBody());
                    })
                    .body(GoogleVolumeItem.class);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to reach Google Books API",
                    ex);
        }
    }

    private void appendApiKey(org.springframework.web.util.UriBuilder uriBuilder) {
        if (StringUtils.hasText(apiKey)) {
            uriBuilder.queryParam("key", apiKey);
        }
    }

    private static boolean looksLikeApiKey(String value) {
        // API Keys começam com AIza. Client Secret = GOCSPX-..., Client ID = *.apps.googleusercontent.com
        return value.startsWith("AIza") && !value.startsWith("GOCSPX-")
                && !value.contains("apps.googleusercontent.com");
    }

    private static ResponseStatusException googleError(HttpStatusCode status, java.io.InputStream body) {
        String detail = readBodySnippet(body);
        String message = "Google Books API error: " + status.value();
        if (StringUtils.hasText(detail)) {
            message = message + " — " + detail;
        }
        if (status.value() == 400) {
            message = message + " (check API key: must be AIza..., not OAuth Client ID/Secret)";
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, message);
    }

    private static String readBodySnippet(java.io.InputStream body) {
        if (body == null) {
            return "";
        }
        try {
            byte[] bytes = body.readAllBytes();
            String raw = new String(bytes, StandardCharsets.UTF_8).trim().replaceAll("\\s+", " ");
            if (raw.length() > 240) {
                return raw.substring(0, 240) + "…";
            }
            return raw;
        } catch (IOException ex) {
            return "";
        }
    }

    private static String normalizeIsbn(String isbn) {
        requireText(isbn, "ISBN is required");
        return isbn.replaceAll("[\\s-]", "").trim();
    }

    private static void requireText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private static GoogleVolumesResponse emptyResponse() {
        GoogleVolumesResponse empty = new GoogleVolumesResponse();
        empty.setTotalItems(0);
        empty.setItems(java.util.List.of());
        return empty;
    }
}
