package com.library.service;

import com.library.model.BookReservation;
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
        
        BookReservation reservation = new BookReservation(bookItemBarcode, memberId);
        return bookReservationRepository.save(reservation);
    }
    
    public boolean cancelReservation(String reservationId) {
        Optional<BookReservation> reservationOpt = bookReservationRepository.findById(reservationId);
        if (reservationOpt.isPresent()) {
            BookReservation reservation = reservationOpt.get();
            reservation.setStatus(ReservationStatus.CANCELED);
            bookReservationRepository.save(reservation);
            return true;
        }
        return false;
    }
    
    public boolean completeReservation(String reservationId) {
        Optional<BookReservation> reservationOpt = bookReservationRepository.findById(reservationId);
        if (reservationOpt.isPresent()) {
            BookReservation reservation = reservationOpt.get();
            reservation.setStatus(ReservationStatus.COMPLETED);
            bookReservationRepository.save(reservation);
            return true;
        }
        return false;
    }
}

