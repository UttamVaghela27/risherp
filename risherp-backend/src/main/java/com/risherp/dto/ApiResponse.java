package com.risherp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Uniform API Response wrapper.
 * 
 * Every API endpoint in RISHERP returns this structure:
 * {
 *   "success": true/false,
 *   "message": "Human-readable message",
 *   "data": { ... },          // The actual response data (can be any type)
 *   "errors": [ ... ]         // Validation errors (only present when there are errors)
 * }
 * 
 * The generic type <T> means "data" can be any type:
 *   ApiResponse<User>    → data will be a User object
 *   ApiResponse<List<Item>> → data will be a list of Items
 *   ApiResponse<Void>    → data will be null (for delete operations)
 * 
 * @param <T> The type of data this response carries
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Don't include null fields in JSON output
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private List<String> errors;

    // ---- Convenience factory methods ----

    /**
     * Create a success response with data.
     * Usage: ApiResponse.success("Party created", partyDto)
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * Create a success response without data.
     * Usage: ApiResponse.success("Party deleted")
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }

    /**
     * Create an error response with a single message.
     * Usage: ApiResponse.error("Party not found")
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }

    /**
     * Create an error response with multiple error messages.
     * Usage: ApiResponse.error("Validation failed", List.of("Name required", "Email invalid"))
     */
    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errors(errors)
                .build();
    }
}
