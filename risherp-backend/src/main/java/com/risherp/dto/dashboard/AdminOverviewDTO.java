package com.risherp.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewDTO {
    private Long totalCustomers;
    private Long totalSuppliers;
    private Long totalItems;
    private Long totalCategories;
    private Long totalSalesInvoices;
    private Long totalPurchaseInvoices;
    private Long totalUsers;
    private Long totalRoles;
}
