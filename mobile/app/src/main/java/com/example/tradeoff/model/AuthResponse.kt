package com.example.tradeoff.model

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val data: UserProfile? = null
)
