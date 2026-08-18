package com.example.maxercisemovil.ui.screens.routines

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
import com.example.maxercisemovil.network.models.Routine
import com.example.maxercisemovil.ui.components.FilterBar
import com.example.maxercisemovil.ui.components.FilterGroup
import com.example.maxercisemovil.ui.components.RoutineDetailSheet

@Composable
fun RoutinesScreen(viewModel: RoutinesViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    var searchQuery by remember { mutableStateOf("") }
    var showFilters by remember { mutableStateOf(false) }
    var selectedCategory by remember { mutableStateOf("") }
    var selectedDifficulty by remember { mutableStateOf("") }
    var selectedRoutine by remember { mutableStateOf<Routine?>(null) }
    
    val activeFiltersCount = listOf(selectedCategory, selectedDifficulty).count { it.isNotEmpty() }

    Column(modifier = Modifier.fillMaxSize().background(Color(0xFFF8FAFC))) {
        // Header
        Column(modifier = Modifier.background(Color.White)) {
            Text(
                text = "Biblioteca de Rutinas",
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
                    selectedCategory = ""
                    selectedDifficulty = ""
                }
            ) {
                FilterGroup(
                    title = "Categoría",
                    options = listOf("Tren superior", "Tren inferior", "Cuerpo completo", "Core"),
                    selectedOption = selectedCategory,
                    onOptionSelected = { selectedCategory = it }
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
            is RoutinesState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF3B82F6))
                }
            }
            is RoutinesState.Success -> {
                // Filter the list based on search and selected filters locally for now
                val filteredRoutines = state.routines.filter {
                    val matchSearch = searchQuery.isEmpty() || it.title.contains(searchQuery, ignoreCase = true)
                    matchSearch
                }
                
                if (filteredRoutines.isEmpty()) {
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
                        items(filteredRoutines) { routine ->
                            RoutineCard(
                                routine = routine,
                                onClick = { selectedRoutine = it }
                            )
                        }
                    }
                }
            }
            is RoutinesState.Error -> {
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
    
    selectedRoutine?.let { routine ->
        RoutineDetailSheet(
            routine = routine,
            onDismiss = { selectedRoutine = null }
        )
    }
}
