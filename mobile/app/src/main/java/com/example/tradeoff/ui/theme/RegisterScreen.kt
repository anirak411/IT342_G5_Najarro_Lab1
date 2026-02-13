package com.example.tradeoff.ui.theme

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.tradeoff.model.AuthRequest
import com.example.tradeoff.network.RetrofitClient
import kotlinx.coroutines.launch

@Composable
fun RegisterScreen(
    context: Context,
    onRegisterSuccess: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {

        Text("REGISTER", style = MaterialTheme.typography.headlineMedium)

        Spacer(modifier = Modifier.height(15.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") }
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") }
        )

        Spacer(modifier = Modifier.height(15.dp))

        Button(onClick = {
            scope.launch {
                val response = RetrofitClient.api.register(
                    AuthRequest(email, password)
                )

                if (response.isSuccessful && response.body()!!.success) {
                    Toast.makeText(context, "Registered!", Toast.LENGTH_SHORT).show()
                    onRegisterSuccess()
                } else {
                    Toast.makeText(context, "Register Failed", Toast.LENGTH_SHORT).show()
                }
            }
        }) {
            Text("Register")
        }
    }
}
