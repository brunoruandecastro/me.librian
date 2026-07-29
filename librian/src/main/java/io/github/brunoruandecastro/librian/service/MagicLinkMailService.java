package io.github.brunoruandecastro.librian.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.mail.internet.MimeMessage;

@Service
public class MagicLinkMailService {

    private static final Logger log = LoggerFactory.getLogger(MagicLinkMailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:}")
    private String mailFrom;

    @Value("${librian.magic-link.expose-in-response:true}")
    private boolean exposeInResponse;

    public MagicLinkMailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendMagicLink(String email, String magicLinkUrl) {
        if (!mailEnabled) {
            log.info("Mail disabled. Magic link for {}: {}", email, magicLinkUrl);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(email);
            helper.setSubject("Seu acesso ao Librian");
            helper.setText(buildBody(magicLinkUrl), true);
            mailSender.send(message);
            log.info("Magic link email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send magic link email to {}", email, e);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Não foi possível enviar o email de acesso. Tente novamente em instantes.");
        }
    }

    public boolean isExposeInResponse() {
        return exposeInResponse;
    }

    private String buildBody(String magicLinkUrl) {
        return """
                <div style="font-family: Georgia, serif; line-height: 1.6; color: #1a1208;">
                  <h2 style="margin-bottom: 8px;">Librian</h2>
                  <p>Use o link abaixo para confirmar seu email e entrar na sua biblioteca:</p>
                  <p style="margin: 24px 0;">
                    <a href="%s" style="background:#d4a574;color:#1a1208;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;">
                      Abrir magic link
                    </a>
                  </p>
                  <p style="font-size: 13px; color: #666;">Ou copie e cole no navegador:<br>%s</p>
                  <p style="font-size: 13px; color: #666;">O link expira em breve. Se você não solicitou, ignore este email.</p>
                </div>
                """.formatted(magicLinkUrl, magicLinkUrl);
    }
}
