package com.example.maxercisemovil.ui.screens.preview

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.maxercisemovil.ui.theme.BluePrimary
import com.example.maxercisemovil.ui.theme.Gray800

@Composable
fun PreviewScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToRegister: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Ejercicios", "Rutinas")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Banner
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFFEF3C7))
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Modo de vista previa — Solo para uso interno",
                color = Color(0xFFD97706),
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )
            Row {
                TextButton(onClick = onNavigateToLogin) {
                    Text("Iniciar sesión", color = BluePrimary, fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = onNavigateToRegister,
                    colors = ButtonDefaults.buttonColors(containerColor = BluePrimary),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text("Registrarse", color = Color.White)
                }
            }
        }

        // Content
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "maxercise",
                style = MaterialTheme.typography.displayLarge,
                color = BluePrimary
            )
            Text(
                text = "Vista previa completa del contenido",
                style = MaterialTheme.typography.bodyLarge,
                color = Gray800
            )
            Spacer(modifier = Modifier.height(16.dp))

            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.Transparent,
                contentColor = BluePrimary
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title, fontWeight = FontWeight.Bold) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            when (selectedTab) {
                0 -> {
                    // Exercises Preview
                    Text("Lista de ejercicios (Preview)", style = MaterialTheme.typography.bodyMedium)
                }
                1 -> {
                    // Routines Preview
                    Text("Lista de rutinas (Preview)", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}
