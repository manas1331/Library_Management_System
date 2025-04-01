package com.library.repository;

import com.library.model.BookReservation;
import com.library.model.ReservationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookReservationRepository extends MongoRepository<BookReservation, String> {
    List<BookReservation> findByMemberId(String memberId);
    BookReservation findByBookItemBarcodeAndStatus(String barcode, ReservationStatus status);
}

