package com.risherp.service;

import com.risherp.entity.SalesReturn;

/**
 * SalesReturnPdfService — generates authoritative PDF for a sales return.
 */
public interface SalesReturnPdfService {
    byte[] generateSalesReturnPdf(SalesReturn salesReturn);
}
