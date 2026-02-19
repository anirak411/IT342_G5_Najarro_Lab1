package com.it342.backend.dto;

public class UserProfileResponse {

    private String displayName;
    private String fullName;
    private String email;

    public UserProfileResponse(String displayName, String fullName, String email) {
        this.displayName = displayName;
        this.fullName = fullName;
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }
}
