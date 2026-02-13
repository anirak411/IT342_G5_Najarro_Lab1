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
import com.example.tradeoff.utils.SessionManager
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    context: Context,
    onLoginSuccess: () -> Unit,
    onGoRegister: () -> Unit
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

        Text("LOGIN", style = MaterialTheme.typography.headlineMedium)

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
                val response = RetrofitClient.api.login(
                    AuthRequest(email, password)
                )

                if (response.isSuccessful && response.body()!!.success) {

                    // Save dummy token
                    SessionManager(context).saveToken("logged_in")

                    Toast.makeText(context, "Login Success", Toast.LENGTH_SHORT).show()
                    onLoginSuccess()

                } else {
                    Toast.makeText(context, "Login Failed", Toast.LENGTH_SHORT).show()
                }
            }
        }) {
            Text("Login")
        }

        TextButton(onClick = onGoRegister) {
            Text("Go to Register")
        }
    }
}
