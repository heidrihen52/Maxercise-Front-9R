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
import androidx.wear.compose.navigation3.rememberSwipeDismissableSceneStrategy
import com.example.maxercisewearos.data.repository.WorkoutRepository
import com.example.maxercisewearos.data.sync.TokenManager
import com.example.maxercisewearos.presentation.screen.ExerciseScreen
import com.example.maxercisewearos.presentation.screen.HomeScreen
import com.example.maxercisewearos.presentation.screen.LinkScreen
import com.example.maxercisewearos.presentation.screen.TimerScreen
import com.example.maxercisewearos.presentation.screen.SummaryScreen
import com.example.maxercisewearos.presentation.theme.MaxerciseWearOSTheme
import com.example.maxercisewearos.presentation.viewmodel.HomeViewModel
import com.example.maxercisewearos.presentation.viewmodel.TimerViewModel
import com.example.maxercisewearos.presentation.viewmodel.WorkoutViewModel
import kotlinx.serialization.Serializable

@Serializable object HomeDestination : NavKey
@Serializable object ExerciseDestination : NavKey
@Serializable object TimerDestination : NavKey
@Serializable object SummaryDestination : NavKey

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Local Node.js Backend URL (using 127.0.0.1 for adb reverse tunnel)
        val baseUrl = "http://127.0.0.1:3000/"
        val repository = WorkoutRepository.create(baseUrl, applicationContext)
        val tokenManager = TokenManager(applicationContext)

        setContent {
            WearApp(repository, tokenManager)
        }
    }
}

@Composable
fun WearApp(repository: WorkoutRepository, tokenManager: TokenManager) {
    val isAuth by tokenManager.authState.collectAsStateWithLifecycle()

    MaxerciseWearOSTheme {
        AppScaffold {
            if (!isAuth) {
                // If not authenticated (no JWT from phone yet), show linking prompt screen
                LinkScreen()
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
                                    userId = userId
                                )
                            }
                            is ExerciseDestination -> NavEntry(key) {
                                ExerciseScreen(
                                    viewModel = workoutViewModel,
                                    onStartRest = { 
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
                            else -> NavEntry(key) { }
                        }
                    },
                    sceneStrategies = listOf(rememberSwipeDismissableSceneStrategy())
                )
            }
        }
    }
}
