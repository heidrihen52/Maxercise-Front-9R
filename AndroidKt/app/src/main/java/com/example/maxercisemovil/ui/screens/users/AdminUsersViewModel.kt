package com.example.maxercisemovil.ui.screens.users

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.maxercisemovil.network.ApiService
import com.example.maxercisemovil.network.models.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AdminUsersState {
    object Loading : AdminUsersState()
    data class Success(val users: List<User>) : AdminUsersState()
    data class Error(val message: String) : AdminUsersState()
}

class AdminUsersViewModel(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow<AdminUsersState>(AdminUsersState.Loading)
    val uiState: StateFlow<AdminUsersState> = _uiState.asStateFlow()

    init {
        fetchUsers()
    }

    fun fetchUsers() {
        _uiState.value = AdminUsersState.Loading
        viewModelScope.launch {
            try {
                // By default get first 50 users as requested in plan (ignoring infinite pagination for now)
                val response = apiService.getUsers(page = 1, limit = 50)
                if (response.isSuccessful) {
                    val apiResponse = response.body()
                    val users = apiResponse?.data ?: emptyList()
                    _uiState.value = AdminUsersState.Success(users)
                } else {
                    _uiState.value = AdminUsersState.Error("Failed to fetch users: ${response.message()}")
                }
            } catch (e: Exception) {
                _uiState.value = AdminUsersState.Error(e.localizedMessage ?: "Network error")
            }
        }
    }
}
