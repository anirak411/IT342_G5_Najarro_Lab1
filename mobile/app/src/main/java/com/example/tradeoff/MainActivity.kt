package com.example.tradeoff

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import com.example.tradeoff.ui.theme.DashboardScreen
import com.example.tradeoff.ui.theme.LandingScreen
import com.example.tradeoff.ui.theme.LoginScreen
import com.example.tradeoff.ui.theme.RegisterScreen
import com.example.tradeoff.ui.theme.TradeOffTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            TradeOffTheme {

                // ✅ ADD THIS
                val context = LocalContext.current

                // ✅ Screen state
                var screen by remember { mutableStateOf("landing") }

                // ✅ Navigation switch
                when (screen) {

                    "landing" -> LandingScreen(
                        context = context,
                        onGoLogin = { screen = "login" },
                        onGoRegister = { screen = "register" }
                    )

                    "login" -> LoginScreen(
                        context = context,
                        onLoginSuccess = { screen = "dashboard" },
                        onBackLanding = { screen = "landing" },
                        onGoRegister = { screen = "register" }
                    )

                    "register" -> RegisterScreen(
                        context = context,
                        onRegisterSuccess = { screen = "login" },
                        onBackLanding = { screen = "landing" }
                    )

                    "dashboard" -> DashboardScreen(
                        context = context,
                        onLogout = { screen = "landing" }
                    )
                }
            }
        }
    }
}
