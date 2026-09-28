package com.risherp.entity;

/**
 * DiscountType — specifies how a discount value is interpreted on a sale line.
 * AMOUNT     : Discount is a fixed monetary amount (e.g., ₹100 off).
 * PERCENTAGE : Discount is a percentage of the line subtotal (e.g., 10% off).
 */
public enum DiscountType {
    AMOUNT,
    PERCENTAGE
}
