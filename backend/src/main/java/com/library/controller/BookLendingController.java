package com.library.controller;

import com.library.model.BookLending;
import com.library.service.BookLendingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/lendings")
@CrossOrigin(origins = "*")
public class BookLendingController {
    
    @Autowired
    private BookLendingService bookLendingService;
    
    @GetMapping
    public ResponseEntity<List<BookLending>> getAllLendings() {
        return ResponseEntity.ok(bookLendingService.getAllLendings());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BookLending> getLendingById(@PathVariable String id) {
        Optional<BookLending> lending = bookLendingService.getLendingById(id);
        return lending.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<BookLending>> getLendingsByMember(@PathVariable String memberId) {
        return ResponseEntity.ok(bookLendingService.getLendingsByMember(memberId));
    }
    
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<BookLending> getLendingByBarcode(@PathVariable String barcode) {
        BookLending lending = bookLendingService.getLendingByBarcode(barcode);
        if (lending != null) {
            return ResponseEntity.ok(lending);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<BookLending> checkoutBook(@RequestBody Map<String, String> payload) {
        String bookItemBarcode = payload.get("bookItemBarcode");
        String memberId = payload.get("memberId");
        
        if (bookItemBarcode == null || memberId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        BookLending lending = bookLendingService.checkoutBook(bookItemBarcode, memberId);
        if (lending != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(lending);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/return")
    public ResponseEntity<BookLending> returnBook(@RequestBody Map<String, String> payload) {
        String bookItemBarcode = payload.get("bookItemBarcode");
        
        if (bookItemBarcode == null) {
            return ResponseEntity.badRequest().build();
        }
        
        BookLending lending = bookLendingService.returnBook(bookItemBarcode);
        if (lending != null) {
            return ResponseEntity.ok(lending);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/renew")
    public ResponseEntity<BookLending> renewBook(@RequestBody Map<String, String> payload) {
        String bookItemBarcode = payload.get("bookItemBarcode");
        String memberId = payload.get("memberId");
        
        if (bookItemBarcode == null || memberId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        BookLending lending = bookLendingService.renewBook(bookItemBarcode, memberId);
        if (lending != null) {
            return ResponseEntity.ok(lending);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}

