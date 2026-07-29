package io.github.brunoruandecastro.librian.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MagicLinkVerifyResponseDTO {
    private String email;
    private boolean emailVerified;
    private boolean hasPassword;
    private boolean needsPassword;
    /** Short-lived token to set password when needsPassword=true. */
    private String setupToken;
    /** Session JWT when user already has a password (magic-link login). */
    private String token;
    private AuthProfileResponseDTO user;
}
