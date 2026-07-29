package io.github.brunoruandecastro.librian.dto.suggestion.google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleIndustryIdentifier {
    private String type;
    private String identifier;
}
