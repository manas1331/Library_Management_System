package com.library.service;

import com.library.model.BookReservation;
import com.library.model.BookStatus;
import com.library.model.ReservationStatus;
import com.library.repository.BookReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BookReservationService {
    
    @Autowired
    private BookReservationRepository bookReservationRepository;
    
    @Autowired
    private BookService bookService;

    public List<BookReservation> getAllReservations() {
        return bookReservationRepository.findAll();
    }
    
    public Optional<BookReservation> getReservationById(String id) {
        return bookReservationRepository.findById(id);
    }
    
    public List<BookReservation> getReservationsByMember(String memberId) {
        return bookReservationRepository.findByMemberId(memberId);
    }
    
    public BookReservation getReservationByBarcode(String barcode) {
        return bookReservationRepository.findByBookItemBarcodeAndStatus(barcode, ReservationStatus.WAITING);
    }
    
    public BookReservation reserveBook(String bookItemBarcode, String memberId) {
        // Check if book is already reserved
        BookReservation existingReservation = bookReservationRepository.findByBookItemBarcodeAndStatus(
            bookItemBarcode, ReservationStatus.WAITING);
        
        if (existingReservation != null) {
            return null; // Book already reserved
        }
        if (!bookService.updateBookItemStatus(bookItemBarcode, BookStatus.RESERVED)) {
            return null; // Book is not available for reservation
        }
        
        BookReservation reservation = new BookReservation(bookItemBarcode, memberId);
        return bookReservationRepository.save(reservation);
    }
    
    public boolean cancelReservation(String id) {
        Optional<BookReservation> reservationOpt = bookReservationRepository.findById(id);
        if (reservationOpt.isPresent()) {
            BookReservation reservation = reservationOpt.get();
            
            // Only update status if reservation is still waiting
            if (reservation.getStatus() == ReservationStatus.WAITING) {
                // Update book status back to AVAILABLE
                bookService.updateBookItemStatus(reservation.getBookItemBarcode(), BookStatus.AVAILABLE);
                
                reservation.setStatus(ReservationStatus.CANCELED);
                bookReservationRepository.save(reservation);
                return true;
            }
        }
        return false;
    }
    
    public boolean completeReservation(String id) {
        Optional<BookReservation> reservationOpt = bookReservationRepository.findById(id);
        if (reservationOpt.isPresent()) {
            BookReservation reservation = reservationOpt.get();
            
            // Only complete if reservation is still waiting
            if (reservation.getStatus() == ReservationStatus.WAITING) {
                // No need to update book status here as it will be handled by checkout process
                // (or you could update to LOANED if this implies checkout)
                
                reservation.setStatus(ReservationStatus.COMPLETED);
                bookReservationRepository.save(reservation);
                return true;
            }
        }
        return false;
    }
}

