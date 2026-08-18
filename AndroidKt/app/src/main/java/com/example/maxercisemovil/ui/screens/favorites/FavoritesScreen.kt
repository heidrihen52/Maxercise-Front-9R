package com.example.maxercisemovil.ui.screens.favorites

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
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
fun FavoritesScreen(viewModel: FavoritesViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var tabIndex by remember { mutableStateOf(0) }
    val tabs = listOf("Ejercicios", "Rutinas")
    
    var selectedExercise by remember { mutableStateOf<Exercise?>(null) }
    var selectedRoutine by remember { mutableStateOf<Routine?>(null) }

    Column(modifier = Modifier.fillMaxSize().background(Color(0xFFF8FAFC))) {
        // Header
        Column(
            modifier = Modifier
                .background(Color.White)
                .padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Favorite, contentDescription = null, tint = Color(0xFF3B82F6), modifier = Modifier.size(28.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Mis Favoritos",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1E293B)
                )
            }
            if (uiState is FavoritesState.Success) {
                val state = uiState as FavoritesState.Success
                val total = state.favoriteExercises.size + state.favoriteRoutines.size
                Text(
                    text = "$total elementos guardados",
                    fontSize = 14.sp,
                    color = Color(0xFF64748B),
                    modifier = Modifier.padding(top = 4.dp, start = 40.dp)
                )
            }
        }
        
        TabRow(
            selectedTabIndex = tabIndex,
            containerColor = Color.White,
            contentColor = Color(0xFF3B82F6),
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[tabIndex]),
                    color = Color(0xFF3B82F6)
                )
            }
        ) {
            tabs.forEachIndexed { index, title ->
                val count = if (uiState is FavoritesState.Success) {
                    val state = uiState as FavoritesState.Success
                    if (index == 0) state.favoriteExercises.size else state.favoriteRoutines.size
                } else 0
                
                Tab(
                    selected = tabIndex == index,
                    onClick = { tabIndex = index },
                    text = { 
                        Text(
                            text = "$title ($count)",
                            fontWeight = if (tabIndex == index) FontWeight.Bold else FontWeight.Normal,
                            color = if (tabIndex == index) Color(0xFF3B82F6) else Color(0xFF64748B)
                        )
                    }
                )
            }
        }

        when (val state = uiState) {
            is FavoritesState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF3B82F6))
                }
            }
            is FavoritesState.Success -> {
                if (tabIndex == 0) {
                    if (state.favoriteExercises.isEmpty()) {
                        EmptyFavoritesState("Sin ejercicios favoritos", "Explora ejercicios y pulsa el corazón para guardarlos aquí")
                    } else {
                        LazyVerticalGrid(
                            columns = GridCells.Adaptive(minSize = 300.dp),
                            contentPadding = PaddingValues(16.dp),
                            horizontalArrangement = Arrangement.spacedBy(16.dp),
                            verticalArrangement = Arrangement.spacedBy(16.dp),
                            modifier = Modifier.fillMaxSize()
                        ) {
                            items(state.favoriteExercises) { exercise ->
                                ExerciseCard(
                                    exercise = exercise,
                                    isFavorite = true,
                                    onClick = { selectedExercise = it }
                                )
                            }
                        }
                    }
                } else {
                    if (state.favoriteRoutines.isEmpty()) {
                        EmptyFavoritesState("Sin rutinas favoritas", "Explora rutinas y pulsa el corazón para guardarlas aquí")
                    } else {
                        LazyVerticalGrid(
                            columns = GridCells.Adaptive(minSize = 300.dp),
                            contentPadding = PaddingValues(16.dp),
                            horizontalArrangement = Arrangement.spacedBy(16.dp),
                            verticalArrangement = Arrangement.spacedBy(16.dp),
                            modifier = Modifier.fillMaxSize()
                        ) {
                            items(state.favoriteRoutines) { routine ->
                                RoutineCard(
                                    routine = routine,
                                    isFavorite = true,
                                    onClick = { selectedRoutine = it }
                                )
                            }
                        }
                    }
                }
            }
            is FavoritesState.Error -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = state.message, color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
    
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

@Composable
fun EmptyFavoritesState(title: String, subtitle: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Filled.Favorite, contentDescription = null, tint = Color(0xFFCBD5E1), modifier = Modifier.size(64.dp))
            Spacer(modifier = Modifier.height(16.dp))
            Text(title, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF475569))
            Spacer(modifier = Modifier.height(8.dp))
            Text(subtitle, fontSize = 14.sp, color = Color(0xFF94A3B8))
        }
    }
}
