package com.example.maxercisewearos.data.repository

import android.content.Context
import android.content.SharedPreferences
import kotlinx.serialization.Serializable

class WorkoutSessionPersistence(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("workout_session_prefs", Context.MODE_PRIVATE)

    fun saveSession(routineId: Int, dayNumber: Int, exerciseIndex: Int, series: Int, startedAt: String) {
        prefs.edit()
            .putInt("routine_id", routineId)
            .putInt("day_number", dayNumber)
            .putInt("exercise_index", exerciseIndex)
            .putInt("series", series)
            .putString("started_at", startedAt)
            .putBoolean("has_active_session", true)
            .apply()
    }

    fun getSession(): SavedSession? {
        if (!prefs.getBoolean("has_active_session", false)) return null
        return SavedSession(
            routineId = prefs.getInt("routine_id", 0),
            dayNumber = prefs.getInt("day_number", 0),
            exerciseIndex = prefs.getInt("exercise_index", 0),
            series = prefs.getInt("series", 1),
            startedAt = prefs.getString("started_at", "") ?: ""
        )
    }

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}

@Serializable
data class SavedSession(
    val routineId: Int,
    val dayNumber: Int,
    val exerciseIndex: Int,
    val series: Int,
    val startedAt: String
)
