package com.example.tradeoff.utils

import android.content.Context
import com.example.tradeoff.model.UserProfile

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

    fun saveUserProfile(profile: UserProfile) {
        prefs.edit()
            .putString("DISPLAY_NAME", profile.displayName)
            .putString("FULL_NAME", profile.fullName)
            .putString("EMAIL", profile.email)
            .putString("PROFILE_PIC_URL", profile.profilePicUrl)
            .putString("COVER_PIC_URL", profile.coverPicUrl)
            .apply()
    }

    fun getUserProfile(): UserProfile {
        return UserProfile(
            displayName = prefs.getString("DISPLAY_NAME", "") ?: "",
            fullName = prefs.getString("FULL_NAME", "") ?: "",
            email = prefs.getString("EMAIL", "") ?: "",
            profilePicUrl = prefs.getString("PROFILE_PIC_URL", "") ?: "",
            coverPicUrl = prefs.getString("COVER_PIC_URL", "") ?: ""
        )
    }

    fun isLoggedIn(): Boolean {
        return getToken() != null && getUserProfile().email.isNotBlank()
    }
}
