package com.example.maxercisewearos.presentation.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.*
import com.example.maxercisewearos.presentation.component.BrandHeader
import com.example.maxercisewearos.presentation.theme.ComfortaaFont
import com.example.maxercisewearos.presentation.theme.QuicksandFont

import androidx.compose.runtime.LaunchedEffect
import androidx.compose.material.icons.filled.Sync
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults

@Composable
fun LinkScreen(
    onSyncRequested: () -> Unit = {}
) {
    LaunchedEffect(Unit) {
        onSyncRequested()
    }

    ScreenScaffold {
        Box(
            modifier = Modifier.fillMaxSize().padding(12.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Kettlebell logo / Slogan
                BrandHeader(modifier = Modifier.padding(bottom = 4.dp))

                Spacer(modifier = Modifier.height(4.dp))

                Icon(
                    imageVector = Icons.Filled.Smartphone,
                    contentDescription = null,
                    tint = Color(0xFF2A94FF),
                    modifier = Modifier.size(20.dp)
                )

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = "Vincular dispositivo",
                    fontFamily = ComfortaaFont,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = Color.White,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = "Inicia sesión en tu teléfono o presiona sincronizar.",
                    fontFamily = QuicksandFont,
                    fontSize = 9.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center,
                    lineHeight = 11.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Button(
                    onClick = onSyncRequested,
                    modifier = Modifier.height(32.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2A94FF))
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Sync,
                            contentDescription = "Sincronizar",
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Sincronizar",
                            fontSize = 10.sp,
                            fontFamily = QuicksandFont,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
