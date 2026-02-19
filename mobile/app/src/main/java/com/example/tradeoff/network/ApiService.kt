package com.example.tradeoff.network

import com.example.tradeoff.model.AuthRequest
import com.example.tradeoff.model.AuthResponse
import com.example.tradeoff.model.LoginRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    @POST("api/auth/register")
    suspend fun register(@Body request: AuthRequest): Response<AuthResponse>

    @POST("api/auth/login")
    suspend fun login(@Body request: AuthRequest): Response<AuthResponse>

    @POST("api/auth/logout")
    suspend fun logout(): Response<Map<String, String>>

    @POST("/api/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<AuthResponse>

}
