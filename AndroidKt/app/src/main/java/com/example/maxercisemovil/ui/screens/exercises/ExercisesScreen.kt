package com.example.maxercisemovil.ui.screens.exercises

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import com.example.maxercisemovil.ui.components.ExerciseDetailSheet
import com.example.maxercisemovil.ui.components.FilterBar
import com.example.maxercisemovil.ui.components.FilterGroup

@Composable
fun ExercisesScreen(viewModel: ExercisesViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    var searchQuery by remember { mutableStateOf("") }
    var showFilters by remember { mutableStateOf(false) }
    var selectedMuscle by remember { mutableStateOf("") }
    var selectedDifficulty by remember { mutableStateOf("") }
    var selectedExercise by remember { mutableStateOf<Exercise?>(null) }
    
    val activeFiltersCount = listOf(selectedMuscle, selectedDifficulty).count { it.isNotEmpty() }

    Column(modifier = Modifier.fillMaxSize().background(Color(0xFFF8FAFC))) {
        // Header
        Column(modifier = Modifier.background(Color.White)) {
            Text(
                text = "Biblioteca de Ejercicios",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(16.dp)
            )
            
            FilterBar(
                searchQuery = searchQuery,
                onSearchChange = { searchQuery = it },
                showFilters = showFilters,
                onToggleFilters = { showFilters = !showFilters },
                activeFiltersCount = activeFiltersCount,
                onClearFilters = {
                    selectedMuscle = ""
                    selectedDifficulty = ""
                }
            ) {
                FilterGroup(
                    title = "Grupo Muscular",
                    options = listOf("Pecho", "Espalda", "Piernas", "Brazos", "Core"),
                    selectedOption = selectedMuscle,
                    onOptionSelected = { selectedMuscle = it }
                )
                FilterGroup(
                    title = "Dificultad",
                    options = listOf("Principiante", "Intermedio", "Avanzado"),
                    selectedOption = selectedDifficulty,
                    onOptionSelected = { selectedDifficulty = it }
                )
            }
            Divider(color = Color(0xFFE2E8F0))
        }

        when (val state = uiState) {
            is ExercisesState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF3B82F6))
                }
            }
            is ExercisesState.Success -> {
                // Filter the list based on search and selected filters locally for now
                val filteredExercises = state.exercises.filter {
                    val matchSearch = searchQuery.isEmpty() || it.title.contains(searchQuery, ignoreCase = true)
                    // We don't have real difficulty/muscleGroup mapped in Android yet, so we just mock filter
                    matchSearch
                }
                
                if (filteredExercises.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Sin resultados", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF475569))
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Prueba con otros filtros", fontSize = 14.sp, color = Color(0xFF94A3B8))
                        }
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Adaptive(minSize = 300.dp),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(filteredExercises) { exercise ->
                            ExerciseCard(
                                exercise = exercise,
                                onClick = { selectedExercise = it }
                            )
                        }
                    }
                }
            }
            is ExercisesState.Error -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(16.dp)
                    )
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
}
