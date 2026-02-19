package com.it342.backend.controller;

import com.it342.backend.model.ChatMessage;
import com.it342.backend.repository.ChatMessageRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;

    public ChatController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @GetMapping
    public List<ChatMessage> getConversation(
            @RequestParam String user1,
            @RequestParam String user2
    ) {
        return chatMessageRepository.findConversation(user1, user2);
    }

    @PostMapping
    public ChatMessage sendMessage(@RequestBody Map<String, String> payload) {
        String senderEmail = payload.getOrDefault("senderEmail", "").trim();
        String receiverEmail = payload.getOrDefault("receiverEmail", "").trim();
        String content = payload.getOrDefault("content", "").trim();

        if (senderEmail.isBlank() || receiverEmail.isBlank() || content.isBlank()) {
            throw new RuntimeException("senderEmail, receiverEmail, and content are required");
        }

        ChatMessage message = new ChatMessage();
        message.setSenderEmail(senderEmail);
        message.setReceiverEmail(receiverEmail);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());

        return chatMessageRepository.save(message);
    }
}
