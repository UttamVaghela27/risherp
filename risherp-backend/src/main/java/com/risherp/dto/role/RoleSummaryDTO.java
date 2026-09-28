package com.risherp.dto.role;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleSummaryDTO {
    private Long id;
    private String name;
    private String status;
}
