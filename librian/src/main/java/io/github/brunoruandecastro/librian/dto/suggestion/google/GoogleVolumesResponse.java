package io.github.brunoruandecastro.librian.dto.suggestion.google;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleVolumesResponse {
    private Integer totalItems;
    private List<GoogleVolumeItem> items;
}
