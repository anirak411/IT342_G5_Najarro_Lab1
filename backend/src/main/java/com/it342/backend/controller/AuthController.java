package com.it342.backend.controller;

import com.it342.backend.dto.ApiResponse;
import com.it342.backend.dto.LoginRequest;
import com.it342.backend.dto.RegisterRequest;
import com.it342.backend.dto.UserProfileResponse;
import com.it342.backend.model.User;
import com.it342.backend.model.UserRole;
import com.it342.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Email already exists!"));
        }

        if (userRepository.existsByDisplayName(request.getDisplayName())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Display name already taken!"));
        }

        UserRole requestedRole = parseRole(request.getRole());
        boolean hasAdmin = userRepository.existsByRole(UserRole.ADMIN);
        UserRole finalRole =
                (!hasAdmin && requestedRole == UserRole.ADMIN)
                        ? UserRole.ADMIN
                        : UserRole.USER;

        User user = new User(
                request.getFullName(),
                request.getDisplayName(),
                request.getEmail(),
                encoder.encode(request.getPassword())
        );
        user.setRole(finalRole);

        userRepository.save(user);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        finalRole == UserRole.ADMIN
                                ? "User registered successfully as ADMIN."
                                : "User registered successfully!"
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "User not found!"));
        }

        User user = userOpt.get();

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Invalid password!"));
        }

        UserProfileResponse profile =
                new UserProfileResponse(
                        user.getDisplayName(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getProfilePicUrl(),
                        user.getCoverPicUrl(),
                        user.getRole().name()
                );

        return ResponseEntity.ok(
                new ApiResponse(true, "Login successful!", profile)
        );
    }

    @GetMapping("/admin-exists")
    public ResponseEntity<ApiResponse> adminExists() {
        boolean exists = userRepository.existsByRole(UserRole.ADMIN);
        return ResponseEntity.ok(
                new ApiResponse(true, "Admin status fetched.", exists)
        );
    }

    @PostMapping("/bootstrap-admin")
    public ResponseEntity<ApiResponse> bootstrapAdmin(@RequestBody LoginRequest request) {
        if (userRepository.existsByRole(UserRole.ADMIN)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse(false, "An admin account already exists."));
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, "User not found."));
        }

        User user = userOpt.get();
        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid credentials."));
        }

        user.setRole(UserRole.ADMIN);
        userRepository.save(user);

        UserProfileResponse profile =
                new UserProfileResponse(
                        user.getDisplayName(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getProfilePicUrl(),
                        user.getCoverPicUrl(),
                        user.getRole().name()
                );

        return ResponseEntity.ok(
                new ApiResponse(true, "Admin role granted.", profile)
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        // Current session handling is client-side. This endpoint exists
        // to complete the API contract until JWT token revocation is added.
        return ResponseEntity.ok(
                new ApiResponse(true, "Logout successful.")
        );
    }

    private UserRole parseRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return UserRole.USER;
        }

        try {
            return UserRole.valueOf(rawRole.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return UserRole.USER;
        }
    }
}
