package com.example.maxercisemovil.sync

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

/**
 * Receives messages from the watch on the phone.
 * Currently handles:
 * - /maxercise/workout-completed → shows a notification to the user
 */
class PhoneWearableListenerService : WearableListenerService() {

    companion object {
        private const val TAG = "PhoneWearableListener"
        private const val CHANNEL_ID = "maxercise_workout"
        private const val NOTIFICATION_ID = 1001
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        Log.d(TAG, "Message received: ${messageEvent.path}")

        when (messageEvent.path) {
            "/maxercise/workout-completed" -> {
                val data = String(messageEvent.data)
                showWorkoutCompletedNotification(data)
            }
        }
    }

    private fun showWorkoutCompletedNotification(data: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create notification channel (required for Android 8+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Entrenamientos",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notificaciones de entrenamientos completados desde el reloj"
            }
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("¡Entrenamiento completado! 🏋️")
            .setContentText("Has terminado tu sesión desde el reloj. $data")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }
}
