package com.example.maxercisemovil.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ProfileScreen(onLogout: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC)) // Slate 50
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFDBEAFE)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(50.dp),
                    tint = Color(0xFF2563EB)
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text("Usuario", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
            Text("usuario@maxercise.com", fontSize = 14.sp, color = Color(0xFF64748B))
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Options
        Column(modifier = Modifier.padding(horizontal = 24.dp)) {
            Text(
                text = "Ajustes de cuenta",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF64748B),
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            // Goal setting mock
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(12.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Settings, contentDescription = null, tint = Color(0xFF475569))
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text("Tu Objetivo", fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                    Text("Ganar músculo", fontSize = 13.sp, color = Color(0xFF64748B))
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Logout Button
            Button(
                onClick = onLogout,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)), // Red
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.ExitToApp, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Cerrar Sesión", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
    }
}
