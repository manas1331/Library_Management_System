package com.library.command;

import com.library.service.BookLendingService;

public class ReturnCommand implements Command {
    private String bookItemBarcode;
    private BookLendingService bookLendingService;
    
    public ReturnCommand(String bookItemBarcode, BookLendingService bookLendingService) {
        this.bookItemBarcode = bookItemBarcode;
        this.bookLendingService = bookLendingService;
    }
    
    @Override
    public void execute() {
        bookLendingService.returnBook(bookItemBarcode);
    }
}