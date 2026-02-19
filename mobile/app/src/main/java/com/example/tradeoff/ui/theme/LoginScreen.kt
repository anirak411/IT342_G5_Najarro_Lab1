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
import com.example.tradeoff.model.LoginRequest
import com.example.tradeoff.model.UserProfile
import com.example.tradeoff.network.RetrofitClient
import com.example.tradeoff.utils.SessionManager
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    context: Context,
    onLoginSuccess: () -> Unit,
    onBackLanding: () -> Unit,
    onGoRegister: () -> Unit
) {
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

            Spacer(modifier = Modifier.height(22.dp))

            GlassCard(
                modifier = Modifier.fillMaxWidth(),
                corner = 26.dp
            ) {
                Column(modifier = Modifier.padding(22.dp)) {
                    Text(
                        text = "Sign In",
                        style = MaterialTheme.typography.headlineMedium,
                        color = MaterialTheme.colorScheme.secondary
                    )

                    Spacer(modifier = Modifier.height(18.dp))

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
                        visualTransformation =
                            if (passwordVisible) VisualTransformation.None
                            else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password
                        ),
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector =
                                        if (passwordVisible) Icons.Filled.Visibility
                                        else Icons.Filled.VisibilityOff,
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
                                    val response = RetrofitClient.api.login(
                                        LoginRequest(
                                            email = email,
                                            password = password
                                        )
                                    )

                                    if (response.isSuccessful && response.body()?.success == true) {
                                        val manager = SessionManager(context)
                                        manager.saveToken("logged_in")
                                        manager.saveUserProfile(
                                            response.body()?.data ?: UserProfile(
                                                displayName = email.substringBefore("@"),
                                                fullName = email.substringBefore("@"),
                                                email = email
                                            )
                                        )
                                        Toast.makeText(context, "Login Success!", Toast.LENGTH_SHORT).show()
                                        onLoginSuccess()
                                    } else {
                                        Toast.makeText(
                                            context,
                                            response.body()?.message ?: "Login Failed",
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
                        Text("Login")
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    TextButton(onClick = onGoRegister, modifier = Modifier.fillMaxWidth()) {
                        Text("Don’t have an account? Register")
                    }
                }
            }
        }
    }
}
