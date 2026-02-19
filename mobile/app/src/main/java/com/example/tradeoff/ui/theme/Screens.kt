package com.example.tradeoff.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import com.example.tradeoff.ui.theme.*

@Composable
fun GlassBackground(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    colors = listOf(
                        PrimaryColor.copy(alpha = 0.12f),
                        Color.Transparent
                    ),
                    radius = 900f
                )
            )
    ) {
        content()
    }
}

@Composable
fun GlassAuthCard(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier
            .width(360.dp)
            .height(520.dp),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = CardGlass),
        elevation = CardDefaults.cardElevation(defaultElevation = 18.dp)
    ) {
        content()
    }
}

@Composable
fun GlassTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        placeholder = {
            Text(placeholder, color = GrayText)
        },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedBorderColor = BorderColor,
            focusedBorderColor = PrimaryColor,
            unfocusedContainerColor = InputGlass,
            focusedContainerColor = InputGlass
        )
    )
}

@Composable
fun AuthButton(text: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = PrimaryColor
        )
    ) {
        Text(text, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun AuthScreen() {

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    GlassBackground {

        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {

            GlassAuthCard {

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    verticalArrangement = Arrangement.Center
                ) {

                    Text(
                        "Welcome Back",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = SecondaryColor
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        "Login to continue your TradeOff journey.",
                        fontSize = 14.sp,
                        color = GrayText
                    )

                    Spacer(modifier = Modifier.height(25.dp))

                    GlassTextField(
                        value = email,
                        onValueChange = { email = it },
                        placeholder = "Email"
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    GlassTextField(
                        value = password,
                        onValueChange = { password = it },
                        placeholder = "Password"
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    AuthButton("Login") {}

                }
            }
        }
    }
}

