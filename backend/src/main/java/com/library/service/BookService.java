package com.library.service;

import com.library.model.Book;
import com.library.model.BookItem;
import com.library.model.BookStatus;
import com.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    public Optional<Book> getBookById(String id) {
        return bookRepository.findById(id);
    }
    public boolean existsByIsbn(String isbn) {
        return !findBooksByIsbn(isbn).isEmpty();
    }

    public List<Book> findBooksByIsbn(String isbn) {
        return bookRepository.findBooksByIsbn(isbn); // Assuming BookRepository has a method findByIsbn
    }
    public List<Book> searchByTitle(String title) {
        return bookRepository.findByTitle(title);
    }
    
    public List<Book> searchByAuthor(String author) {
        return bookRepository.findByAuthorsContaining(author);
    }
    
    public List<Book> searchBySubject(String subject) {
        return bookRepository.findBySubject(subject);
    }
    
    public List<Book> searchByPublicationDate(Date publicationDate) {
        return bookRepository.findByPublicationDate(publicationDate);
    }
    
    public Book findByBookItemBarcode(String barcode) {
        return bookRepository.findByBookItemBarcode(barcode);
    }
    
    public Book addBook(Book book) {
        return bookRepository.save(book);
    }
    
    public Book updateBook(Book book) {
        return bookRepository.save(book);
    }
    
    public void deleteBook(String id) {
        bookRepository.deleteById(id);
    }
    
    public BookItem addBookItem(String bookId, BookItem bookItem) {
        Optional<Book> bookOpt = bookRepository.findById(bookId);
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            book.addBookItem(bookItem);
            bookRepository.save(book);
            return bookItem;
        }
        return null;
    }
    
    public boolean updateBookItemStatus(String barcode, BookStatus status) {
        Book book = bookRepository.findByBookItemBarcode(barcode);
        if (book != null) {
            for (BookItem item : book.getBookItems()) {
                if (item.getBarcode().equals(barcode)) {
                    item.setStatus(status);
                    bookRepository.save(book);
                    return true;
                }
            }
        }
        return false;
    }
}

