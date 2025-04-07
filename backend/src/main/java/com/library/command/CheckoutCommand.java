package com.library.command;

import com.library.service.BookLendingService;

public class CheckoutCommand implements Command {
    private String bookItemBarcode;
    private String memberId;
    private BookLendingService bookLendingService;
    
    public CheckoutCommand(String bookItemBarcode, String memberId, BookLendingService bookLendingService) {
        this.bookItemBarcode = bookItemBarcode;
        this.memberId = memberId;
        this.bookLendingService = bookLendingService;
    }
    
    @Override
    public void execute() {
        bookLendingService.checkoutBook(bookItemBarcode, memberId);
    }
}