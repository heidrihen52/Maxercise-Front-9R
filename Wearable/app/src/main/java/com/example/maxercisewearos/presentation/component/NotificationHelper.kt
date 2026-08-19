package com.example.maxercisewearos.presentation.component

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.wear.ongoing.OngoingActivity
import androidx.wear.ongoing.Status
import com.example.maxercisewearos.R
import com.example.maxercisewearos.presentation.MainActivity

object NotificationHelper {

    private const val WORKOUT_CHANNEL_ID = "workout_channel"
    private const val SYNC_CHANNEL_ID = "sync_channel"
    private const val ONGOING_NOTIFICATION_ID = 1001
    private const val SYNC_NOTIFICATION_ID = 1002

    fun createChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val workoutChannel = NotificationChannel(
                WORKOUT_CHANNEL_ID,
                "Entrenamiento en curso",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Muestra la actividad en curso durante el entrenamiento"
            }

            val syncChannel = NotificationChannel(
                SYNC_CHANNEL_ID,
                "Sincronización",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notificaciones de sincronización con el celular"
            }

            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(workoutChannel)
            manager.createNotificationChannel(syncChannel)
        }
    }

    fun showOngoingWorkoutNotification(context: Context) {
        createChannels(context)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, WORKOUT_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Maxercise")
            .setContentText("Entrenamiento en curso")
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        val ongoingActivityStatus = Status.Builder()
            .addTemplate("Entrenando...")
            .build()

        val ongoingActivity = OngoingActivity.Builder(
            context, ONGOING_NOTIFICATION_ID, builder
        )
            .setAnimatedIcon(R.mipmap.ic_launcher)
            .setStaticIcon(R.mipmap.ic_launcher)
            .setTouchIntent(pendingIntent)
            .setStatus(ongoingActivityStatus)
            .build()

        ongoingActivity.apply(context)

        try {
            NotificationManagerCompat.from(context).notify(ONGOING_NOTIFICATION_ID, builder.build())
        } catch (e: SecurityException) {
            // Permission not granted
        }
    }

    fun cancelOngoingWorkoutNotification(context: Context) {
        NotificationManagerCompat.from(context).cancel(ONGOING_NOTIFICATION_ID)
    }

    fun showSyncSuccessNotification(context: Context) {
        createChannels(context)

        val builder = NotificationCompat.Builder(context, SYNC_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Sincronización Exitosa")
            .setContentText("Rutina actualizada desde el celular")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)

        try {
            NotificationManagerCompat.from(context).notify(SYNC_NOTIFICATION_ID, builder.build())
        } catch (e: SecurityException) {
            // Permission not granted
        }
    }
}
