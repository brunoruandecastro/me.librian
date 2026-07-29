package io.github.brunoruandecastro.librian.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MagicLinkResponseDTO {
    private String message;
    /** Present only when librian.magic-link.expose-in-response=true (local/dev). */
    private String magicLinkUrl;
}
