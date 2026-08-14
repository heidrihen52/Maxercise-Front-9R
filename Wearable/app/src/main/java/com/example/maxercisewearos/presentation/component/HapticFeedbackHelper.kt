package com.example.maxercisewearos.presentation.component

import android.content.Context
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.Build

class HapticFeedbackHelper(private val context: Context) {
    private val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator

    fun vibrateStartRest() {
        // 1 short pulse
        vibrate(longArrayOf(0, 150), -1)
    }

    fun vibrateEndRest() {
        // 2 quick pulses
        vibrate(longArrayOf(0, 100, 80, 100), -1)
    }

    fun vibrateExerciseCompleted() {
        // 1 long satisfying pulse
        vibrate(longArrayOf(0, 500), -1)
    }

    fun vibrateMedicalAlert() {
        // 3 quick alarming pulses
        vibrate(longArrayOf(0, 120, 80, 120, 80, 120), -1)
    }

    private fun vibrate(pattern: LongArray, repeat: Int) {
        vibrator?.let { v ->
            if (v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createWaveform(pattern, repeat))
                } else {
                    @Suppress("DEPRECATION")
                    v.vibrate(pattern, repeat)
                }
            }
        }
    }
}
