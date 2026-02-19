package com.it342.backend.service;

import com.it342.backend.model.User;
import com.it342.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String register(String fullName, String displayName, String email, String password) {

        if (userRepository.existsByEmail(email)) {
            return "Email already exists!";
        }

        if (userRepository.existsByDisplayName(displayName)) {
            return "Display name already taken!";
        }

        User user = new User(
                fullName,
                displayName,
                email,
                encoder.encode(password)
        );

        userRepository.save(user);

        return "User registered successfully!";
    }
}
