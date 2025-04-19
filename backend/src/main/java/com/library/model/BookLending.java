package com.library.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "book_lendings")
public class BookLending {
    @Id
    private String id;
    private Date creationDate;
    private Date dueDate;
    private Date returnDate;
    private String bookItemBarcode;
    private String memberId;

    public BookLending() {
        this.creationDate = new Date();
    }

    public BookLending(String bookItemBarcode, String memberId) {
        this.creationDate = new Date();
        this.bookItemBarcode = bookItemBarcode;
        this.memberId = memberId;
        
        // Set due date to 3 days from now
        Date dueDate = new Date();
        dueDate.setTime(dueDate.getTime() + (24 * 60 * 60 * 1000));
        this.dueDate = dueDate;
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

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }

    public Date getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(Date returnDate) {
        this.returnDate = returnDate;
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
    public boolean isOverdue() {
        if (returnDate != null) {
            return returnDate.after(dueDate);
        }
        return new Date().after(dueDate);
    }

    public int getDaysOverdue() {
        return getDaysOverdue(new Date());
    }
    
    public int getDaysOverdue(Date referenceDate) {
        if (!isOverdue()) {
            return 0;
        }
        
        Date dateToUse = returnDate != null ? returnDate : referenceDate;
        long diff = dateToUse.getTime() - dueDate.getTime();
        return (int) (diff / (24 * 60 * 60 * 1000));
    }
}

