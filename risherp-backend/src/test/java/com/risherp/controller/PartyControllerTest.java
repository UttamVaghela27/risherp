package com.risherp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.risherp.dto.party.CreatePartyRequest;
import com.risherp.dto.party.PartyResponse;
import com.risherp.dto.party.PartyStatusUpdateRequest;
import com.risherp.entity.OpeningBalanceType;
import com.risherp.entity.PartyStatus;
import com.risherp.entity.PartyType;
import com.risherp.exception.GlobalExceptionHandler;
import com.risherp.service.PartyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PartyControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PartyService partyService;

    @InjectMocks
    private PartyController partyController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(partyController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/parties - Success")
    void testCreateParty_Success() throws Exception {
        CreatePartyRequest request = CreatePartyRequest.builder()
                .partyName("ABC Traders")
                .partyType(PartyType.CUSTOMER)
                .contactPerson("Rahul Patel")
                .mobile("9876543210")
                .openingBalance(new BigDecimal("10000.00"))
                .openingBalanceType(OpeningBalanceType.RECEIVABLE)
                .creditLimit(new BigDecimal("50000.00"))
                .status(PartyStatus.ACTIVE)
                .build();

        PartyResponse response = PartyResponse.builder()
                .id(1L)
                .partyCode("PTY-000001")
                .partyName("ABC Traders")
                .partyType(PartyType.CUSTOMER)
                .mobile("9876543210")
                .openingBalance(new BigDecimal("10000.00"))
                .openingBalanceType(OpeningBalanceType.RECEIVABLE)
                .creditLimit(new BigDecimal("50000.00"))
                .status(PartyStatus.ACTIVE)
                .build();

        when(partyService.createParty(any(), any(), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/parties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.partyCode").value("PTY-000001"))
                .andExpect(jsonPath("$.data.partyName").value("ABC Traders"));
    }

    @Test
    @DisplayName("POST /api/parties - Validation Failure (Invalid Mobile & Empty Name)")
    void testCreateParty_ValidationFailure() throws Exception {
        CreatePartyRequest request = CreatePartyRequest.builder()
                .partyName("") // Invalid: blank
                .partyType(PartyType.CUSTOMER)
                .mobile("123") // Invalid: not 10-digit Indian format
                .openingBalance(new BigDecimal("-50.00")) // Invalid: negative
                .openingBalanceType(OpeningBalanceType.RECEIVABLE)
                .creditLimit(new BigDecimal("-10.00")) // Invalid: negative
                .build();

        mockMvc.perform(post("/api/parties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @DisplayName("GET /api/parties - Paginated List")
    void testGetAllParties() throws Exception {
        PartyResponse party = PartyResponse.builder()
                .id(1L)
                .partyCode("PTY-000001")
                .partyName("ABC Traders")
                .partyType(PartyType.CUSTOMER)
                .mobile("9876543210")
                .status(PartyStatus.ACTIVE)
                .build();

        Page<PartyResponse> pagedResult = new PageImpl<>(List.of(party), org.springframework.data.domain.PageRequest.of(0, 10), 1);
        when(partyService.getAllParties(any(), any(), any(), any(), any())).thenReturn(pagedResult);

        mockMvc.perform(get("/api/parties?page=0&size=10&search=ABC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].partyCode").value("PTY-000001"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("PATCH /api/parties/{id}/status - Status Update")
    void testUpdateStatus() throws Exception {
        PartyStatusUpdateRequest request = PartyStatusUpdateRequest.builder()
                .status(PartyStatus.INACTIVE)
                .build();

        PartyResponse response = PartyResponse.builder()
                .id(1L)
                .partyCode("PTY-000001")
                .partyName("ABC Traders")
                .status(PartyStatus.INACTIVE)
                .build();

        when(partyService.updateStatus(eq(1L), eq(PartyStatus.INACTIVE), any(), any(), any())).thenReturn(response);

        mockMvc.perform(patch("/api/parties/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));
    }
}
