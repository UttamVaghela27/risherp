package com.risherp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when authentication or authorization fails.
 * 
 * Example: Invalid security code, wrong password, expired session.
 * This automatically returns HTTP 401 UNAUTHORIZED.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
