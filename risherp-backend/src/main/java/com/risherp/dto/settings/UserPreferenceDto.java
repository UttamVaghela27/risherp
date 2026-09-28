package com.risherp.dto.settings;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferenceDto {

    @Builder.Default
    private String theme = "light";

    @Builder.Default
    private Boolean sidebarCollapsed = false;

    @Builder.Default
    private String defaultDashboardDateRange = "this_month";

    @Min(value = 5, message = "Page size must be at least 5")
    @Max(value = 100, message = "Page size cannot exceed 100")
    @Builder.Default
    private Integer defaultPageSize = 10;
}
