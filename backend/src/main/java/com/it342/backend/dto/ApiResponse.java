package com.it342.backend.dto;

public class ApiResponse {

    private boolean success;
    private String message;
    private String fullName;

    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public ApiResponse(boolean success, String message, String fullName) {
        this.success = success;
        this.message = message;
        this.fullName = fullName;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getFullName() {
        return fullName;
    }
}
