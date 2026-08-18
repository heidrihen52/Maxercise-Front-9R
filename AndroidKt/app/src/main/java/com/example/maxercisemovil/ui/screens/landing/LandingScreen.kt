package com.example.maxercisemovil.ui.screens.landing

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.maxercisemovil.ui.components.PrimaryGradientButton
import com.example.maxercisemovil.ui.theme.*

@Composable
fun LandingScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToRegister: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        item {
            HeroSection(onNavigateToRegister, onNavigateToLogin)
        }
        item {
            FeaturesSection()
        }
        item {
            HowItWorksSection()
        }
        item {
            CtaSection(onNavigateToRegister)
        }
    }
}

@Composable
private fun HeroSection(onNavigateToRegister: () -> Unit, onNavigateToLogin: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(BluePale, Color.White)
                )
            )
            .padding(horizontal = 24.dp, vertical = 60.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                color = BluePale,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.padding(bottom = 24.dp)
            ) {
                Text(
                    text = "🏆 Tu entrenador inteligente",
                    color = BluePrimary,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    style = MaterialTheme.typography.labelLarge
                )
            }

            Text(
                text = "Entrena inteligente.",
                style = MaterialTheme.typography.displayLarge,
                textAlign = TextAlign.Center,
                color = BluePrimary
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "consúltalo, aplícalo, maximízalo",
                style = MaterialTheme.typography.titleMedium,
                textAlign = TextAlign.Center,
                color = Gray800
            )
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "Rutinas y ejercicios personalizados según tu cuerpo, condición física y objetivos. Siempre seguros, siempre efectivos.",
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center,
                color = Gray800
            )
            Spacer(modifier = Modifier.height(40.dp))
            PrimaryGradientButton(
                text = "Comenzar ahora →",
                onClick = onNavigateToRegister,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
            TextButton(
                onClick = onNavigateToLogin,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Ya tengo cuenta", color = BluePrimary, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun FeaturesSection() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Todo lo que necesitas",
            style = MaterialTheme.typography.titleLarge,
            color = Gray900
        )
        Text(
            text = "Una plataforma completa para alcanzar tus objetivos de forma segura",
            style = MaterialTheme.typography.bodyMedium,
            color = Gray800,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 8.dp, bottom = 32.dp)
        )

        val features = listOf(
            Pair("Personalizado para ti", "Te hacemos preguntas sobre tu cuerpo, condición física y restricciones."),
            Pair("57+ Ejercicios", "Biblioteca completa para todos los grupos musculares."),
            Pair("25 Rutinas estructuradas", "Rutinas diseñadas por expertos.")
        )

        features.forEach { feature ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(text = feature.first, style = MaterialTheme.typography.titleMedium, color = BluePrimary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = feature.second, style = MaterialTheme.typography.bodyMedium, color = Gray800)
                }
            }
        }
    }
}

@Composable
private fun HowItWorksSection() {
    // Similar to features
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Gray50)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "¿Cómo funciona?",
            style = MaterialTheme.typography.titleLarge,
            color = Gray900
        )
        Spacer(modifier = Modifier.height(32.dp))
        // Simple list
        val steps = listOf("01. Crea tu cuenta", "02. Análisis inteligente", "03. Entrena con confianza", "04. Guarda lo que te gusta")
        steps.forEach { step ->
            Text(
                text = step,
                style = MaterialTheme.typography.titleMedium,
                color = BluePrimary,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
    }
}

@Composable
private fun CtaSection(onNavigateToRegister: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(BluePrimary)
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "¿Listo para maximizar tu entrenamiento?",
            style = MaterialTheme.typography.titleLarge,
            color = Color.White,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Regístrate gratis y comienza hoy mismo.",
            style = MaterialTheme.typography.bodyLarge,
            color = Color.White,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(32.dp))
        Button(
            onClick = onNavigateToRegister,
            colors = ButtonDefaults.buttonColors(containerColor = Color.White)
        ) {
            Text("Comenzar gratis ahora", color = BluePrimary, fontWeight = FontWeight.Bold)
        }
    }
}
