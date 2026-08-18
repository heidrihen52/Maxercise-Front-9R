package com.example.maxercisemovil.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.maxercisemovil.ui.components.MaxerciseTextField
import com.example.maxercisemovil.ui.components.PrimaryGradientButton
import com.example.maxercisemovil.ui.theme.BluePrimary
import com.example.maxercisemovil.ui.theme.Gray800

@Composable
fun ResetPasswordScreen(
    onNavigateToLogin: () -> Unit,
    token: String? = null
) {
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var isSuccess by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Nueva contraseña",
            style = MaterialTheme.typography.displayLarge,
            color = BluePrimary,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Ingresa tu nueva contraseña a continuación.",
            style = MaterialTheme.typography.bodyLarge,
            color = Gray800,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(32.dp))

        MaxerciseTextField(
            value = password,
            onValueChange = { password = it },
            label = "Nueva Contraseña",
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = BluePrimary) },
            visualTransformation = PasswordVisualTransformation()
        )

        Spacer(modifier = Modifier.height(16.dp))

        MaxerciseTextField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = "Confirmar Contraseña",
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = BluePrimary) },
            visualTransformation = PasswordVisualTransformation()
        )

        Spacer(modifier = Modifier.height(24.dp))

        if (message != null) {
            Text(
                text = message!!,
                color = if (isSuccess) Color(0xFF22C55E) else MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(bottom = 16.dp),
                textAlign = TextAlign.Center
            )
        }

        PrimaryGradientButton(
            text = if (isLoading) "Guardando..." else "Restablecer contraseña",
            onClick = {
                if (password != confirmPassword) {
                    message = "Las contraseñas no coinciden"
                    isSuccess = false
                    return@PrimaryGradientButton
                }
                isLoading = true
                // TODO: Implement API call using token
                message = "Contraseña actualizada exitosamente"
                isSuccess = true
                isLoading = false
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading && password.isNotBlank() && confirmPassword.isNotBlank()
        )

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(onClick = onNavigateToLogin) {
            Text("Volver al inicio de sesión", color = BluePrimary, fontWeight = FontWeight.Bold)
        }
    }
}
