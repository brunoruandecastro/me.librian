package io.github.brunoruandecastro.librian.dto.suggestion.google;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleVolumeInfo {
    private String title;
    private String subtitle;
    private List<String> authors;
    private String publisher;
    private String publishedDate;
    private String description;
    private List<GoogleIndustryIdentifier> industryIdentifiers;
    private Integer pageCount;
    private List<String> categories;
    private Double averageRating;
    private Integer ratingsCount;
    private GoogleImageLinks imageLinks;
    private String language;
}
