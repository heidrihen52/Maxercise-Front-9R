package com.example.maxercisewearos.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.maxercisewearos.data.repository.LoadState
import com.example.maxercisewearos.data.repository.WorkoutRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class HomeViewModel(private val repository: WorkoutRepository) : ViewModel() {

    val activeRoutine = repository.activeRoutine.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    val favoriteRoutines = repository.favoriteRoutines.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val favoriteExercises = repository.favoriteExercises.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val availableDays = repository.availableDays.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val activeSession = repository.activeSession.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    val loadState = repository.loadState.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), LoadState.Idle)

    fun sync(userId: Int) {
        viewModelScope.launch {
            repository.syncData(userId)
        }
    }

    fun retry(userId: Int) {
        sync(userId)
    }

    fun selectDay(dayNumber: Int) {
        repository.selectDay(dayNumber)
    }

    fun startWorkout(routineId: Int, dayNumber: Int) {
        repository.startWorkoutSession(routineId, dayNumber)
    }

    fun resumeWorkout(session: com.example.maxercisewearos.data.repository.SavedSession) {
        repository.resumeWorkoutSession(session)
    }

    fun selectFavoriteRoutine(userId: Int, routineId: Int, onComplete: () -> Unit) {
        viewModelScope.launch {
            val success = repository.activateAndSyncRoutine(userId, routineId)
            if (success) {
                repository.selectDay(1)
                repository.startWorkoutSession(routineId, 1)
                onComplete()
            }
        }
    }
}
