package com.example.maxercisemovil.sync

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.maxercisemovil.data.AuthManager
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Receives messages from the watch on the phone.
 * Currently handles:
 * - /maxercise/workout-completed → shows a notification to the user
 * - /maxercise/request-auth      → watch requested active session, phone sends token back if logged in
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
            "/maxercise/workout-started" -> {
                showWorkoutStartedNotification()
            }
            "/maxercise/workout-progress" -> {
                val data = String(messageEvent.data)
                showWorkoutProgressNotification(data)
            }
            "/maxercise/request-auth" -> {
                val authManager = AuthManager(this)
                if (authManager.isLoggedIn()) {
                    val token = authManager.getToken()
                    val userId = authManager.getUserId()
                    if (token != null) {
                        val wearableManager = WearableDataLayerManager(this)
                        CoroutineScope(Dispatchers.IO).launch {
                            wearableManager.sendAuthToWatch(token, userId)
                        }
                    }
                }
            }
        }
    }

    private fun showWorkoutStartedNotification() {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createChannel(notificationManager)

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("¡Entrenamiento Iniciado!")
            .setContentText("Sigue tus instrucciones desde el reloj.")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(1002, notification)
    }

    private fun showWorkoutProgressNotification(data: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createChannel(notificationManager)

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Progreso de rutina")
            .setContentText(data) // "ejercicio=X,serie=Y"
            .setPriority(NotificationCompat.PRIORITY_LOW) // Low priority so it doesn't buzz constantly
            .setAutoCancel(true)
            .build()

        notificationManager.notify(1003, notification)
    }

    private fun showWorkoutCompletedNotification(data: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createChannel(notificationManager)

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("¡Entrenamiento completado! 🏋️")
            .setContentText("Has terminado tu sesión desde el reloj. $data")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun createChannel(notificationManager: NotificationManager) {
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
    }
}
