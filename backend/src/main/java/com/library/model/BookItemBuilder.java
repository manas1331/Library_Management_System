package com.library.model;

import java.util.Date;

public class BookItemBuilder {
    private String barcode;
    private boolean isReferenceOnly;
    private double price;
    private String format;
    private Date dateOfPurchase;
    private String rack;

    public BookItemBuilder withBarcode(String barcode) {
        this.barcode = barcode;
        return this;
    }

    public BookItemBuilder withReferenceOnly(boolean isReferenceOnly) {
        this.isReferenceOnly = isReferenceOnly;
        return this;
    }

    public BookItemBuilder withPrice(double price) {
        this.price = price;
        return this;
    }

    public BookItemBuilder withFormat(String format) {
        this.format = format;
        return this;
    }

    public BookItemBuilder withDateOfPurchase(Date dateOfPurchase) {
        this.dateOfPurchase = dateOfPurchase;
        return this;
    }

    public BookItemBuilder withRack(String rack) {
        this.rack = rack;
        return this;
    }

    public BookItem build() {
        return new BookItem(barcode, isReferenceOnly, price, format, dateOfPurchase, rack);
    }
}