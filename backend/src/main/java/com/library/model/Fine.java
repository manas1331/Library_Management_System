package com.library.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "fines")
public class Fine {
    @Id
    private String id;
    private Date creationDate;
    private double amount;
    private String bookItemBarcode;
    private String memberId;
    private Date paymentDate;
    private boolean paid;

    public Fine() {
        this.creationDate = new Date();
        this.paid = false;
    }

    public Fine(String bookItemBarcode, String memberId, double amount) {
        this.creationDate = new Date();
        this.bookItemBarcode = bookItemBarcode;
        this.memberId = memberId;
        this.amount = amount;
        this.paid = false;
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

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
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

    public Date getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Date paymentDate) {
        this.paymentDate = paymentDate;
    }

    public boolean isPaid() {
        return paid;
    }

    public void setPaid(boolean paid) {
        this.paid = paid;
    }

    // Business logic
    public void collectPayment() {
        this.paid = true;
        this.paymentDate = new Date();
    }
}

