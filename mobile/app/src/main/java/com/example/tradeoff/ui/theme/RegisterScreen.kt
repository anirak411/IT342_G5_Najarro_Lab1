package com.example.tradeoff.ui.theme

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.*
import androidx.compose.ui.unit.dp
import com.example.tradeoff.model.AuthRequest
import com.example.tradeoff.network.RetrofitClient
import kotlinx.coroutines.launch

@Composable
fun RegisterScreen(
    context: Context,
    onRegisterSuccess: () -> Unit,
    onBackLanding: () -> Unit
) {
    var fullName by remember { mutableStateOf("") }
    var displayName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    GlassBackground(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Start
            ) {
                GlassIconButton(icon = Icons.Filled.ArrowBack, onClick = onBackLanding)
            }

            Spacer(modifier = Modifier.height(20.dp))

            GlassCard(
                modifier = Modifier.fillMaxWidth(),
                corner = 26.dp
            ) {
                Column(modifier = Modifier.padding(22.dp)) {
                    Text(
                        text = "Register",
                        style = MaterialTheme.typography.headlineMedium,
                        color = MaterialTheme.colorScheme.secondary
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = fullName,
                        onValueChange = { fullName = it },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = displayName,
                        onValueChange = { displayName = it },
                        label = { Text("Display Name (Username)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email") },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Email
                        )
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password") },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = if (passwordVisible)
                            VisualTransformation.None
                        else
                            PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password
                        ),
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible)
                                        Icons.Filled.Visibility
                                    else
                                        Icons.Filled.VisibilityOff,
                                    contentDescription = null
                                )
                            }
                        }
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    Button(
                        onClick = {
                            scope.launch {
                                try {
                                    val response = RetrofitClient.api.register(
                                        AuthRequest(
                                            fullName = fullName,
                                            displayName = displayName,
                                            email = email,
                                            password = password
                                        )
                                    )

                                    if (response.isSuccessful && response.body()?.success == true) {
                                        Toast.makeText(context, "Registered Successfully!", Toast.LENGTH_SHORT).show()
                                        onRegisterSuccess()
                                    } else {
                                        Toast.makeText(
                                            context,
                                            response.body()?.message ?: "Register Failed",
                                            Toast.LENGTH_SHORT
                                        ).show()
                                    }
                                } catch (e: Exception) {
                                    Toast.makeText(context, "Server Error", Toast.LENGTH_SHORT).show()
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                    ) {
                        Text("Create Account")
                    }
                }
            }
        }
    }
}
