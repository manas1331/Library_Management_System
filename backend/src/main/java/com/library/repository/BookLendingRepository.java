package com.library.repository;

import com.library.model.BookLending;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookLendingRepository extends MongoRepository<BookLending, String> {
    List<BookLending> findByMemberId(String memberId);
    BookLending findByBookItemBarcodeAndReturnDateIsNull(String barcode);
    List<BookLending> findByBookItemBarcode(String barcode);
}

