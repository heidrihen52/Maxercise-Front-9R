package com.example.maxercisemovil.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.maxercisemovil.ui.screens.auth.LoginScreen
import com.example.maxercisemovil.ui.screens.auth.RegisterScreen
import com.example.maxercisemovil.ui.screens.exercises.ExercisesScreen
import com.example.maxercisemovil.ui.screens.favorites.FavoritesScreen
import com.example.maxercisemovil.ui.screens.home.HomeScreen
import com.example.maxercisemovil.ui.screens.profile.ProfileScreen
import com.example.maxercisemovil.ui.screens.routines.RoutinesScreen
import kotlinx.coroutines.launch

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object Admin : Screen("admin")
    object Exercises : Screen("exercises")
    object Routines : Screen("routines")
    object Favorites : Screen("favorites")
    object Profile : Screen("profile")
}

@Composable
fun AppNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Login.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        composable(Screen.Login.route) {
            val context = androidx.compose.ui.platform.LocalContext.current
            val viewModel: com.example.maxercisemovil.ui.screens.auth.LoginViewModel = 
                androidx.lifecycle.viewmodel.compose.viewModel(
                    factory = com.example.maxercisemovil.ui.screens.ViewModelFactory(context)
                )
            
            LoginScreen(
                viewModel = viewModel,
                onLoginSuccess = {
                    val authManager = com.example.maxercisemovil.data.AuthManager(context)
                    val route = if (authManager.getRole() == "SUPER") Screen.Admin.route else Screen.Home.route
                    navController.navigate(route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate(Screen.Register.route)
                }
            )
        }
        composable(Screen.Register.route) {
            val context = androidx.compose.ui.platform.LocalContext.current
            val viewModel: com.example.maxercisemovil.ui.screens.auth.RegisterViewModel = 
                androidx.lifecycle.viewmodel.compose.viewModel(
                    factory = com.example.maxercisemovil.ui.screens.ViewModelFactory(context)
                )
            
            RegisterScreen(
                viewModel = viewModel,
                onRegisterSuccess = {
                    val authManager = com.example.maxercisemovil.data.AuthManager(context)
                    val route = if (authManager.getRole() == "SUPER") Screen.Admin.route else Screen.Home.route
                    navController.navigate(route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.popBackStack()
                }
            )
        }
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToExercises = { navController.navigate(Screen.Exercises.route) }
            )
        }
        composable(Screen.Exercises.route) {
            val context = androidx.compose.ui.platform.LocalContext.current
            val viewModel: com.example.maxercisemovil.ui.screens.exercises.ExercisesViewModel = 
                androidx.lifecycle.viewmodel.compose.viewModel(
                    factory = com.example.maxercisemovil.ui.screens.ViewModelFactory(context)
                )
                
            ExercisesScreen(viewModel = viewModel)
        }
        composable(Screen.Routines.route) {
            val context = androidx.compose.ui.platform.LocalContext.current
            val viewModel: com.example.maxercisemovil.ui.screens.routines.RoutinesViewModel = 
                androidx.lifecycle.viewmodel.compose.viewModel(
                    factory = com.example.maxercisemovil.ui.screens.ViewModelFactory(context)
                )
            
            com.example.maxercisemovil.ui.screens.routines.RoutinesScreen(viewModel = viewModel)
        }
        composable(Screen.Favorites.route) {
            FavoritesScreen()
        }
        composable(Screen.Profile.route) {
            val context = androidx.compose.ui.platform.LocalContext.current
            val scope = rememberCoroutineScope()
            ProfileScreen(
                onLogout = {
                    val authManager = com.example.maxercisemovil.data.AuthManager(context)
                    val wearableManager = com.example.maxercisemovil.sync.WearableDataLayerManager(context)
                    authManager.clearAuth()
                    scope.launch { wearableManager.sendLogoutToWatch() }
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.Admin.route) {
            val context = androidx.compose.ui.platform.LocalContext.current
            val scope = rememberCoroutineScope()
            com.example.maxercisemovil.ui.screens.admin.AdminScreen(
                onLogout = {
                    val authManager = com.example.maxercisemovil.data.AuthManager(context)
                    val wearableManager = com.example.maxercisemovil.sync.WearableDataLayerManager(context)
                    authManager.clearAuth()
                    scope.launch { wearableManager.sendLogoutToWatch() }
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}
