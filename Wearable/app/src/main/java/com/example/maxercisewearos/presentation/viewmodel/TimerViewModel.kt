package com.example.maxercisewearos.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch

class TimerViewModel : ViewModel() {

    private val _timeLeft = MutableStateFlow(60L) // Default 60s
    val timeLeft: StateFlow<Long> = _timeLeft

    private val _isRunning = MutableStateFlow(false)
    val isRunning: StateFlow<Boolean> = _isRunning

    private val _timerFinishedEvent = MutableSharedFlow<Unit>()
    val timerFinishedEvent = _timerFinishedEvent.asSharedFlow()

    private var timerJob: Job? = null

    fun startTimer(initialSeconds: Long = 60L) {
        _timeLeft.value = initialSeconds
        resumeTimer()
    }

    fun resumeTimer() {
        if (_isRunning.value) return
        _isRunning.value = true
        timerJob = viewModelScope.launch {
            while (_timeLeft.value > 0) {
                delay(1000)
                _timeLeft.value -= 1
            }
            _isRunning.value = false
            if (_timeLeft.value == 0L) {
                _timerFinishedEvent.emit(Unit)
            }
        }
    }

    fun pauseTimer() {
        timerJob?.cancel()
        _isRunning.value = false
    }

    fun stopTimer() {
        timerJob?.cancel()
        _timeLeft.value = 0
        _isRunning.value = false
    }

    fun adjustTime(seconds: Long) {
        val newTime = _timeLeft.value + seconds
        _timeLeft.value = if (newTime < 0) 0 else newTime
    }
}
