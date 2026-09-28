package com.risherp.dto.settings;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NumberingSettingDto {

    @NotBlank(message = "Document type is required")
    private String documentType;

    private String documentTypeName;

    @NotBlank(message = "Prefix is required")
    @Size(max = 20, message = "Prefix must not exceed 20 characters")
    private String prefix;

    @NotNull(message = "Next number is required")
    @Min(value = 1, message = "Next number must be at least 1")
    private Long nextNumber;

    @NotNull(message = "Number length is required")
    @Min(value = 1, message = "Number length must be at least 1")
    private Integer numberLength;

    private String examplePreview;
}
