package com.example.maxercisemovil.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.maxercisemovil.ui.components.MaxerciseTextField
import com.example.maxercisemovil.ui.components.PrimaryGradientButton
import com.example.maxercisemovil.ui.theme.BluePrimary
import com.example.maxercisemovil.ui.theme.Gray800

@Composable
fun ForgotPasswordScreen(
    onNavigateBack: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Recuperar contraseña",
            style = MaterialTheme.typography.displayLarge,
            color = BluePrimary,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.",
            style = MaterialTheme.typography.bodyLarge,
            color = Gray800,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(32.dp))

        MaxerciseTextField(
            value = email,
            onValueChange = { email = it },
            label = "Correo Electrónico",
            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = BluePrimary) }
        )

        Spacer(modifier = Modifier.height(24.dp))

        if (message != null) {
            Text(
                text = message!!,
                color = if (message!!.contains("enviado")) Color(0xFF22C55E) else MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(bottom = 16.dp),
                textAlign = TextAlign.Center
            )
        }

        PrimaryGradientButton(
            text = if (isLoading) "Enviando..." else "Enviar enlace",
            onClick = {
                isLoading = true
                // TODO: Implement actual API call
                message = "Enlace enviado a $email"
                isLoading = false
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading && email.isNotBlank()
        )

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(onClick = onNavigateBack) {
            Text("Volver al inicio de sesión", color = BluePrimary, fontWeight = FontWeight.Bold)
        }
    }
}
