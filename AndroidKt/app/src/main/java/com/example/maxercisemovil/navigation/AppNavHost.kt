package com.example.maxercisemovil.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.layout.padding
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.maxercisemovil.ui.theme.BluePrimary
import com.example.maxercisemovil.ui.screens.auth.LoginScreen
import com.example.maxercisemovil.ui.screens.auth.RegisterScreen
import com.example.maxercisemovil.ui.screens.exercises.ExercisesScreen
import com.example.maxercisemovil.ui.screens.favorites.FavoritesScreen
import com.example.maxercisemovil.ui.screens.favorites.FavoritesViewModel
import com.example.maxercisemovil.ui.screens.home.HomeScreen
import com.example.maxercisemovil.ui.screens.home.HomeViewModel
import com.example.maxercisemovil.ui.screens.profile.ProfileScreen
import com.example.maxercisemovil.ui.screens.routines.RoutinesScreen
import com.example.maxercisemovil.ui.screens.landing.LandingScreen
import com.example.maxercisemovil.ui.screens.auth.ForgotPasswordScreen
import com.example.maxercisemovil.ui.screens.auth.ResetPasswordScreen
import com.example.maxercisemovil.ui.screens.auth.VerifyEmailScreen
import com.example.maxercisemovil.ui.screens.profile.QuestionnaireScreen
import com.example.maxercisemovil.ui.screens.preview.PreviewScreen
import kotlinx.coroutines.launch

sealed class Screen(val route: String) {
    object Landing : Screen("landing")
    object Login : Screen("login")
    object Register : Screen("register")
    object ForgotPassword : Screen("forgot_password")
    object ResetPassword : Screen("reset_password")
    object VerifyEmail : Screen("verify_email")
    object Questionnaire : Screen("questionnaire")
    object Preview : Screen("preview")
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
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomBarRoutes = listOf(
        Screen.Home.route,
        Screen.Exercises.route,
        Screen.Routines.route,
        Screen.Favorites.route,
        Screen.Profile.route
    )

    Scaffold(
        bottomBar = {
            if (currentRoute in bottomBarRoutes) {
                NavigationBar(
                    containerColor = Color.White,
                    contentColor = BluePrimary
                ) {
                    val items = listOf(
                        Triple(Screen.Home.route, "Inicio", Icons.Default.Home),
                        Triple(Screen.Exercises.route, "Ejercicios", Icons.Default.Search),
                        Triple(Screen.Routines.route, "Rutinas", Icons.Default.List),
                        Triple(Screen.Favorites.route, "Favoritos", Icons.Default.Favorite),
                        Triple(Screen.Profile.route, "Perfil", Icons.Default.Person)
                    )
                    items.forEach { (route, label, icon) ->
                        NavigationBarItem(
                            icon = { Icon(icon, contentDescription = label) },
                            label = { Text(label) },
                            selected = currentRoute == route,
                            onClick = {
                                navController.navigate(route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        },
        modifier = modifier
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding)
        ) {
        composable(Screen.Landing.route) {
            LandingScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                onNavigateToRegister = { navController.navigate(Screen.Register.route) }
            )
        }
        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable(Screen.ResetPassword.route) {
            ResetPasswordScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login.route) { popUpTo(0) { inclusive = true } } }
            )
        }
        composable(Screen.VerifyEmail.route) {
            VerifyEmailScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login.route) { popUpTo(0) { inclusive = true } } }
            )
        }
        composable(Screen.Questionnaire.route) {
            QuestionnaireScreen(
                onComplete = { navController.navigate(Screen.Home.route) { popUpTo(0) { inclusive = true } } }
            )
        }
        composable(Screen.Preview.route) {
            PreviewScreen(
                onNavigateToLogin = { navController.navigate(Screen.Login.route) },
                onNavigateToRegister = { navController.navigate(Screen.Register.route) }
            )
        }
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
                },
                onNavigateToForgotPassword = {
                    navController.navigate(Screen.ForgotPassword.route)
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
                    navController.popBackStack()
                },
                onNavigateToLogin = {
                    navController.popBackStack()
                }
            )
        }
        composable(Screen.Home.route) {
            val context = androidx.compose.ui.platform.LocalContext.current
            val factory = com.example.maxercisemovil.ui.screens.ViewModelFactory(context)
            val viewModel: HomeViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = factory)
            HomeScreen(
                viewModel = viewModel,
                onNavigateToExercises = { navController.navigate(Screen.Exercises.route) },
                onNavigateToRoutines = { navController.navigate(Screen.Routines.route) }
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
            val context = androidx.compose.ui.platform.LocalContext.current
            val factory = com.example.maxercisemovil.ui.screens.ViewModelFactory(context)
            val viewModel: FavoritesViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = factory)
            FavoritesScreen(viewModel = viewModel)
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
}
