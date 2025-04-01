package com.library.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "book_reservations")
public class BookReservation {
    @Id
    private String id;
    private Date creationDate;
    private ReservationStatus status;
    private String bookItemBarcode;
    private String memberId;

    public BookReservation() {
        this.creationDate = new Date();
        this.status = ReservationStatus.WAITING;
    }

    public BookReservation(String bookItemBarcode, String memberId) {
        this.creationDate = new Date();
        this.status = ReservationStatus.WAITING;
        this.bookItemBarcode = bookItemBarcode;
        this.memberId = memberId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public String getBookItemBarcode() {
        return bookItemBarcode;
    }

    public void setBookItemBarcode(String bookItemBarcode) {
        this.bookItemBarcode = bookItemBarcode;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    // Business logic
    public void updateStatus(ReservationStatus status) {
        this.status = status;
    }
}

