package com.it342.backend.controller;

import com.it342.backend.dto.LoginRequest;
import com.it342.backend.dto.RegisterRequest;
import com.it342.backend.model.User;
import com.it342.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        userService.registerUser(request.getUsername(), request.getPassword());
        return "User registered successfully";
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request, HttpSession session) {
        User user = userService.getUserByUsername(request.getUsername());
        if(userService.checkPassword(request.getPassword(), user.getPassword())) {
            session.setAttribute("user", user.getUsername());
            return "Login successful";
        } else {
            return "Invalid credentials";
        }
    }

    @GetMapping("/me")
    public String me(HttpSession session) {
        Object user = session.getAttribute("user");
        if(user != null) {
            return "Logged in as: " + user;
        } else {
            return "Not logged in";
        }
    }
}
