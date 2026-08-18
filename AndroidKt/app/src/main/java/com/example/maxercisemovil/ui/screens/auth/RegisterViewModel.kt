package com.example.maxercisemovil.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.maxercisemovil.data.AuthManager
import com.example.maxercisemovil.network.ApiService
import com.example.maxercisemovil.network.models.RegisterRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class RegisterState {
    object Idle : RegisterState()
    object Loading : RegisterState()
    object Success : RegisterState()
    data class Error(val message: String) : RegisterState()
}

class RegisterViewModel(
    private val apiService: ApiService,
    private val authManager: AuthManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<RegisterState>(RegisterState.Idle)
    val uiState: StateFlow<RegisterState> = _uiState.asStateFlow()

    fun register(firstName: String, lastName: String, email: String, phone: String, bodyType: String, birthDate: String, password: String) {
        _uiState.value = RegisterState.Loading
        viewModelScope.launch {
            try {
                val request = RegisterRequest(
                    firstName = firstName,
                    lastName = lastName,
                    email = email,
                    phoneNumber = phone,
                    bodyType = bodyType,
                    birthDate = birthDate,
                    password = password
                )
                val response = apiService.register(request)
                if (response.isSuccessful) {
                    val apiResponse = response.body()
                    if (apiResponse != null && apiResponse.success) {
                        _uiState.value = RegisterState.Success
                    } else {
                        _uiState.value = RegisterState.Error("Invalid response from server")
                    }
                } else {
                    val errorString = response.errorBody()?.string()
                    val errorMessage = try {
                        if (!errorString.isNullOrEmpty()) {
                            org.json.JSONObject(errorString).getString("message")
                        } else {
                            response.message()
                        }
                    } catch (e: Exception) {
                        response.message()
                    }
                    _uiState.value = RegisterState.Error(errorMessage)
                }
            } catch (e: Exception) {
                _uiState.value = RegisterState.Error(e.localizedMessage ?: "Network error occurred")
            }
        }
    }
}
