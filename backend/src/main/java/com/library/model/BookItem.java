package com.library.model;

import java.util.Date;

public class BookItem {
    private String barcode;
    private boolean isReferenceOnly;
    private boolean borrowed;
    private Date dueDate;
    private double price;
    private String format;
    private BookStatus status;
    private Date dateOfPurchase;
    private String rack;

    public BookItem() {
        this.status = BookStatus.AVAILABLE;
    }

    public BookItem(String barcode, boolean isReferenceOnly, double price, 
                   String format, Date dateOfPurchase, String rack) {
        this.barcode = barcode;
        this.isReferenceOnly = isReferenceOnly;
        this.borrowed = false;
        this.price = price;
        this.format = format;
        this.status = BookStatus.AVAILABLE;
        this.dateOfPurchase = dateOfPurchase;
        this.rack = rack;
    }

    // Getters and Setters
    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public boolean isReferenceOnly() {
        return isReferenceOnly;
    }

    public void setReferenceOnly(boolean referenceOnly) {
        isReferenceOnly = referenceOnly;
    }

    public boolean isBorrowed() {
        return borrowed;
    }

    public void setBorrowed(boolean borrowed) {
        this.borrowed = borrowed;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public BookStatus getStatus() {
        return status;
    }

    public void setStatus(BookStatus status) {
        this.status = status;
    }

    public Date getDateOfPurchase() {
        return dateOfPurchase;
    }

    public void setDateOfPurchase(Date dateOfPurchase) {
        this.dateOfPurchase = dateOfPurchase;
    }

    public String getRack() {
        return rack;
    }

    public void setRack(String rack) {
        this.rack = rack;
    }

    // Business logic
    public boolean checkout(String memberId) {
        if (isReferenceOnly) {
            return false;
        }
        
        if (status != BookStatus.AVAILABLE) {
            return false;
        }
        
        this.borrowed = true;
        this.status = BookStatus.LOANED;
        return true;
    }
}

