package com.library.service;

import com.library.model.Fine;
import com.library.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FineService {
    
    @Autowired
    private FineRepository fineRepository;
    
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

