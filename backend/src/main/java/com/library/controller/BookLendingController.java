package com.library.controller;

import com.library.facade.LibraryFacade;
import com.library.model.BookLending;
import com.library.model.Fine;
import com.library.service.BookLendingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api/lendings")
@CrossOrigin(origins = "*")
public class BookLendingController {
    
    @Autowired
    private LibraryFacade libraryFacade;

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
        
        boolean success = libraryFacade.checkoutBook(bookItemBarcode, memberId);
        if (success) {
            // Optionally, fetch and return the lending record via the service
            BookLending lending = bookLendingService.getLendingByBarcode(bookItemBarcode);
            return ResponseEntity.status(HttpStatus.CREATED).body(lending);
        }
        return ResponseEntity.badRequest().build();

    }
    
    @PostMapping("/return")
    public ResponseEntity<?> returnBook(@RequestBody Map<String, String> payload) {
        String bookItemBarcode = payload.get("bookItemBarcode");
        
        if (bookItemBarcode == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // First, check if there's an active lending
        BookLending lending = bookLendingService.getLendingByBarcode(bookItemBarcode);
        if (lending == null) {
            return ResponseEntity.badRequest().body("No active lending found for this book.");
        }
        
        // Process the return
        boolean success = libraryFacade.returnBook(bookItemBarcode);
        if (success) {
            // Check if a fine was created
            BookLending returnedLending = bookLendingService.getLendingById(lending.getId()).orElse(null);
            
            // Get any unpaid fine for this lending
            List<Fine> fines = bookLendingService.getFinesByBookItemBarcode(bookItemBarcode);
            Fine latestFine = fines.stream()
                .filter(fine -> !fine.isPaid())
                .findFirst()
                .orElse(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("lending", returnedLending);
            if (latestFine != null) {
                response.put("fine", latestFine);
                response.put("fineAmount", latestFine.getAmount());
            }
            
            return ResponseEntity.ok(response);
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

    @PostMapping("/test/return")
    public ResponseEntity<?> testReturnBook(@RequestBody Map<String, Object> payload) {
        String bookItemBarcode = (String) payload.get("bookItemBarcode");
        String referenceDateStr = (String) payload.get("referenceDate"); // "YYYY-MM-DD" format
        
        if (bookItemBarcode == null || referenceDateStr == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // First, check if there's an active lending
        BookLending lending = bookLendingService.getLendingByBarcode(bookItemBarcode);
        if (lending == null) {
            return ResponseEntity.badRequest().body("No active lending found for this book.");
        }
        
        try {
            // Convert reference date string to Date object
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date referenceDate = dateFormat.parse(referenceDateStr);
            
            // Process the return with the reference date
            BookLending returnedLending = bookLendingService.testReturnBook(bookItemBarcode, referenceDate);
            
            if (returnedLending != null) {
                // Get any unpaid fine for this lending
                List<Fine> fines = bookLendingService.getFinesByBookItemBarcode(bookItemBarcode);
                Fine latestFine = fines.stream()
                    .filter(fine -> !fine.isPaid())
                    .findFirst()
                    .orElse(null);
                
                Map<String, Object> response = new HashMap<>();
                response.put("lending", returnedLending);
                if (latestFine != null) {
                    response.put("fine", latestFine);
                    response.put("fineAmount", latestFine.getAmount());
                    response.put("daysOverdue", returnedLending.getDaysOverdue(referenceDate));
                }
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid date format: " + e.getMessage());
        }
    }
}

