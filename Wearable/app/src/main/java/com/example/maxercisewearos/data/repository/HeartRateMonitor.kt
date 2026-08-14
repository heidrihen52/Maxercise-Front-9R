package com.example.maxercisewearos.data.repository

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class HeartRateMonitor(context: Context) : SensorEventListener {
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val heartRateSensor = sensorManager.getDefaultSensor(Sensor.TYPE_HEART_RATE)
    
    private val _currentHeartRate = MutableStateFlow(75) // default resting HR
    val currentHeartRate: StateFlow<Int> = _currentHeartRate
    
    private val recordedRates = mutableListOf<Int>()
    private var mockJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    fun startMonitoring() {
        recordedRates.clear()
        _currentHeartRate.value = 75
        if (heartRateSensor != null) {
            sensorManager.registerListener(this, heartRateSensor, SensorManager.SENSOR_DELAY_NORMAL)
        } else {
            // Mock heart rate for emulator
            mockJob = scope.launch {
                while (isActive) {
                    delay(2000)
                    val base = _currentHeartRate.value
                    val change = (-5..7).random()
                    val next = (base + change).coerceIn(100, 165)
                    _currentHeartRate.value = next
                    recordedRates.add(next)
                }
            }
        }
    }

    fun stopMonitoring() {
        if (heartRateSensor != null) {
            sensorManager.unregisterListener(this)
        }
        mockJob?.cancel()
        mockJob = null
    }

    fun getAverage(): Int {
        if (recordedRates.isEmpty()) return 125
        return recordedRates.average().toInt()
    }

    fun getMax(): Int {
        if (recordedRates.isEmpty()) return 155
        return recordedRates.maxOrNull() ?: 155
    }

    override fun onSensorChanged(event: SensorEvent?) {
        event?.values?.firstOrNull()?.let { value ->
            val hr = value.toInt()
            if (hr > 0) {
                _currentHeartRate.value = hr
                recordedRates.add(hr)
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
