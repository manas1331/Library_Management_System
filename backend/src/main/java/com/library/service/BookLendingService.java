package com.library.service;

import com.library.model.BookLending;
import com.library.model.BookStatus;
import com.library.model.Fine;
import com.library.repository.BookLendingRepository;
import com.library.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class BookLendingService {
    
    @Autowired
    private BookLendingRepository bookLendingRepository;
    
    @Autowired
    private FineRepository fineRepository;
    
    @Autowired
    private BookService bookService;
    
    @Autowired
    private MemberService memberService;
    
    @Autowired
    private FineService fineService;
    
    public List<BookLending> getAllLendings() {
        return bookLendingRepository.findAll();
    }
    
    public Optional<BookLending> getLendingById(String id) {
        return bookLendingRepository.findById(id);
    }
    
    public List<BookLending> getLendingsByMember(String memberId) {
        return bookLendingRepository.findByMemberId(memberId);
    }
    
    public BookLending getLendingByBarcode(String barcode) {
        return bookLendingRepository.findByBookItemBarcodeAndReturnDateIsNull(barcode);
    }
    
    public BookLending checkoutBook(String bookItemBarcode, String memberId) {
        // Check if book is available
        if (!bookService.updateBookItemStatus(bookItemBarcode, BookStatus.LOANED)) {
            return null;
        }
        
        // Increment member's checked out books count
        if (!memberService.incrementBooksCheckedout(memberId)) {
            // Revert book status if member can't check out
            bookService.updateBookItemStatus(bookItemBarcode, BookStatus.AVAILABLE);
            return null;
        }
        
        // Create lending record
        BookLending lending = new BookLending(bookItemBarcode, memberId);
        return bookLendingRepository.save(lending);
    }
    
    public BookLending returnBook(String bookItemBarcode) {
        BookLending lending = bookLendingRepository.findByBookItemBarcodeAndReturnDateIsNull(bookItemBarcode);
        if (lending != null) {
            // Set return date
            Date returnDate = new Date();
            lending.setReturnDate(returnDate);
            
            // Calculate and create fine if needed using the adapter pattern
            if (lending.isOverdue()) {
                fineService.calculateAndCreateFine(lending, returnDate);
            }
            
            // Update book status
            bookService.updateBookItemStatus(bookItemBarcode, BookStatus.AVAILABLE);
            
            // Decrement member's checked out books count
            memberService.decrementBooksCheckedout(lending.getMemberId());
            
            return bookLendingRepository.save(lending);
        }
        return null;
    }
    
    public BookLending renewBook(String bookItemBarcode, String memberId) {
        BookLending lending = bookLendingRepository.findByBookItemBarcodeAndReturnDateIsNull(bookItemBarcode);
        if (lending == null || !lending.getMemberId().equals(memberId)) {
            throw new RuntimeException("No active lending found for this book and member");
        }

        // Set new due date to 3 days from now
        Date newDueDate = new Date();
        newDueDate.setTime(newDueDate.getTime() + (3 * 24 * 60 * 60 * 1000));
        lending.setDueDate(newDueDate);
        
        return bookLendingRepository.save(lending);
    }
    
    public List<Fine> getFinesByBookItemBarcode(String barcode) {
        return fineRepository.findByBookItemBarcode(barcode);
    }
    
    public BookLending testReturnBook(String bookItemBarcode, Date referenceDate) {
        BookLending lending = bookLendingRepository.findByBookItemBarcodeAndReturnDateIsNull(bookItemBarcode);
        if (lending != null) {
            // Set return date to the reference date for testing
            lending.setReturnDate(referenceDate);
            
            // Use the fine calculator adapter for testing too
            if (referenceDate.after(lending.getDueDate())) {
                fineService.calculateAndCreateFine(lending, referenceDate);
            }
            
            // Update book status
            bookService.updateBookItemStatus(bookItemBarcode, BookStatus.AVAILABLE);
            
            // Decrement member's checked out books count
            memberService.decrementBooksCheckedout(lending.getMemberId());
            
            return bookLendingRepository.save(lending);
        }
        return null;
    }
}

