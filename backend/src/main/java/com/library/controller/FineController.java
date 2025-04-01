package com.library.controller;

import com.library.model.Fine;
import com.library.service.FineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/fines")
@CrossOrigin(origins = "*")
public class FineController {
    
    @Autowired
    private FineService fineService;
    
    @GetMapping
    public ResponseEntity<List<Fine>> getAllFines() {
        return ResponseEntity.ok(fineService.getAllFines());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Fine> getFineById(@PathVariable String id) {
        Optional<Fine> fine = fineService.getFineById(id);
        return fine.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Fine>> getFinesByMember(@PathVariable String memberId) {
        return ResponseEntity.ok(fineService.getFinesByMember(memberId));
    }
    
    @GetMapping("/member/{memberId}/unpaid")
    public ResponseEntity<List<Fine>> getUnpaidFinesByMember(@PathVariable String memberId) {
        return ResponseEntity.ok(fineService.getUnpaidFinesByMember(memberId));
    }
    
    @PostMapping
    public ResponseEntity<Fine> createFine(@RequestBody Map<String, Object> payload) {
        String bookItemBarcode = (String) payload.get("bookItemBarcode");
        String memberId = (String) payload.get("memberId");
        Double amount = Double.valueOf(payload.get("amount").toString());
        
        if (bookItemBarcode == null || memberId == null || amount == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Fine fine = fineService.createFine(bookItemBarcode, memberId, amount);
        return ResponseEntity.status(HttpStatus.CREATED).body(fine);
    }
    
    @PutMapping("/{id}/collect")
    public ResponseEntity<Void> collectFine(@PathVariable String id) {
        if (fineService.collectFine(id)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

