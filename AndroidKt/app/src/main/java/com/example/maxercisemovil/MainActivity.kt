package com.example.maxercisemovil

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import com.example.maxercisemovil.data.AuthManager
import com.example.maxercisemovil.navigation.AppNavHost
import com.example.maxercisemovil.navigation.Screen
import com.example.maxercisemovil.ui.theme.MaxerciseMovilTheme

import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        val authManager = AuthManager(this)
        val startDestination = if (authManager.isLoggedIn()) {
            // Auto-sync authentication state with the WearOS watch on app startup
            val token = authManager.getToken()
            val userId = authManager.getUserId()
            if (token != null) {
                val wearableManager = com.example.maxercisemovil.sync.WearableDataLayerManager(this)
                lifecycleScope.launch {
                    wearableManager.sendAuthToWatch(token, userId)
                }
            }
            if (authManager.getRole() == "SUPER") Screen.Admin.route else Screen.Home.route
        } else {
            Screen.Login.route
        }
        
        setContent {
            MaxerciseMovilTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    AppNavHost(
                         modifier = Modifier.padding(innerPadding),
                         startDestination = startDestination
                    )
                }
            }
        }
    }
}