package com.example.tradeoff.network

import com.example.tradeoff.model.AuthRequest
import com.example.tradeoff.model.AuthResponse
import com.example.tradeoff.model.ChatMessage
import com.example.tradeoff.model.Item
import com.example.tradeoff.model.LoginRequest
import com.example.tradeoff.model.SendMessageRequest
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Body
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part
import retrofit2.http.Query

interface ApiService {

    @POST("api/auth/register")
    suspend fun register(@Body request: AuthRequest): Response<AuthResponse>

    @POST("/api/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<AuthResponse>

    @GET("/api/items")
    suspend fun getItems(): List<Item>

    @DELETE("/api/items/{id}")
    suspend fun deleteItem(
        @retrofit2.http.Path("id") id: Long,
        @Query("sellerEmail") sellerEmail: String,
        @Query("sellerName") sellerName: String
    ): Response<Unit>

    @Multipart
    @PUT("/api/items/{id}")
    suspend fun updateItem(
        @retrofit2.http.Path("id") id: Long,
        @Part("title") title: RequestBody,
        @Part("description") description: RequestBody,
        @Part("price") price: RequestBody,
        @Part("category") category: RequestBody,
        @Part("condition") condition: RequestBody,
        @Part("location") location: RequestBody,
        @Part("sellerName") sellerName: RequestBody,
        @Part("sellerEmail") sellerEmail: RequestBody,
        @Part images: List<MultipartBody.Part>
    ): Response<Item>

    @Multipart
    @POST("/api/items/upload")
    suspend fun uploadItem(
        @Part("title") title: RequestBody,
        @Part("description") description: RequestBody,
        @Part("price") price: RequestBody,
        @Part("category") category: RequestBody,
        @Part("condition") condition: RequestBody,
        @Part("location") location: RequestBody,
        @Part("sellerName") sellerName: RequestBody,
        @Part("sellerEmail") sellerEmail: RequestBody,
        @Part images: List<MultipartBody.Part>
    ): Response<Item>

    @GET("/api/messages")
    suspend fun getConversation(
        @Query("user1") user1: String,
        @Query("user2") user2: String
    ): List<ChatMessage>

    @POST("/api/messages")
    suspend fun sendMessage(@Body request: SendMessageRequest): ChatMessage

}
