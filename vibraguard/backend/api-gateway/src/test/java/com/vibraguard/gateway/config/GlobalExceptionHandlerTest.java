package com.vibraguard.gateway.config;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebInputException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    @Test
    void handlesGenericException() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        var res = handler.handleAllExceptions(new RuntimeException("boom"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode());
        assertNotNull(res.getBody());
        assertEquals("RuntimeException", res.getBody().get("error"));
        assertEquals("boom", res.getBody().get("message"));
    }

    @Test
    void handlesWebInputException() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        var res = handler.handleWebInputException(new ServerWebInputException("bad input"));

        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
        assertNotNull(res.getBody());
        assertEquals("ServerWebInputException", res.getBody().get("error"));
    }
}

