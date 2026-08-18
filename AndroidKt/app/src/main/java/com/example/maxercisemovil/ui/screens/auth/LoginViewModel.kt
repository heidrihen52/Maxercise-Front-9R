package com.example.maxercisemovil.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.maxercisemovil.data.AuthManager
import com.example.maxercisemovil.network.ApiService
import com.example.maxercisemovil.network.models.LoginRequest
import com.example.maxercisemovil.sync.WearableDataLayerManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class LoginState {
    object Idle : LoginState()
    object Loading : LoginState()
    object Success : LoginState()
    data class Error(val message: String) : LoginState()
}

class LoginViewModel(
    private val apiService: ApiService,
    private val authManager: AuthManager,
    private val wearableManager: WearableDataLayerManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<LoginState>(LoginState.Idle)
    val uiState: StateFlow<LoginState> = _uiState.asStateFlow()

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _uiState.value = LoginState.Error("Email and password cannot be empty")
            return
        }

        _uiState.value = LoginState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.login(LoginRequest(email, password))
                if (response.isSuccessful) {
                    val apiResponse = response.body()
                    if (apiResponse != null && apiResponse.success) {
                        val loginResponse = apiResponse.data
                        authManager.saveToken(loginResponse.token)
                        authManager.saveRole(loginResponse.user.role ?: "NORMAL")

                        // Send JWT to the connected watch via Data Layer
                        val userId = loginResponse.user.id
                        authManager.saveUserId(userId)
                        wearableManager.sendAuthToWatch(loginResponse.token, userId)

                        _uiState.value = LoginState.Success
                    } else {
                        _uiState.value = LoginState.Error("Invalid response from server")
                    }
                } else {
                    _uiState.value = LoginState.Error("Login failed: ${response.message()}")
                }
            } catch (e: Exception) {
                _uiState.value = LoginState.Error(e.localizedMessage ?: "Network error occurred")
            }
        }
    }
}
