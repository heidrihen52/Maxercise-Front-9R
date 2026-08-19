package com.example.maxercisemovil.ui.screens.favorites

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.maxercisemovil.network.ApiService
import com.example.maxercisemovil.network.models.Exercise
import com.example.maxercisemovil.network.models.Routine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class FavoritesState {
    object Loading : FavoritesState()
    data class Success(
        val favoriteExercises: List<Exercise>,
        val favoriteRoutines: List<Routine>
    ) : FavoritesState()
    data class Error(val message: String) : FavoritesState()
}

class FavoritesViewModel(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow<FavoritesState>(FavoritesState.Loading)
    val uiState: StateFlow<FavoritesState> = _uiState.asStateFlow()

    init {
        loadFavorites()
    }

    fun loadFavorites() {
        viewModelScope.launch {
            _uiState.value = FavoritesState.Loading
            try {
                val exResponse = apiService.getExercises()
                val exercises = if (exResponse.isSuccessful) exResponse.body()?.data ?: emptyList() else emptyList()

                val rtResponse = apiService.getRoutines()
                val routines = if (rtResponse.isSuccessful) rtResponse.body()?.data ?: emptyList() else emptyList()

                _uiState.value = FavoritesState.Success(
                    favoriteExercises = exercises.take(3),
                    favoriteRoutines = routines.take(2)
                )
            } catch (e: Exception) {
                _uiState.value = FavoritesState.Error(e.localizedMessage ?: "Error cargando favoritos")
            }
        }
    }

    fun toggleRoutineFavorite(routineId: Int) {
        viewModelScope.launch {
            try {
                apiService.toggleRoutineFavorite(routineId)
                loadFavorites()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun toggleExerciseFavorite(exerciseId: Int) {
        viewModelScope.launch {
            try {
                apiService.toggleExerciseFavorite(exerciseId)
                loadFavorites()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
