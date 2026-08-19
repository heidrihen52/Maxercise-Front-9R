package com.example.maxercisewearos.data.repository

import android.content.Context
import android.util.Log
import androidx.health.services.client.HealthServices
import androidx.health.services.client.MeasureCallback
import androidx.health.services.client.data.Availability
import androidx.health.services.client.data.DataPointContainer
import androidx.health.services.client.data.DataType
import androidx.health.services.client.data.DataTypeAvailability
import androidx.health.services.client.data.DeltaDataType
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class HeartRateMonitor(context: Context) {
    private val measureClient = HealthServices.getClient(context).measureClient
    
    private val _currentHeartRate = MutableStateFlow(75) // default resting HR
    val currentHeartRate: StateFlow<Int> = _currentHeartRate
    
    private val recordedRates = mutableListOf<Int>()
    private var mockJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private val measureCallback = object : MeasureCallback {
        override fun onAvailabilityChanged(
            dataType: DeltaDataType<*, *>,
            availability: Availability
        ) {
            if (availability is DataTypeAvailability) {
                Log.d("HeartRateMonitor", "Availability changed: $availability")
            }
        }

        override fun onDataReceived(data: DataPointContainer) {
            val heartRatePoints = data.getData(DataType.HEART_RATE_BPM)
            heartRatePoints.lastOrNull()?.let { point ->
                val hr = point.value.toInt()
                if (hr > 0) {
                    _currentHeartRate.value = hr
                    recordedRates.add(hr)
                }
            }
        }
    }

    fun startMonitoring() {
        recordedRates.clear()
        _currentHeartRate.value = 75
        
        scope.launch {
            try {
                // Register for continuous heart rate updates using Health Services
                measureClient.registerMeasureCallback(DataType.HEART_RATE_BPM, measureCallback)
            } catch (e: Exception) {
                Log.e("HeartRateMonitor", "Failed to register Health Services callback, using mock", e)
                startMock()
            }
        }
    }

    private fun startMock() {
        mockJob?.cancel()
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

    fun stopMonitoring() {
        scope.launch {
            try {
                measureClient.unregisterMeasureCallbackAsync(DataType.HEART_RATE_BPM, measureCallback)
            } catch (e: Exception) {
                Log.e("HeartRateMonitor", "Failed to unregister Health Services", e)
            }
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
}
