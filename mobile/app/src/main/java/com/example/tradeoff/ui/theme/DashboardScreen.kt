package com.example.tradeoff.ui.theme

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.tradeoff.utils.SessionManager

@Composable
fun DashboardScreen(
    context: Context,
    onLogout: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {

        Text("DASHBOARD", style = MaterialTheme.typography.headlineMedium)

        Spacer(modifier = Modifier.height(15.dp))

        Text("Welcome! You are logged in.")

        Spacer(modifier = Modifier.height(15.dp))

        Button(onClick = {
            SessionManager(context).clear()
            onLogout()
        }) {
            Text("Logout")
        }
    }
}
