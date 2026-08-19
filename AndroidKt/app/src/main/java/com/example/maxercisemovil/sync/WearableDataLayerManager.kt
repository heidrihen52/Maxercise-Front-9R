package com.example.maxercisemovil.sync

import android.content.Context
import android.util.Log
import com.google.android.gms.wearable.*
import kotlinx.coroutines.tasks.await

/**
 * Manages Wearable Data Layer communication from the Phone → Watch.
 *
 * Outbound (phone → watch):
 * - /maxercise/auth     → DataItem: sends JWT token + userId to the watch
 * - /maxercise/sync     → Message: tells the watch to refresh its data
 * - /maxercise/logout   → Message: tells the watch to clear its auth state
 *
 * Inbound (watch → phone):
 * - /maxercise/workout-completed → handled by WearableListenerService on phone
 */
class WearableDataLayerManager(private val context: Context) {

    companion object {
        private const val TAG = "WearableDataLayer"
        private const val AUTH_PATH = "/maxercise/auth"
        private const val SYNC_PATH = "/maxercise/sync"
        private const val LOGOUT_PATH = "/maxercise/logout"
        const val REQUEST_AUTH_PATH = "/maxercise/request-auth"
    }

    /**
     * Sends the JWT token and userId to the connected watch.
     * Uses DataClient (persistent) so the watch receives it even if not currently connected.
     * Should be called after successful login.
     */
    suspend fun sendAuthToWatch(token: String, userId: Int) {
        try {
            val dataClient = Wearable.getDataClient(context)
            val putDataReq = PutDataMapRequest.create(AUTH_PATH).apply {
                dataMap.putString("jwt_token", token)
                dataMap.putInt("user_id", userId)
                dataMap.putLong("timestamp", System.currentTimeMillis()) // Force update
            }.asPutDataRequest().setUrgent()

            dataClient.putDataItem(putDataReq).await()
            Log.d(TAG, "Auth token sent to watch (userId=$userId)")

            // Also send a message to trigger immediate sync
            sendSyncCommand()
        } catch (e: Exception) {
            Log.w(TAG, "Failed to send auth to watch (watch may not be connected)", e)
        }
    }

    /**
     * Sends a sync command to the watch via MessageClient.
     * This is fire-and-forget — the watch will sync when it receives the message.
     */
    suspend fun sendSyncCommand() {
        sendMessageToWatch(SYNC_PATH)
    }

    /**
     * Sends a logout command to the watch.
     * Also clears the persistent auth DataItem.
     */
    suspend fun sendLogoutToWatch() {
        try {
            // Clear the persistent DataItem
            val dataClient = Wearable.getDataClient(context)
            val putDataReq = PutDataMapRequest.create(AUTH_PATH).apply {
                dataMap.putString("jwt_token", "")
                dataMap.putInt("user_id", 0)
                dataMap.putLong("timestamp", System.currentTimeMillis())
            }.asPutDataRequest().setUrgent()
            dataClient.putDataItem(putDataReq).await()

            // Send logout message
            sendMessageToWatch(LOGOUT_PATH)
            Log.d(TAG, "Logout sent to watch")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to send logout to watch", e)
        }
    }

    /**
     * Sends a fire-and-forget message to all connected watch nodes.
     */
    private suspend fun sendMessageToWatch(path: String, data: ByteArray = ByteArray(0)) {
        try {
            val nodeClient = Wearable.getNodeClient(context)
            val nodes = nodeClient.connectedNodes.await()
            val messageClient = Wearable.getMessageClient(context)

            nodes.forEach { node ->
                try {
                    messageClient.sendMessage(node.id, path, data).await()
                    Log.d(TAG, "Message sent to ${node.displayName}: $path")
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to send message to ${node.displayName}", e)
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to get connected nodes", e)
        }
    }
}
