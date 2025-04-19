package com.library.service.fine;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Factory class for FineCalculator implementations
 * Simplified to only return the default calculator for now
 */
@Component
public class FineCalculatorFactory {
    
    @Autowired
    private DefaultFineCalculator defaultFineCalculator;
    
    /**
     * Get the default fine calculator
     * 
     * @return Default fine calculator
     */
    public FineCalculator getFineCalculator() {
        return defaultFineCalculator;
    }
} 