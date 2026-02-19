package com.it342.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String displayName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePicUrl;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String coverPicUrl;

    public User() {}

    public User(String fullName, String displayName, String email, String password) {
        this.fullName = fullName;
        this.displayName = displayName;
        this.email = email;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getProfilePicUrl() {
        return profilePicUrl;
    }

    public void setProfilePicUrl(String profilePicUrl) {
        this.profilePicUrl = profilePicUrl;
    }

    public String getCoverPicUrl() {
        return coverPicUrl;
    }

    public void setCoverPicUrl(String coverPicUrl) {
        this.coverPicUrl = coverPicUrl;
    }
}
