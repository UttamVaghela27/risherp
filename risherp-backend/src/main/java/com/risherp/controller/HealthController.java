package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.util.AppConstants;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * 
 * This is the simplest possible API — it just tells us the backend is running.
 * 
 * Flow:
 * Browser/Frontend → GET http://localhost:8080/api/health
 *                  → Spring routes to this controller
 *                  → Returns JSON with app info
 * 
 * No database access needed, no service layer needed.
 * It's purely to verify the backend is alive.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("appName", AppConstants.APP_NAME);
        healthData.put("version", AppConstants.APP_VERSION);
        healthData.put("status", "UP");
        healthData.put("timestamp", LocalDateTime.now().toString());

        return ApiResponse.success("RISHERP Backend is running", healthData);
    }
}
