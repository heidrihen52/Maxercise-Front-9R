package com.example.maxercisemovil.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.maxercisemovil.network.models.Exercise
import com.example.maxercisemovil.network.models.Routine
import com.example.maxercisemovil.ui.components.ExerciseDetailSheet
import com.example.maxercisemovil.ui.components.RoutineDetailSheet
import com.example.maxercisemovil.ui.screens.exercises.ExerciseCard
import com.example.maxercisemovil.ui.screens.routines.RoutineCard

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToExercises: () -> Unit,
    onNavigateToRoutines: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    var selectedExercise by remember { mutableStateOf<Exercise?>(null) }
    var selectedRoutine by remember { mutableStateOf<Routine?>(null) }

    when (val state = uiState) {
        is HomeState.Loading -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFF3B82F6))
            }
        }
        is HomeState.Success -> {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF8FAFC)) // bg-slate-50
                    .verticalScroll(rememberScrollState())
            ) {
                // Header Area
                Column(modifier = Modifier.padding(24.dp)) {
                    Text(
                        text = "Bienvenido a Maxercise",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF1E293B)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Goal Banner
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFDBEAFE), RoundedCornerShape(12.dp))
                            .padding(16.dp)
                    ) {
                        Icon(Icons.Filled.Star, contentDescription = null, tint = Color(0xFF2563EB))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Tu objetivo: Ganar músculo — ejercicios de fuerza priorizados",
                            color = Color(0xFF1E3A8A),
                            fontWeight = FontWeight.Medium,
                            fontSize = 14.sp
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Safe Mode Toggle Area
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            if (state.isSafeMode) {
                                Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = Color(0xFF22C55E), modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Solo contenido seguro", fontSize = 14.sp, color = Color(0xFF64748B))
                            } else {
                                Icon(Icons.Filled.Warning, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Mostrando todo el contenido", fontSize = 14.sp, color = Color(0xFF64748B))
                            }
                        }
                        
                        Button(
                            onClick = { viewModel.toggleSafeMode(!state.isSafeMode) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (state.isSafeMode) Color(0xFF22C55E).copy(alpha = 0.1f) else Color(0xFFF59E0B).copy(alpha = 0.1f),
                                contentColor = if (state.isSafeMode) Color(0xFF166534) else Color(0xFF92400E)
                            ),
                            elevation = null
                        ) {
                            Text(if (state.isSafeMode) "Ver todo" else "Filtro seguro", fontWeight = FontWeight.Bold)
                        }
                    }
                    
                    if (!state.isSafeMode) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFFFEF3C7), RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Icon(Icons.Filled.Warning, contentDescription = null, tint = Color(0xFFD97706), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Estás viendo todo el contenido, incluyendo ejercicios no recomendados para tus restricciones.",
                                color = Color(0xFF92400E),
                                fontSize = 12.sp
                            )
                        }
                    }
                }
                
                // Exercises Section
                Column(modifier = Modifier.padding(bottom = 24.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Ejercicios", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                            Text("${state.exercises.size} recomendados", fontSize = 14.sp, color = Color(0xFF64748B))
                        }
                        TextButton(onClick = onNavigateToExercises) {
                            Text("Ver todos", color = Color(0xFF3B82F6), fontWeight = FontWeight.Bold)
                            Icon(Icons.Filled.ArrowForward, contentDescription = null, tint = Color(0xFF3B82F6), modifier = Modifier.size(16.dp))
                        }
                    }
                    
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 24.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(state.exercises) { exercise ->
                            ExerciseCard(
                                exercise = exercise,
                                modifier = Modifier.width(280.dp),
                                onClick = { selectedExercise = it }
                            )
                        }
                    }
                }
                
                // Routines Section
                Column(modifier = Modifier.padding(bottom = 48.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Rutinas", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                            Text("${state.routines.size} diseñadas para ti", fontSize = 14.sp, color = Color(0xFF64748B))
                        }
                        TextButton(onClick = onNavigateToRoutines) {
                            Text("Ver todas", color = Color(0xFF3B82F6), fontWeight = FontWeight.Bold)
                            Icon(Icons.Filled.ArrowForward, contentDescription = null, tint = Color(0xFF3B82F6), modifier = Modifier.size(16.dp))
                        }
                    }
                    
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 24.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(state.routines) { routine ->
                            RoutineCard(
                                routine = routine,
                                modifier = Modifier.width(280.dp),
                                onClick = { selectedRoutine = it }
                            )
                        }
                    }
                }
            }
        }
        is HomeState.Error -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = state.message, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(16.dp))
            }
        }
    }
    
    // Bottom Sheets
    selectedExercise?.let { exercise ->
        ExerciseDetailSheet(
            exercise = exercise,
            onDismiss = { selectedExercise = null }
        )
    }
    
    selectedRoutine?.let { routine ->
        RoutineDetailSheet(
            routine = routine,
            onDismiss = { selectedRoutine = null }
        )
    }
}
