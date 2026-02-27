package com.it342.backend.controller;

import com.it342.backend.dto.UserSummaryResponse;
import com.it342.backend.model.User;
import com.it342.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    @GetMapping("/me")
    public UserSummaryResponse getUserByEmail(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toSummary(user);
    }

    @PutMapping("/media")
    public UserSummaryResponse updateUserMedia(@RequestBody Map<String, String> payload) {
        String email = payload.getOrDefault("email", "").trim();
        if (email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        if (payload.containsKey("profilePicUrl")) {
            user.setProfilePicUrl(payload.get("profilePicUrl"));
        }

        if (payload.containsKey("coverPicUrl")) {
            user.setCoverPicUrl(payload.get("coverPicUrl"));
        }

        User saved = userRepository.save(user);
        return toSummary(saved);
    }

    private UserSummaryResponse toSummary(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getDisplayName(),
                user.getFullName(),
                user.getEmail(),
                user.getProfilePicUrl(),
                user.getCoverPicUrl(),
                user.getRole().name()
        );
    }
}
