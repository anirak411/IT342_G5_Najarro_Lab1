package com.example.tradeoff.model

data class SendMessageRequest(
    val senderEmail: String,
    val receiverEmail: String,
    val content: String
)
