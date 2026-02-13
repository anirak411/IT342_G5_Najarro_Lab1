package com.it342.backend.controller;

import com.it342.backend.dto.ApiResponse;
import com.it342.backend.dto.LoginRequest;
import com.it342.backend.dto.RegisterRequest;
import com.it342.backend.model.User;
import com.it342.backend.repository.UserRepository;
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
    public ApiResponse register(@RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new ApiResponse(false, "Email already exists!");
        }

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                encoder.encode(request.getPassword())
        );

        userRepository.save(user);

        return new ApiResponse(true, "User registered successfully!");
    }

    @PostMapping("/login")
    public ApiResponse login(@RequestBody LoginRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new ApiResponse(false, "User not found!");
        }

        User user = userOpt.get();

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            return new ApiResponse(false, "Invalid password!");
        }

        return new ApiResponse(true, "Login successful!", user.getFullName());
    }

    @PostMapping("/logout")
    public ApiResponse logout() {
        return new ApiResponse(true, "Logout successful!");
    }
}
