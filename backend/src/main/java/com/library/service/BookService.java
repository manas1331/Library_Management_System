package com.library.service;

import com.library.model.Book;
import com.library.model.BookItem;
import com.library.model.BookItemBuilder;
import com.library.model.BookStatus;
import com.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Random;
import java.util.stream.Collectors;

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
        for (Book book : getAllBooks()) {
            for (BookItem item : book.getBookItems()) {
                if (item.getBarcode().equals(barcode)) {
                    item.setStatus(status);
                    updateBook(book);
                    return true;
                }
            }
        }
        return false;
    }
    
    public Book updateBookItemQuantity(String bookId, int quantity, String operation) {
        Optional<Book> bookOpt = bookRepository.findById(bookId);
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            
            if (operation.equals("increase")) {
                // Add new book items with generated barcodes
                for (int i = 0; i < quantity; i++) {
                    String barcode = generateUniqueBarcode(book);
                    BookItem bookItem = new BookItemBuilder()
                        .withBarcode(barcode)
                        .withReferenceOnly(false)
                        .withPrice(0.0) // Default price
                        .withFormat("Paperback") // Default format
                        .withDateOfPurchase(new Date())
                        .withRack("General") // Default rack
                        .build();
                    book.addBookItem(bookItem);
                }
            } else if (operation.equals("decrease")) {
                // Remove book items that are available (not loaned or reserved)
                List<BookItem> bookItems = book.getBookItems();
                int availableCount = (int) bookItems.stream()
                    .filter(item -> item.getStatus() == BookStatus.AVAILABLE)
                    .count();
                
                // Can't remove more than available
                int toRemove = Math.min(quantity, availableCount);
                
                // Sort available items by barcode for deterministic removal
                List<BookItem> availableItems = bookItems.stream()
                    .filter(item -> item.getStatus() == BookStatus.AVAILABLE)
                    .sorted(Comparator.comparing(BookItem::getBarcode))
                    .collect(Collectors.toList());
                
                // Remove the calculated number of items
                List<BookItem> itemsToKeep = new ArrayList<>(bookItems);
                for (int i = 0; i < toRemove; i++) {
                    itemsToKeep.remove(availableItems.get(i));
                }
                
                book.setBookItems(itemsToKeep);
            }
            
            return bookRepository.save(book);
        }
        return null;
    }

    private String generateUniqueBarcode(Book book) {
        // Generate a unique barcode based on book ISBN and a timestamp
        return book.getIsbn() + "-" + System.currentTimeMillis() + "-" + 
               Math.abs(new Random().nextInt(1000));
    }
}

