package io.github.brunoruandecastro.librian.extensions;

import io.github.brunoruandecastro.librian.dto.book.BookCreateRequestDTO;
import io.github.brunoruandecastro.librian.dto.book.BookCreateResponseDTO;
import io.github.brunoruandecastro.librian.entity.Book;
import io.github.brunoruandecastro.librian.enums.BookStatus;

import io.github.brunoruandecastro.librian.repository.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class BookMapper implements BaseMapper<BookCreateRequestDTO, Book, BookCreateResponseDTO> {


    private final UserMapper userMapper;

    public BookMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public Book toEntity(BookCreateRequestDTO dto) {
        Book book = new Book();
        book.setAuthor(dto.getAuthor());
        // book.setIsbn(dto.getIsbn());
        // book.setCoverUrl(dto.getCoverUrl());
        book.setPublisher(dto.getPublisher());
        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setYear(dto.getYear());
        //todo isso nao faz parte de map, já é regra de negócio
        if (dto.getStatus() != null)
            book.setStatus(BookStatus.OWNED);
        
        return book;
    }

    @Override
    public BookCreateResponseDTO toResponse(Book entity) {
        BookCreateResponseDTO res = new BookCreateResponseDTO();
        res.setId(entity.getId());
        res.setAuthor(entity.getAuthor());
        res.setIsbn(entity.getIsbn());
        res.setPublisher(entity.getPublisher());
        res.setTitle(entity.getTitle());
        res.setDescription(entity.getDescription());
        res.setCoverUrl(entity.getCoverUrl());
        res.setYear(entity.getYear());
        // res.setUser(userMapper.toResponse(entity.getUser()));
        res.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        return res;
    }

}
