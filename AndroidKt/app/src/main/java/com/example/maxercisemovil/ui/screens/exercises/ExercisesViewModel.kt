package com.example.maxercisemovil.ui.screens.exercises

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.maxercisemovil.network.ApiService
import com.example.maxercisemovil.network.models.Exercise
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class ExercisesState {
    object Loading : ExercisesState()
    data class Success(val exercises: List<Exercise>) : ExercisesState()
    data class Error(val message: String) : ExercisesState()
}

class ExercisesViewModel(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow<ExercisesState>(ExercisesState.Loading)
    val uiState: StateFlow<ExercisesState> = _uiState.asStateFlow()

    init {
        fetchExercises()
    }

    fun fetchExercises(bodyPart: String? = null, equipment: String? = null, target: String? = null) {
        _uiState.value = ExercisesState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.getExercises(bodyPart, equipment, target)
                if (response.isSuccessful) {
                    val apiResponse = response.body()
                    val exercises = apiResponse?.data ?: emptyList()
                    _uiState.value = ExercisesState.Success(exercises)
                } else {
                    _uiState.value = ExercisesState.Error("Failed to fetch exercises: ${response.message()}")
                }
            } catch (e: Exception) {
                _uiState.value = ExercisesState.Error(e.localizedMessage ?: "Network error")
            }
        }
    }
}
