package com.risherp.repository;

import com.risherp.entity.ReceiptAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceiptAllocationRepository extends JpaRepository<ReceiptAllocation, Long> {

    List<ReceiptAllocation> findByReceiptId(Long receiptId);

    List<ReceiptAllocation> findBySaleId(Long saleId);
}
