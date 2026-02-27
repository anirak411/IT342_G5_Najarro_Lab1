package com.it342.backend.repository;

import com.it342.backend.model.User;
import com.it342.backend.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByDisplayName(String displayName);

    boolean existsByRole(UserRole role);

    long countByRole(UserRole role);

    Optional<User> findByEmail(String email);
}
