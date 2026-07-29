package io.github.brunoruandecastro.librian.dto.suggestion.google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleImageLinks {
    private String smallThumbnail;
    private String thumbnail;
    private String small;
    private String medium;
    private String large;
    private String extraLarge;
}
