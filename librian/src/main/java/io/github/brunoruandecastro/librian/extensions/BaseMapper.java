package io.github.brunoruandecastro.librian.extensions;

/*
 * @param <D> the domain type the repository manages
 * @param <E> the entity type the repository manages
 * @param <R> the response type the repository manages
 * @author Bruno Ruan
 */
public interface BaseMapper<D, E, R> {
    E toEntity(D dto);
    R toResponse(E entity);
}
