package com.risherp.dto.settings;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationSettingsDto {

    @NotBlank(message = "Date format is required")
    @Builder.Default
    private String defaultDateFormat = "dd/MM/yyyy";

    @NotBlank(message = "Currency is required")
    @Builder.Default
    private String defaultCurrency = "INR";

    @NotBlank(message = "Currency symbol is required")
    @Builder.Default
    private String defaultCurrencySymbol = "₹";

    @NotNull(message = "Page size is required")
    @Min(value = 5, message = "Page size must be at least 5")
    @Max(value = 100, message = "Page size cannot exceed 100")
    @Builder.Default
    private Integer defaultPageSize = 10;

    @NotBlank(message = "Language is required")
    @Builder.Default
    private String defaultLanguage = "en";

    @NotBlank(message = "Timezone is required")
    @Builder.Default
    private String timezone = "Asia/Kolkata";

    @Builder.Default
    private Boolean enableNotifications = true;
}
