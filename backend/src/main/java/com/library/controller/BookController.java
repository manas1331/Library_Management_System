package com.library.controller;

import com.library.facade.LibraryFacade;
import com.library.model.Book;
import com.library.model.BookItem;
import com.library.model.BookItemBuilder;
import com.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.text.SimpleDateFormat;
import java.util.Map;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {
    
    @Autowired
    private BookService bookService;
    
    @Autowired
    private LibraryFacade libraryFacade;
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        Optional<Book> book = bookService.getBookById(id);
        return book.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String subject) {
        
        if (title != null && !title.isEmpty()) {
            return ResponseEntity.ok(bookService.searchByTitle(title));
        } else if (author != null && !author.isEmpty()) {
            return ResponseEntity.ok(bookService.searchByAuthor(author));
        } else if (subject != null && !subject.isEmpty()) {
            return ResponseEntity.ok(bookService.searchBySubject(subject));
        } else {
            return ResponseEntity.ok(bookService.getAllBooks());
        }
    }
    
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<Book> getBookByBarcode(@PathVariable String barcode) {
        Book book = bookService.findByBookItemBarcode(barcode);
        if (book != null) {
            return ResponseEntity.ok(book);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> addBook(@RequestBody Book book) {
        if (bookService.existsByIsbn(book.getIsbn())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A book with this ISBN already exists.");
        }
        Book addedBook = libraryFacade.addBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(addedBook);
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable String id, @RequestBody Book book) {
        if (bookService.getBookById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        book.setId(id);
        return ResponseEntity.ok(bookService.updateBook(book));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable String id) {
        if (bookService.getBookById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{id}/items")
public ResponseEntity<List<BookItem>> getBookItemsByBookId(@PathVariable String id) {
    Optional<Book> book = bookService.getBookById(id);
    if (book.isPresent()) {
        return ResponseEntity.ok(book.get().getBookItems());
    } else {
        return ResponseEntity.notFound().build();
    }
}
    @PostMapping("/{id}/items")
    public ResponseEntity<BookItem> addBookItem(@PathVariable String id, 
                                                @RequestBody Map<String, Object> payload) {
        try {
            String barcode = (String) payload.get("barcode");
            boolean isReferenceOnly = Boolean.parseBoolean(payload.get("isReferenceOnly").toString());
            double price = Double.parseDouble(payload.get("price").toString());
            String format = (String) payload.get("format");
            
            // Assume the date is provided as a String in "yyyy-MM-dd" format.
            String dateString = (String) payload.get("dateOfPurchase");
            Date dateOfPurchase = new SimpleDateFormat("yyyy-MM-dd").parse(dateString);
            
            String rack = (String) payload.get("rack");
            
            // Build the BookItem using BookItemBuilder.
            BookItem bookItem = new BookItemBuilder()
                    .withBarcode(barcode)
                    .withReferenceOnly(isReferenceOnly)
                    .withPrice(price)
                    .withFormat(format)
                    .withDateOfPurchase(dateOfPurchase)
                    .withRack(rack)
                    .build();
            
            // Delegate to the facade
            BookItem added = libraryFacade.addBookItem(id, bookItem);
            if (added != null) {
                return ResponseEntity.status(HttpStatus.CREATED).body(added);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

