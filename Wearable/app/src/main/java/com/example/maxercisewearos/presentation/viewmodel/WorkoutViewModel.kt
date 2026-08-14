package com.example.maxercisewearos.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.maxercisewearos.data.model.RoutineExercise
import com.example.maxercisewearos.data.repository.SavedSession
import com.example.maxercisewearos.data.repository.WorkoutRepository
import com.example.maxercisewearos.data.repository.WorkoutSummary
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class WorkoutViewModel(private val repository: WorkoutRepository) : ViewModel() {

    val currentExercise = repository.routineExercises.combine(repository.currentExerciseIndex) { list, index ->
        list.getOrNull(index)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val currentSeries = repository.currentSeries.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 1)

    private val _isSafe = MutableStateFlow(true)
    val isSafe: StateFlow<Boolean> = _isSafe

    private val _restrictedReason = MutableStateFlow<String?>(null)
    val restrictedReason: StateFlow<String?> = _restrictedReason

    private val _vibrationEvent = MutableSharedFlow<Unit>()
    val vibrationEvent = _vibrationEvent.asSharedFlow()

    private val _exerciseCompletedEvent = MutableSharedFlow<String>()
    val exerciseCompletedEvent = _exerciseCompletedEvent.asSharedFlow()

    private val _workoutSummary = MutableStateFlow<WorkoutSummary?>(null)
    val workoutSummary: StateFlow<WorkoutSummary?> = _workoutSummary

    val activeSession = repository.activeSession
    val currentHeartRate = repository.currentHeartRate

    val progress = repository.routineExercises.combine(repository.currentExerciseIndex) { list, index ->
        ExerciseProgress(index + 1, list.size.coerceAtLeast(1))
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), ExerciseProgress(1, 1))

    val isLastExercise = repository.routineExercises.combine(repository.currentExerciseIndex) { list, index ->
        index >= list.size - 1
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    val isWorkoutFinished = combine(isLastExercise, currentSeries, currentExercise) { lastEx, series, exercise ->
        lastEx && exercise != null && series >= exercise.sets
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    init {
        viewModelScope.launch {
            currentExercise.collect { exercise ->
                exercise?.let {
                    val reason = repository.getMatchingRestriction(it.exercise_id)
                    if (reason != null) {
                        _isSafe.value = false
                        _restrictedReason.value = reason
                        _vibrationEvent.emit(Unit)
                    } else {
                        _isSafe.value = true
                        _restrictedReason.value = null
                    }
                }
            }
        }
    }

    fun startWorkout(routineId: Int, dayNumber: Int) {
        repository.startWorkoutSession(routineId, dayNumber)
    }

    fun resumeWorkout(session: SavedSession) {
        repository.resumeWorkoutSession(session)
    }

    fun abandonWorkout() {
        repository.clearActiveSession()
    }

    fun prepareSummary() {
        _workoutSummary.value = repository.getWorkoutSummary()
    }

    fun completeSeries() {
        val exercise = currentExercise.value ?: return
        val series = currentSeries.value
        if (series >= exercise.sets) {
            viewModelScope.launch {
                _exerciseCompletedEvent.emit(exercise.exercise?.name ?: "Ejercicio")
            }
            repository.nextSeries()
        } else {
            repository.nextSeries()
        }
    }

    fun finishWorkout(userId: Int) {
        viewModelScope.launch {
            repository.finishBlock(userId)
        }
    }
}

data class ExerciseProgress(
    val current: Int,
    val total: Int
)
