package com.example.maxercisemovil.ui.screens.routines

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.maxercisemovil.network.models.Routine

@Composable
fun RoutineCard(
    routine: Routine,
    isFavorite: Boolean = false,
    onToggleFavorite: (Int) -> Unit = {},
    onClick: (Routine) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val thumbnailUrl = "https://picsum.photos/seed/${routine.id}/600/400"
    val difficultyLabel = when (routine.difficulty) {
        "AVANZADO" -> "Avanzado"
        "INTERMEDIO" -> "Intermedio"
        else -> "Principiante"
    }
    val difficultyColor = when (routine.difficulty) {
        "AVANZADO" -> Color(0xFFEF4444)
        "INTERMEDIO" -> Color(0xFFEAB308)
        else -> Color(0xFF22C55E)
    }
    
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick(routine) },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // Image Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
            ) {
                AsyncImage(
                    model = thumbnailUrl,
                    contentDescription = routine.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                
                // Overlay Gradient
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.1f))
                )
                
                // Favorite Button
                IconButton(
                    onClick = { onToggleFavorite(routine.id) },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .size(36.dp)
                        .background(Color.White.copy(alpha = 0.8f), shape = RoundedCornerShape(50))
                ) {
                    Icon(
                        imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                        contentDescription = "Favorite",
                        tint = if (isFavorite) Color.Red else Color.Gray,
                        modifier = Modifier.size(20.dp)
                    )
                }
                
                // Duration badge
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(8.dp)
                        .background(Color.Black.copy(alpha = 0.7f), shape = RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "45 min", // Mock duration, to be replaced by actual data if available
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Warning badge
                if (!routine.status) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(8.dp)
                            .background(Color.Red.copy(alpha = 0.9f), shape = RoundedCornerShape(4.dp))
                            .padding(horizontal = 6.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Warning,
                            contentDescription = "Warning",
                            tint = Color.White,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Precaución",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
            
            // Card Body
            Column(modifier = Modifier.padding(16.dp)) {
                // Tags
                Row(modifier = Modifier.padding(bottom = 8.dp)) {
                    Text(
                        text = difficultyLabel,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = difficultyColor,
                        modifier = Modifier
                            .background(difficultyColor.copy(alpha = 0.1f), RoundedCornerShape(4.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = routine.bodyType, 
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF64748B), // Slate 500
                        modifier = Modifier
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(4.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                
                // Title
                Text(
                    text = routine.title.replaceFirstChar { it.uppercase() },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1E293B) // Dark Slate
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                // Description
                Text(
                    text = routine.description ?: "",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF64748B), // Slate 500
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Footer
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${routine.exercises.size} ejercicios",
                        fontSize = 12.sp,
                        color = Color(0xFF94A3B8)
                    )
                    Text(
                        text = "Ver más →",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF3B82F6)
                    )
                }
            }
        }
    }
}
