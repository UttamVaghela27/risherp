package com.risherp.dto.category;

import com.risherp.entity.CategoryStatus;
import lombok.*;

import java.time.LocalDateTime;

/**
 * CategoryResponse
 * Standard API response object representing a Category.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private String categoryName;
    private String description;
    private CategoryStatus status;
    private long itemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
