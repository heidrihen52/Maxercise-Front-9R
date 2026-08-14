package com.example.maxercisemovil.ui.screens.routines

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.maxercisemovil.network.ApiService
import com.example.maxercisemovil.network.models.Routine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class RoutinesState {
    object Loading : RoutinesState()
    data class Success(val routines: List<Routine>) : RoutinesState()
    data class Error(val message: String) : RoutinesState()
}

class RoutinesViewModel(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow<RoutinesState>(RoutinesState.Loading)
    val uiState: StateFlow<RoutinesState> = _uiState.asStateFlow()

    init {
        fetchRoutines()
    }

    fun fetchRoutines() {
        _uiState.value = RoutinesState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.getRoutines()
                if (response.isSuccessful) {
                    val apiResponse = response.body()
                    val routines = apiResponse?.data ?: emptyList()
                    _uiState.value = RoutinesState.Success(routines)
                } else {
                    _uiState.value = RoutinesState.Error("Failed to fetch routines: ${response.message()}")
                }
            } catch (e: Exception) {
                _uiState.value = RoutinesState.Error(e.localizedMessage ?: "Network error")
            }
        }
    }
}
