package com.example.tradeoff

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import com.example.tradeoff.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            TradeOffTheme {

                var screen by remember { mutableStateOf("landing") }

                when (screen) {

                    "landing" -> LandingScreen(
                        context = this,
                        onGoLogin = { screen = "login" },
                        onGoRegister = { screen = "register" }
                    )

                    "login" -> LoginScreen(
                        context = this,
                        onLoginSuccess = { screen = "dashboard" },
                        onBackLanding = { screen = "landing" },
                        onGoRegister = { screen = "register" }
                    )

                    "register" -> RegisterScreen(
                        context = this,
                        onRegisterSuccess = { screen = "login" },
                        onBackLanding = { screen = "landing" }
                    )

                    "dashboard" -> DashboardScreen(
                        context = this,
                        onLogout = { screen = "landing" }
                    )
                }
            }
        }
    }
}
