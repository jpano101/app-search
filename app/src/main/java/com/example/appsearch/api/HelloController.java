package com.example.appsearch.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Simple Hello API endpoint controller
 */
@RestController
@RequestMapping("/api")
public class HelloController {

    /**
     * Hello endpoint that returns a simple greeting message
     * 
     * @return Hello message with timestamp
     */
    @GetMapping("/hello")
    public HelloResponse hello() {
        return new HelloResponse("Hello from App Search API!", System.currentTimeMillis());
    }

    /**
     * Response model for hello endpoint
     */
    public static class HelloResponse {
        private String message;
        private long timestamp;

        public HelloResponse(String message, long timestamp) {
            this.message = message;
            this.timestamp = timestamp;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }
    }
}
