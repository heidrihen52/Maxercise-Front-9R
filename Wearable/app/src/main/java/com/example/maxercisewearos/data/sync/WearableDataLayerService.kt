package com.example.maxercisewearos.data.sync

import android.content.Intent
import com.google.android.gms.wearable.*
import kotlinx.coroutines.*
import kotlinx.coroutines.tasks.await

/**
 * WearableListenerService — receives data and messages from the companion phone app.
 *
 * Communication Paths:
 * - /maxercise/auth       → DataItem: JWT token + userId (DataClient, persistent)
 * - /maxercise/sync       → Message: trigger a data sync (MessageClient, fire-and-forget)
 * - /maxercise/logout     → Message: clear auth and return to unauthenticated state
 *
 * Outbound (from watch → phone):
 * - /maxercise/workout-completed → Message: notify phone that a workout was finished
 */
class WearableDataLayerService : WearableListenerService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var tokenManager: TokenManager

    override fun onCreate() {
        super.onCreate()
        tokenManager = TokenManager(applicationContext)
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }

    /**
     * Called when a DataItem is changed (created or updated) on the Data Layer.
     * We use this for persistent data like auth tokens.
     */
    override fun onDataChanged(dataEvents: DataEventBuffer) {
        dataEvents.forEach { event ->
            if (event.type == DataEvent.TYPE_CHANGED) {
                val dataItem = event.dataItem
                when (dataItem.uri.path) {
                    "/maxercise/auth" -> handleAuthData(dataItem)
                }
            }
        }
    }

    /**
     * Called when a message is received from the phone.
     * We use this for fire-and-forget commands.
     */
    override fun onMessageReceived(messageEvent: MessageEvent) {
        when (messageEvent.path) {
            "/maxercise/sync" -> {
                // Phone requested a sync — the app will pick this up on next resume
                com.example.maxercisewearos.presentation.component.NotificationHelper.showSyncSuccessNotification(this)
            }
            "/maxercise/logout" -> {
                tokenManager.clear()
            }
        }
    }

    /**
     * Extracts JWT token and userId from the DataItem sent by the phone.
     */
    private fun handleAuthData(dataItem: DataItem) {
        val dataMap = DataMapItem.fromDataItem(dataItem).dataMap
        val token = dataMap.getString("jwt_token") ?: return
        val userId = dataMap.getInt("user_id", 1)

        tokenManager.saveToken(token)
        tokenManager.saveUserId(userId)
        
        com.example.maxercisewearos.presentation.component.NotificationHelper.showSyncSuccessNotification(this)
    }

    companion object {
        /**
         * Send a message from the watch to the phone (e.g., workout completed).
         * Call from a coroutine scope.
         */
        suspend fun sendMessageToPhone(
            context: android.content.Context,
            path: String,
            data: ByteArray = ByteArray(0)
        ) {
            try {
                val nodeClient = Wearable.getNodeClient(context)
                val nodes = nodeClient.connectedNodes.await()
                val messageClient = Wearable.getMessageClient(context)
                nodes.forEach { node ->
                    messageClient.sendMessage(node.id, path, data).await()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        /**
         * Sends a message to the phone requesting active auth session.
         */
        suspend fun requestAuthFromPhone(context: android.content.Context) {
            sendMessageToPhone(context, "/maxercise/request-auth")
        }

        /**
         * Checks if a persistent auth DataItem exists in Google Play Services DataClient.
         * If found, extracts and saves the token to TokenManager.
         */
        suspend fun checkStoredAuthDataItem(context: android.content.Context): Boolean {
            return try {
                val dataClient = Wearable.getDataClient(context)
                val dataItems = dataClient.dataItems.await()
                var foundToken = false
                dataItems.forEach { dataItem ->
                    if (dataItem.uri.path == "/maxercise/auth") {
                        val dataMap = DataMapItem.fromDataItem(dataItem).dataMap
                        val token = dataMap.getString("jwt_token")
                        val userId = dataMap.getInt("user_id", 1)
                        if (!token.isNullOrBlank()) {
                            val tokenManager = TokenManager(context)
                            tokenManager.saveToken(token)
                            tokenManager.saveUserId(userId)
                            foundToken = true
                        }
                    }
                }
                dataItems.release()
                foundToken
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }
    }
}
