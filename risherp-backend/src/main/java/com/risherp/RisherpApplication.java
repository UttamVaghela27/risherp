package com.risherp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * RISHERP - ERP and Billing Management System
 * 
 * This is the main entry point of the Spring Boot application.
 * @SpringBootApplication combines three annotations:
 *   - @Configuration: Marks this class as a source of bean definitions
 *   - @EnableAutoConfiguration: Tells Spring Boot to auto-configure beans
 *   - @ComponentScan: Scans com.risherp package for components
 */
@SpringBootApplication
public class RisherpApplication {

    public static void main(String[] args) {
        SpringApplication.run(RisherpApplication.class, args);
    }
}
