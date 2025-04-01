package com.library.repository;

import com.library.model.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.Date;
import java.util.List;

public interface BookRepository extends MongoRepository<Book, String> {
    List<Book> findByTitle(String title);
    List<Book> findByAuthorsContaining(String author);
    List<Book> findBySubject(String subject);
    List<Book> findByPublicationDate(Date publicationDate);
    List<Book> findBooksByIsbn(String isbn);
    @Query("{'bookItems.barcode': ?0}")
    Book findByBookItemBarcode(String barcode);
}

