package com.example.maxercisemovil.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.maxercisemovil.network.ApiService
import com.example.maxercisemovil.network.models.Exercise
import com.example.maxercisemovil.network.models.Routine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class HomeState {
    object Loading : HomeState()
    data class Success(
        val exercises: List<Exercise>,
        val routines: List<Routine>,
        val userGoal: String = "gain_muscle", // MOCK user goal
        val isSafeMode: Boolean = true
    ) : HomeState()
    data class Error(val message: String) : HomeState()
}

class HomeViewModel(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow<HomeState>(HomeState.Loading)
    val uiState: StateFlow<HomeState> = _uiState.asStateFlow()

    init {
        loadDashboard()
    }

    private fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = HomeState.Loading
            try {
                // Fetch exercises
                val exResponse = apiService.getExercises()
                val exercises = if (exResponse.isSuccessful) exResponse.body()?.data ?: emptyList() else emptyList()

                // Fetch routines
                val rtResponse = apiService.getRoutines()
                val routines = if (rtResponse.isSuccessful) rtResponse.body()?.data ?: emptyList() else emptyList()

                _uiState.value = HomeState.Success(
                    exercises = exercises.take(12),
                    routines = routines.take(8)
                )
            } catch (e: Exception) {
                _uiState.value = HomeState.Error(e.localizedMessage ?: "Error cargando dashboard")
            }
        }
    }

    fun toggleSafeMode(isSafe: Boolean) {
        val currentState = _uiState.value
        if (currentState is HomeState.Success) {
            _uiState.value = currentState.copy(isSafeMode = isSafe)
            // Ideally, here we would filter the exercises/routines by `status` or safety flag
            // For now we just update the UI state toggle
        }
    }
}
