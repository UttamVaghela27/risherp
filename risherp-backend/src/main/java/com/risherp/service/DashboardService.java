package com.risherp.service;

import com.risherp.dto.dashboard.*;

import java.time.LocalDate;
import java.util.List;

public interface DashboardService {

    DashboardSummaryDTO getSummary(Long businessId, LocalDate fromDate, LocalDate toDate);

    List<SalesOverviewDTO> getSalesOverview(Long businessId, LocalDate fromDate, LocalDate toDate);

    List<PurchaseOverviewDTO> getPurchaseOverview(Long businessId, LocalDate fromDate, LocalDate toDate);

    List<RecentTransactionDTO> getRecentTransactions(Long businessId, int limit);

    List<LowStockDTO> getLowStockItems(Long businessId);

    List<OutstandingDTO> getCustomerOutstanding(Long businessId, int limit);

    List<OutstandingDTO> getSupplierOutstanding(Long businessId, int limit);

    AdminOverviewDTO getAdminOverview(Long businessId);
}
