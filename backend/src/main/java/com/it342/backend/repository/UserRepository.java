package com.it342.backend.repository;

import com.it342.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByDisplayName(String displayName);

    Optional<User> findByEmail(String email);
}
