package com.example.maxercisemovil.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.maxercisemovil.ui.components.PrimaryGradientButton
import com.example.maxercisemovil.ui.theme.BluePrimary
import com.example.maxercisemovil.ui.theme.Gray800

@Composable
fun VerifyEmailScreen(
    onNavigateToLogin: () -> Unit,
    token: String? = null
) {
    var status by remember { mutableStateOf("loading") }
    var message by remember { mutableStateOf("Verificando tu cuenta...") }

    LaunchedEffect(token) {
        if (token == null) {
            status = "error"
            message = "Token de verificación no proporcionado."
            return@LaunchedEffect
        }
        
        // TODO: Implement actual API call using ApiService
        // Simulated network delay
        kotlinx.coroutines.delay(1500)
        status = "success"
        message = "Cuenta verificada exitosamente."
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Verificación de Cuenta",
            style = MaterialTheme.typography.displayLarge,
            color = BluePrimary,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(32.dp))

        when (status) {
            "loading" -> {
                CircularProgressIndicator(color = BluePrimary)
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyLarge,
                    color = Gray800
                )
            }
            "success" -> {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = "Success",
                    tint = Color(0xFF22C55E),
                    modifier = Modifier.size(64.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyLarge,
                    color = Gray800,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(24.dp))
                PrimaryGradientButton(
                    text = "Ir a Iniciar Sesión",
                    onClick = onNavigateToLogin,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            "error" -> {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Error",
                    tint = Color(0xFFF59E0B),
                    modifier = Modifier.size(64.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyLarge,
                    color = Gray800,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(24.dp))
                TextButton(onClick = onNavigateToLogin) {
                    Text("Volver a Iniciar Sesión", color = BluePrimary, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
