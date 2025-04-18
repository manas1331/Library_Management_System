package com.library.controller;

import com.library.facade.LibraryFacade;
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
    private LibraryFacade libraryFacade;
    
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
    
    @PostMapping("/create")
    public ResponseEntity<Fine> createFine(@RequestBody Map<String, Object> payload) {
        String bookItemBarcode = (String) payload.get("bookItemBarcode");
        String memberId = (String) payload.get("memberId");
        Double amount = Double.valueOf(payload.get("amount").toString());
        
        if (bookItemBarcode == null || memberId == null || amount == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // Delegate fine creation to the facade
        Fine fine = libraryFacade.createFine(bookItemBarcode, memberId, amount);
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
    
    @PostMapping("/book/{barcode}/pay")
    public ResponseEntity<?> payFineByBarcode(@PathVariable String barcode) {
        List<Fine> fines = fineService.getFinesByBookItemBarcode(barcode);
        Fine unpaidFine = fines.stream()
                .filter(fine -> !fine.isPaid())
                .findFirst()
                .orElse(null);
                
        if (unpaidFine == null) {
            return ResponseEntity.notFound().build();
        }
        
        if (fineService.collectFine(unpaidFine.getId())) {
            return ResponseEntity.ok(unpaidFine);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process fine payment");
        }
    }
}

