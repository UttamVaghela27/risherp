package com.risherp.service;

import com.risherp.dto.party.*;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.DuplicateResourceException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.PartyRepository;
import com.risherp.security.UserPrincipal;
import com.risherp.service.impl.PartyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PartyServiceTest {

    @Mock
    private PartyRepository partyRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private FinancialPostingService financialPostingService;

    @InjectMocks
    private PartyServiceImpl partyService;

    private Business testBusiness;
    private UserPrincipal testPrincipal;

    @BeforeEach
    void setUp() {
        testBusiness = Business.builder()
                .id(1L)
                .businessName("Rishabh Traders")
                .ownerName("Rishabh")
                .email("owner@risherp.com")
                .mobile("9876543210")
                .build();

        User testUser = User.builder()
                .id(10L)
                .name("Admin User")
                .email("admin@risherp.com")
                .business(testBusiness)
                .role(Role.builder().name("ADMIN").build())
                .status("ACTIVE")
                .build();

        testPrincipal = new UserPrincipal(testUser);
    }

    @Test
    @DisplayName("Create Customer - Success")
    void testCreateCustomer_Success() {
        CreatePartyRequest request = CreatePartyRequest.builder()
                .partyName("ABC Traders")
                .partyType(PartyType.CUSTOMER)
                .contactPerson("Rahul Patel")
                .mobile("9876543210")
                .alternateMobile("9876543211")
                .email("abc@example.com")
                .address("Ring Road")
                .city("Surat")
                .state("Gujarat")
                .pincode("395001")
                .openingBalance(new BigDecimal("10000.00"))
                .openingBalanceType(OpeningBalanceType.RECEIVABLE)
                .creditLimit(new BigDecimal("50000.00"))
                .notes("Regular wholesale customer")
                .status(PartyStatus.ACTIVE)
                .build();

        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
        when(partyRepository.existsByBusinessIdAndMobile(1L, "9876543210")).thenReturn(false);
        when(partyRepository.getMaxId()).thenReturn(0L);
        when(partyRepository.existsByBusinessIdAndPartyCode(eq(1L), anyString())).thenReturn(false);

        when(partyRepository.save(any(Party.class))).thenAnswer(invocation -> {
            Party p = invocation.getArgument(0);
            p.setId(101L);
            return p;
        });

        PartyResponse response = partyService.createParty(request, 1L, testPrincipal, "127.0.0.1");

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals("PTY-000001", response.getPartyCode());
        assertEquals("ABC Traders", response.getPartyName());
        assertEquals(PartyType.CUSTOMER, response.getPartyType());
        assertEquals(new BigDecimal("10000.00"), response.getOpeningBalance());
        assertEquals(OpeningBalanceType.RECEIVABLE, response.getOpeningBalanceType());
        assertEquals(PartyStatus.ACTIVE, response.getStatus());

        verify(auditLogService, times(1)).log(any(), any(), eq(1L), eq("PARTY"), eq("PARTY_CREATED"), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Create Supplier - Success")
    void testCreateSupplier_Success() {
        CreatePartyRequest request = CreatePartyRequest.builder()
                .partyName("XYZ Distributors")
                .partyType(PartyType.SUPPLIER)
                .mobile("9823456789")
                .openingBalance(new BigDecimal("15000.00"))
                .openingBalanceType(OpeningBalanceType.PAYABLE)
                .creditLimit(BigDecimal.ZERO)
                .build();

        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
        when(partyRepository.existsByBusinessIdAndMobile(1L, "9823456789")).thenReturn(false);
        when(partyRepository.getMaxId()).thenReturn(1L);
        when(partyRepository.existsByBusinessIdAndPartyCode(eq(1L), eq("PTY-000002"))).thenReturn(false);

        when(partyRepository.save(any(Party.class))).thenAnswer(invocation -> {
            Party p = invocation.getArgument(0);
            p.setId(102L);
            return p;
        });

        PartyResponse response = partyService.createParty(request, 1L, testPrincipal, "127.0.0.1");

        assertNotNull(response);
        assertEquals(102L, response.getId());
        assertEquals("PTY-000002", response.getPartyCode());
        assertEquals(PartyType.SUPPLIER, response.getPartyType());
        assertEquals(OpeningBalanceType.PAYABLE, response.getOpeningBalanceType());
    }

    @Test
    @DisplayName("Create Party - Zero Balance Auto-Sets NONE")
    void testCreateParty_ZeroBalanceSetsNone() {
        CreatePartyRequest request = CreatePartyRequest.builder()
                .partyName("New Enterprise")
                .partyType(PartyType.BOTH)
                .mobile("9811122233")
                .openingBalance(BigDecimal.ZERO)
                .openingBalanceType(OpeningBalanceType.RECEIVABLE) // Will be normalized to NONE
                .creditLimit(BigDecimal.ZERO)
                .build();

        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
        when(partyRepository.existsByBusinessIdAndMobile(1L, "9811122233")).thenReturn(false);
        when(partyRepository.getMaxId()).thenReturn(2L);

        when(partyRepository.save(any(Party.class))).thenAnswer(invocation -> {
            Party p = invocation.getArgument(0);
            p.setId(103L);
            return p;
        });

        PartyResponse response = partyService.createParty(request, 1L, testPrincipal, "127.0.0.1");

        assertNotNull(response);
        assertEquals(OpeningBalanceType.NONE, response.getOpeningBalanceType());
    }

    @Test
    @DisplayName("Create Party - Positive Balance with NONE Type Throws Exception")
    void testCreateParty_PositiveBalanceWithNoneType_ThrowsException() {
        CreatePartyRequest request = CreatePartyRequest.builder()
                .partyName("Invalid Party")
                .partyType(PartyType.CUSTOMER)
                .mobile("9811122233")
                .openingBalance(new BigDecimal("5000.00"))
                .openingBalanceType(OpeningBalanceType.NONE)
                .creditLimit(BigDecimal.ZERO)
                .build();

        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
        when(partyRepository.existsByBusinessIdAndMobile(1L, "9811122233")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> partyService.createParty(request, 1L, testPrincipal, "127.0.0.1"));
    }

    @Test
    @DisplayName("Create Party - Duplicate Mobile Throws Exception")
    void testCreateParty_DuplicateMobile_ThrowsException() {
        CreatePartyRequest request = CreatePartyRequest.builder()
                .partyName("Duplicate Mobile Party")
                .partyType(PartyType.CUSTOMER)
                .mobile("9876543210")
                .openingBalance(BigDecimal.ZERO)
                .openingBalanceType(OpeningBalanceType.NONE)
                .creditLimit(BigDecimal.ZERO)
                .build();

        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
        when(partyRepository.existsByBusinessIdAndMobile(1L, "9876543210")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> partyService.createParty(request, 1L, testPrincipal, "127.0.0.1"));
    }

    @Test
    @DisplayName("Get Party by ID - Success and Not Found")
    void testGetPartyById() {
        Party party = Party.builder()
                .id(101L)
                .partyCode("PTY-000001")
                .partyName("ABC Traders")
                .business(testBusiness)
                .partyType(PartyType.CUSTOMER)
                .mobile("9876543210")
                .status(PartyStatus.ACTIVE)
                .build();

        when(partyRepository.findByIdAndBusinessId(101L, 1L)).thenReturn(Optional.of(party));
        when(partyRepository.findByIdAndBusinessId(999L, 1L)).thenReturn(Optional.empty());

        PartyResponse found = partyService.getPartyById(101L, 1L);
        assertNotNull(found);
        assertEquals("ABC Traders", found.getPartyName());

        assertThrows(ResourceNotFoundException.class, () -> partyService.getPartyById(999L, 1L));
    }

    @Test
    @DisplayName("Update Party Status - Deactivate and Activate")
    void testUpdateStatus() {
        Party party = Party.builder()
                .id(101L)
                .partyCode("PTY-000001")
                .partyName("ABC Traders")
                .business(testBusiness)
                .status(PartyStatus.ACTIVE)
                .build();

        when(partyRepository.findByIdAndBusinessId(101L, 1L)).thenReturn(Optional.of(party));
        when(partyRepository.save(any(Party.class))).thenAnswer(i -> i.getArgument(0));

        PartyResponse deactivated = partyService.updateStatus(101L, PartyStatus.INACTIVE, 1L, testPrincipal, "127.0.0.1");
        assertEquals(PartyStatus.INACTIVE, deactivated.getStatus());
        verify(auditLogService, times(1)).log(any(), any(), eq(1L), eq("PARTY"), eq("PARTY_DEACTIVATED"), eq("101"), anyString(), any());

        PartyResponse activated = partyService.updateStatus(101L, PartyStatus.ACTIVE, 1L, testPrincipal, "127.0.0.1");
        assertEquals(PartyStatus.ACTIVE, activated.getStatus());
        verify(auditLogService, times(1)).log(any(), any(), eq(1L), eq("PARTY"), eq("PARTY_ACTIVATED"), eq("101"), anyString(), any());
    }

    @Test
    @DisplayName("Get All Parties - Specification & Pagination")
    void testGetAllParties() {
        Party party1 = Party.builder().id(1L).partyCode("PTY-000001").partyName("ABC").partyType(PartyType.CUSTOMER).build();
        Party party2 = Party.builder().id(2L).partyCode("PTY-000002").partyName("XYZ").partyType(PartyType.SUPPLIER).build();

        Page<Party> page = new PageImpl<>(List.of(party1, party2));
        when(partyRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<PartyResponse> result = partyService.getAllParties(1L, "ABC", PartyType.CUSTOMER, PartyStatus.ACTIVE, PageRequest.of(0, 10));
        assertNotNull(result);
        assertEquals(2, result.getContent().size());
    }

    @Test
    @DisplayName("Get Party Summary - Counts and Balances")
    void testGetPartySummary() {
        when(partyRepository.countByBusinessId(1L)).thenReturn(25L);
        when(partyRepository.countByBusinessIdAndPartyType(1L, PartyType.CUSTOMER)).thenReturn(15L);
        when(partyRepository.countByBusinessIdAndPartyType(1L, PartyType.SUPPLIER)).thenReturn(8L);
        when(partyRepository.countByBusinessIdAndPartyType(1L, PartyType.BOTH)).thenReturn(2L);
        when(partyRepository.countByBusinessIdAndStatus(1L, PartyStatus.ACTIVE)).thenReturn(23L);
        when(partyRepository.countByBusinessIdAndStatus(1L, PartyStatus.INACTIVE)).thenReturn(2L);
        when(partyRepository.sumOpeningBalanceByBusinessIdAndType(1L, OpeningBalanceType.RECEIVABLE)).thenReturn(new BigDecimal("125000.00"));
        when(partyRepository.sumOpeningBalanceByBusinessIdAndType(1L, OpeningBalanceType.PAYABLE)).thenReturn(new BigDecimal("85000.00"));

        PartySummaryDTO summary = partyService.getPartySummary(1L);

        assertNotNull(summary);
        assertEquals(25, summary.getTotalParties());
        assertEquals(15, summary.getTotalCustomers());
        assertEquals(8, summary.getTotalSuppliers());
        assertEquals(2, summary.getTotalBoth());
        assertEquals(23, summary.getActiveParties());
        assertEquals(2, summary.getInactiveParties());
        assertEquals(new BigDecimal("125000.00"), summary.getTotalReceivables());
        assertEquals(new BigDecimal("85000.00"), summary.getTotalPayables());
    }
}
