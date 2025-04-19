package com.library.service.fine;

import com.library.model.BookLending;
import org.springframework.stereotype.Component;
import java.util.Date;

/**
 * Default implementation of FineCalculator
 * Uses the standard library fine policy of $1.00 per day
 */
@Component
public class DefaultFineCalculator implements FineCalculator {
    
    private static final double DAILY_FINE_AMOUNT = 1.0; // $1.00 per day
    
    @Override
    public double calculateFine(BookLending lending, Date returnDate) {
        if (returnDate.after(lending.getDueDate())) {
            // Calculate days overdue using the reference return date
            long diff = returnDate.getTime() - lending.getDueDate().getTime();
            int daysOverdue = (int) (diff / (24 * 60 * 60 * 1000));
            return daysOverdue * DAILY_FINE_AMOUNT;
        }
        return 0.0; // No fine if returned on time
    }
} 