package com.library.controller;

import com.library.model.BookReservation;
import com.library.service.BookReservationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class BookReservationController {
    
    @Autowired
    private BookReservationService bookReservationService;
    

    @GetMapping
    public ResponseEntity<List<BookReservation>> getAllReservations() {
        return ResponseEntity.ok(bookReservationService.getAllReservations());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BookReservation> getReservationById(@PathVariable String id) {
        Optional<BookReservation> reservation = bookReservationService.getReservationById(id);
        return reservation.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<BookReservation>> getReservationsByMember(@PathVariable String memberId) {
        return ResponseEntity.ok(bookReservationService.getReservationsByMember(memberId));
    }
    
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<BookReservation> getReservationByBarcode(@PathVariable String barcode) {
        BookReservation reservation = bookReservationService.getReservationByBarcode(barcode);
        if (reservation != null) {
            return ResponseEntity.ok(reservation);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/reserve")
public ResponseEntity<BookReservation> reserveBook(@RequestBody Map<String, String> payload) {
    String bookItemBarcode = payload.get("bookItemBarcode");
    String memberId = payload.get("memberId");
    
    if (bookItemBarcode == null || memberId == null) {
        return ResponseEntity.badRequest().build();
    }
    
    BookReservation reservation = bookReservationService.reserveBook(bookItemBarcode, memberId);
    if (reservation != null) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    } else {
        // Could provide more specific error information
        return ResponseEntity.badRequest().body(null);
    }
}
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelReservation(@PathVariable String id) {
        if (bookReservationService.cancelReservation(id)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/complete")
    public ResponseEntity<Void> completeReservation(@PathVariable String id) {
        if (bookReservationService.completeReservation(id)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

