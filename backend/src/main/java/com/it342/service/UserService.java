package com.it342.service;

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

    public String register(String fullName, String email, String password) {

        if (userRepository.existsByEmail(email)) {
            return "Email already exists!";
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));

        userRepository.save(user);

        return "User registered successfully!";
    }

    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return "User not found!";
        }

        if (!encoder.matches(password, user.getPassword())) {
            return "Invalid password!";
        }

        return "Login successful!";
    }
}
