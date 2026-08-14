package com.example.maxercisemovil.ui.screens

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.maxercisemovil.data.AuthManager
import com.example.maxercisemovil.network.ApiClient
import com.example.maxercisemovil.sync.WearableDataLayerManager
import com.example.maxercisemovil.ui.screens.auth.LoginViewModel
import com.example.maxercisemovil.ui.screens.auth.RegisterViewModel

class ViewModelFactory(private val context: Context) : ViewModelProvider.Factory {
    
    private val authManager by lazy { AuthManager(context) }
    private val apiService by lazy { ApiClient.getService(authManager) }
    private val wearableManager by lazy { WearableDataLayerManager(context) }

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when {
            modelClass.isAssignableFrom(LoginViewModel::class.java) -> {
                LoginViewModel(apiService, authManager, wearableManager) as T
            }
            modelClass.isAssignableFrom(RegisterViewModel::class.java) -> {
                RegisterViewModel(apiService, authManager) as T
            }
            modelClass.isAssignableFrom(com.example.maxercisemovil.ui.screens.exercises.ExercisesViewModel::class.java) -> {
                com.example.maxercisemovil.ui.screens.exercises.ExercisesViewModel(apiService) as T
            }
            modelClass.isAssignableFrom(com.example.maxercisemovil.ui.screens.routines.RoutinesViewModel::class.java) -> {
                com.example.maxercisemovil.ui.screens.routines.RoutinesViewModel(apiService) as T
            }
            modelClass.isAssignableFrom(com.example.maxercisemovil.ui.screens.users.AdminUsersViewModel::class.java) -> {
                com.example.maxercisemovil.ui.screens.users.AdminUsersViewModel(apiService) as T
            }
            else -> throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
        }
    }
}
