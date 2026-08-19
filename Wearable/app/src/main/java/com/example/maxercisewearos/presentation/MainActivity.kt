package com.example.maxercisewearos.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavEntry
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.TimeText
import androidx.wear.compose.navigation3.rememberSwipeDismissableSceneStrategy
import com.example.maxercisewearos.data.repository.WorkoutRepository
import com.example.maxercisewearos.data.sync.TokenManager
import com.example.maxercisewearos.presentation.screen.ExerciseScreen
import com.example.maxercisewearos.presentation.screen.HomeScreen
import com.example.maxercisewearos.presentation.screen.LinkScreen
import com.example.maxercisewearos.presentation.screen.TimerScreen
import com.example.maxercisewearos.presentation.screen.SummaryScreen
import com.example.maxercisewearos.presentation.screen.FavoritesScreen
import com.example.maxercisewearos.presentation.theme.MaxerciseWearOSTheme
import com.example.maxercisewearos.presentation.viewmodel.HomeViewModel
import com.example.maxercisewearos.presentation.viewmodel.TimerViewModel
import com.example.maxercisewearos.presentation.viewmodel.WorkoutViewModel
import kotlinx.serialization.Serializable

import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalContext
import com.example.maxercisewearos.data.sync.WearableDataLayerService
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat

@Serializable object HomeDestination : NavKey
@Serializable object ExerciseDestination : NavKey
@Serializable object TimerDestination : NavKey
@Serializable object SummaryDestination : NavKey
@Serializable object FavoritesDestination : NavKey

class MainActivity : ComponentActivity() {

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        // Permission handled
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Request POST_NOTIFICATIONS permission for Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        // Local Node.js Backend URL (using host LAN IP)
        val baseUrl = "http://192.168.1.87:3000/"
        val repository = WorkoutRepository.create(baseUrl, applicationContext)
        val tokenManager = TokenManager(applicationContext)

        lifecycleScope.launch {
            if (!tokenManager.isAuthenticated()) {
                val found = WearableDataLayerService.checkStoredAuthDataItem(applicationContext)
                if (!found) {
                    WearableDataLayerService.requestAuthFromPhone(applicationContext)
                }
            }
        }

        setContent {
            WearApp(repository, tokenManager)
        }
    }
}

@Composable
fun WearApp(repository: WorkoutRepository, tokenManager: TokenManager) {
    val isAuth by tokenManager.authState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    LaunchedEffect(isAuth) {
        if (!isAuth) {
            val found = WearableDataLayerService.checkStoredAuthDataItem(context)
            if (!found) {
                WearableDataLayerService.requestAuthFromPhone(context)
            }
        }
    }

    MaxerciseWearOSTheme {
        AppScaffold(
            timeText = { TimeText() }
        ) {
            if (!isAuth) {
                // If not authenticated (no JWT from phone yet), show linking prompt screen
                LinkScreen(
                    onSyncRequested = {
                        scope.launch {
                            val found = WearableDataLayerService.checkStoredAuthDataItem(context)
                            if (!found) {
                                WearableDataLayerService.requestAuthFromPhone(context)
                            }
                        }
                    }
                )
            } else {
                // Authenticated: show standard workout navigation flow
                val backStack = rememberNavBackStack(HomeDestination)
                
                val homeViewModel: HomeViewModel = viewModel { HomeViewModel(repository) }
                val workoutViewModel: WorkoutViewModel = viewModel { WorkoutViewModel(repository) }
                val timerViewModel: TimerViewModel = viewModel()

                val userId = tokenManager.getUserId()

                NavDisplay(
                    backStack = backStack,
                    entryProvider = { key ->
                        when (key) {
                            is HomeDestination -> NavEntry(key) {
                                HomeScreen(
                                    viewModel = homeViewModel,
                                    onStartWorkout = { backStack.add(ExerciseDestination) },
                                    onNavigateToFavorites = { backStack.add(FavoritesDestination) },
                                    userId = userId
                                )
                            }
                            is ExerciseDestination -> NavEntry(key) {
                                ExerciseScreen(
                                    viewModel = workoutViewModel,
                                    onCompleteSeriesAndRest = { 
                                        timerViewModel.startTimer(60)
                                        backStack.add(TimerDestination) 
                                    },
                                    onFinishWorkout = {
                                        workoutViewModel.prepareSummary()
                                        backStack.add(SummaryDestination)
                                    }
                                )
                            }
                            is TimerDestination -> NavEntry(key) {
                                TimerScreen(
                                    viewModel = timerViewModel,
                                    onFinish = { backStack.removeAt(backStack.size - 1) }
                                )
                            }
                            is SummaryDestination -> NavEntry(key) {
                                SummaryScreen(
                                    viewModel = workoutViewModel,
                                    onFinish = {
                                        workoutViewModel.finishWorkout(userId)
                                        backStack.clear()
                                        backStack.add(HomeDestination)
                                    }
                                )
                            }
                            is FavoritesDestination -> NavEntry(key) {
                                FavoritesScreen(
                                    viewModel = homeViewModel,
                                    onSelectRoutine = {
                                        backStack.add(ExerciseDestination)
                                    },
                                    userId = userId
                                )
                            }
                            else -> NavEntry(key) { }
                        }
                    },
                    sceneStrategies = listOf(rememberSwipeDismissableSceneStrategy())
                )
            }
        }
    }
}
