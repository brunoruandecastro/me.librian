package io.github.brunoruandecastro.librian.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class GoogleBooksClientConfig {

    @Bean
    RestClient googleBooksRestClient(
            @Value("${librian.google-books.base-url}") String baseUrl) {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
}
