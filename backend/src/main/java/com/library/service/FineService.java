package com.library.service;

import com.library.model.BookLending;
import com.library.model.Fine;
import com.library.repository.FineRepository;
import com.library.service.fine.FineCalculatorFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class FineService {
    
    @Autowired
    private FineRepository fineRepository;
    
    @Autowired
    private FineCalculatorFactory fineCalculatorFactory;
    
    @Autowired
    private MemberService memberService;
    
    public List<Fine> getAllFines() {
        return fineRepository.findAll();
    }
    
    public Optional<Fine> getFineById(String id) {
        return fineRepository.findById(id);
    }
    
    public List<Fine> getFinesByMember(String memberId) {
        return fineRepository.findByMemberId(memberId);
    }
    
    public List<Fine> getUnpaidFinesByMember(String memberId) {
        return fineRepository.findByMemberIdAndPaidIsFalse(memberId);
    }
    
    public List<Fine> getFinesByBookItemBarcode(String barcode) {
        return fineRepository.findByBookItemBarcode(barcode);
    }
    
    public Fine createFine(String bookItemBarcode, String memberId, double amount) {
        Fine fine = new Fine(bookItemBarcode, memberId, amount);
        return fineRepository.save(fine);
    }
    
    /**
     * Calculate and create fine based on lending information
     * Uses the fine calculator adapter
     * 
     * @param lending BookLending record
     * @param returnDate The actual return date
     * @return The fine object if created, null if no fine
     */
    public Fine calculateAndCreateFine(BookLending lending, Date returnDate) {
        if (lending == null || !returnDate.after(lending.getDueDate())) {
            return null; // No fine if returned on time
        }
        
        // Use the fine calculator adapter
        double fineAmount = fineCalculatorFactory
            .getFineCalculator()
            .calculateFine(lending, returnDate);
        
        if (fineAmount > 0) {
            Fine fine = new Fine(lending.getBookItemBarcode(), lending.getMemberId(), fineAmount);
            fine.setCreationDate(returnDate); // Use the provided return date
            return fineRepository.save(fine);
        }
        
        return null;
    }
    
    public boolean collectFine(String fineId) {
        Optional<Fine> fineOpt = fineRepository.findById(fineId);
        if (fineOpt.isPresent()) {
            Fine fine = fineOpt.get();
            fine.collectPayment();
            fineRepository.save(fine);
            return true;
        }
        return false;
    }
}

