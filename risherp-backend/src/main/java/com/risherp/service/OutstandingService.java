package com.risherp.service;

import com.risherp.dto.outstanding.CustomerOutstandingDTO;
import com.risherp.dto.outstanding.InvoiceOutstandingDTO;
import com.risherp.dto.outstanding.OutstandingSummaryDTO;
import com.risherp.dto.outstanding.SupplierOutstandingDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface OutstandingService {

    Page<CustomerOutstandingDTO> getCustomerOutstanding(
            Long businessId,
            String search,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable
    );

    Page<SupplierOutstandingDTO> getSupplierOutstanding(
            Long businessId,
            String search,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable
    );

    OutstandingSummaryDTO getOutstandingSummary(Long businessId);

    List<InvoiceOutstandingDTO> getCustomerInvoiceOutstanding(Long partyId, Long businessId);

    List<InvoiceOutstandingDTO> getSupplierInvoiceOutstanding(Long partyId, Long businessId);
}
