package com.example.tradeoff.utils

import android.content.Context

class SessionManager(context: Context) {

    private val prefs =
        context.getSharedPreferences("APP_SESSION", Context.MODE_PRIVATE)

    fun saveToken(token: String) {
        prefs.edit().putString("TOKEN", token).apply()
    }

    fun getToken(): String? {
        return prefs.getString("TOKEN", null)
    }

    fun clear() {
        prefs.edit().clear().apply()
    }
}
