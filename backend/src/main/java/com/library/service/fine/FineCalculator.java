package com.library.service.fine;

import com.library.model.BookLending;
import java.util.Date;

/**
 * Fine calculator interface for the Adapter Pattern
 * This interface allows multiple fine calculation strategies
 * while providing a unified interface for the service layer
 */
public interface FineCalculator {
    /**
     * Calculate fine amount based on the book lending and return date
     * 
     * @param lending The book lending record
     * @param returnDate The actual return date
     * @return The fine amount
     */
    double calculateFine(BookLending lending, Date returnDate);
} 