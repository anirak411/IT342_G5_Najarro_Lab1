package com.it342.backend.controller;

import com.it342.backend.dto.ApiResponse;
import com.it342.backend.dto.LoginRequest;
import com.it342.backend.dto.RegisterRequest;
import com.it342.backend.dto.UserProfileResponse;
import com.it342.backend.model.User;
import com.it342.backend.repository.UserRepository;
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

        User user = new User(
                request.getFullName(),
                request.getDisplayName(),
                request.getEmail(),
                encoder.encode(request.getPassword())
        );

        userRepository.save(user);

        return ResponseEntity.ok(
                new ApiResponse(true, "User registered successfully!")
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
                        user.getEmail()
                );

        return ResponseEntity.ok(
                new ApiResponse(true, "Login successful!", profile)
        );
    }
}
