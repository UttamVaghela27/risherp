package com.risherp.dto.settings;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessProfileDto {

    @NotBlank(message = "Business name is required")
    @Size(max = 150, message = "Business name must not exceed 150 characters")
    private String businessName;

    @Size(max = 150, message = "Legal name must not exceed 150 characters")
    private String legalName;

    @NotBlank(message = "Owner name is required")
    @Size(max = 100, message = "Owner name must not exceed 100 characters")
    private String ownerName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Size(max = 20, message = "Mobile must not exceed 20 characters")
    private String mobile;

    @Size(max = 20, message = "Alternate mobile must not exceed 20 characters")
    private String alternateMobile;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @Size(max = 20, message = "Pincode must not exceed 20 characters")
    private String pincode;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @Size(max = 200, message = "Website must not exceed 200 characters")
    private String website;

    private String logoUrl;
}
