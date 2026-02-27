package com.it342.backend.dto;

public class UserProfileResponse {

    private String displayName;
    private String fullName;
    private String email;
    private String profilePicUrl;
    private String coverPicUrl;
    private String role;

    public UserProfileResponse(
            String displayName,
            String fullName,
            String email,
            String profilePicUrl,
            String coverPicUrl,
            String role
    ) {
        this.displayName = displayName;
        this.fullName = fullName;
        this.email = email;
        this.profilePicUrl = profilePicUrl;
        this.coverPicUrl = coverPicUrl;
        this.role = role;
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

    public String getProfilePicUrl() {
        return profilePicUrl;
    }

    public String getCoverPicUrl() {
        return coverPicUrl;
    }

    public String getRole() {
        return role;
    }
}
