package com.library.controller;

import com.library.model.Book;
import com.library.model.BookItem;
import com.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {
    
    @Autowired
    private BookService bookService;
    
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
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookService.addBook(book));
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
    
    @PostMapping("/{id}/items")
    public ResponseEntity<BookItem> addBookItem(@PathVariable String id, @RequestBody BookItem bookItem) {
        BookItem added = bookService.addBookItem(id, bookItem);
        if (added != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(added);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

