package com.example.tradeoff

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import com.example.tradeoff.ui.theme.DashboardScreen
import com.example.tradeoff.ui.theme.LoginScreen
import com.example.tradeoff.ui.theme.RegisterScreen
import com.example.tradeoff.utils.SessionManager

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {

            var screen by remember { mutableStateOf("login") }

            val token = SessionManager(this).getToken()
            if (token != null) screen = "dashboard"

            when (screen) {

                "login" -> LoginScreen(
                    context = this,
                    onLoginSuccess = { screen = "dashboard" },
                    onGoRegister = { screen = "register" }
                )

                "register" -> RegisterScreen(
                    context = this,
                    onRegisterSuccess = { screen = "login" }
                )

                "dashboard" -> DashboardScreen(
                    context = this,
                    onLogout = { screen = "login" }
                )
            }
        }
    }
}
