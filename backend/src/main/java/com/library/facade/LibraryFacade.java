package com.library.facade;

import com.library.model.Book;
import com.library.model.BookItem;
import com.library.model.BookLending;
import com.library.model.Fine;
import com.library.model.Member;
import com.library.service.BookLendingService;
import com.library.service.BookService;
import com.library.service.FineService;
import com.library.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.library.command.CheckoutCommand;
import com.library.command.CommandInvoker;
import com.library.command.ReturnCommand;
@Component
public class LibraryFacade {

    @Autowired
    private BookService bookService;

    @Autowired
    private BookLendingService bookLendingService;

    @Autowired
    private MemberService memberService;

    @Autowired
    private FineService fineService;

    private CommandInvoker invoker = new CommandInvoker();
    // Simplified operation to checkout a book
    public boolean checkoutBook(String bookItemBarcode, String memberId) {
      invoker.addCommand(new CheckoutCommand(bookItemBarcode, memberId, bookLendingService));
      invoker.executeCommands();
      // Optionally, verify result and return accordingly.
      BookLending lending = bookLendingService.getLendingByBarcode(bookItemBarcode);
      return lending != null;
  }

    public boolean returnBook(String bookItemBarcode) {
        invoker.addCommand(new ReturnCommand(bookItemBarcode, bookLendingService));
        invoker.executeCommands();
        BookLending lending = bookLendingService.getLendingByBarcode(bookItemBarcode);
        return lending != null;
    }

    // Simplified operation to add a new book
    public Book addBook(Book book) {
        return bookService.addBook(book);
    }

    // Simplified operation to add a new book item for a given book
    public BookItem addBookItem(String bookId, BookItem bookItem) {
        return bookService.addBookItem(bookId, bookItem);
    }

    // Simplified operation to register a new member
    public Member registerMember(Member member) {
        return memberService.addMember(member);
    }

    // Simplified operation to pay a fine
    public Fine createFine(String bookItemBarcode, String memberId, double amount) {
        return fineService.createFine(bookItemBarcode, memberId, amount);
    }
}