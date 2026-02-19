package com.it342.backend.repository;

import com.it342.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("""
        SELECT m FROM ChatMessage m
        WHERE (LOWER(m.senderEmail) = LOWER(:user1) AND LOWER(m.receiverEmail) = LOWER(:user2))
           OR (LOWER(m.senderEmail) = LOWER(:user2) AND LOWER(m.receiverEmail) = LOWER(:user1))
        ORDER BY m.createdAt ASC, m.id ASC
    """)
    List<ChatMessage> findConversation(String user1, String user2);
}
