package com.example.tradeoff.ui.theme

import android.content.Context
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun LandingScreen(
    context: Context,
    onGoLogin: () -> Unit,
    onGoRegister: () -> Unit
) {
    GlassBackground(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                GlassIconButton(icon = Icons.Filled.Menu, onClick = {})
                Text(
                    text = "TradeOff",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.primary
                )
                GlassIconButton(icon = Icons.Filled.Person, onClick = {})
            }

            Spacer(modifier = Modifier.height(28.dp))

            GlassCard(
                modifier = Modifier.fillMaxWidth(),
                corner = 28.dp
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Buy and Sell Secondhand Items",
                        style = MaterialTheme.typography.headlineMedium,
                        color = MaterialTheme.colorScheme.secondary
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Trading and selling made easier for students.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = GrayText
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Button(
                        onClick = onGoLogin,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = MaterialTheme.shapes.large
                    ) {
                        Text("Sign In")
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedButton(
                        onClick = onGoRegister,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = MaterialTheme.shapes.large
                    ) {
                        Text("Register")
                    }
                }
            }
        }
    }
}
