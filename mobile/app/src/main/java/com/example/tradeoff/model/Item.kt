package com.example.tradeoff.model

data class Item(
    val id: Long = 0,
    val title: String? = null,
    val description: String? = null,
    val price: Double = 0.0,
    val category: String? = null,
    val condition: String? = null,
    val location: String? = null,
    val sellerName: String? = null,
    val sellerEmail: String? = null,
    val imageUrl: String? = null,
    val createdAt: String? = null
)
