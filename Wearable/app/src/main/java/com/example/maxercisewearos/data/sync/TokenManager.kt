package com.example.maxercisewearos.data.sync

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Manages the JWT token on the Wearable.
 * The token is received from the companion phone app via the Wearable Data Layer
 * and persisted in SharedPreferences so the watch can make authenticated API calls.
 */
class TokenManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("maxercise_auth", Context.MODE_PRIVATE)

    private val _authState = MutableStateFlow(isAuthenticated())
    val authState: StateFlow<Boolean> = _authState.asStateFlow()

    private val listener = SharedPreferences.OnSharedPreferenceChangeListener { _, key ->
        if (key == KEY_JWT) {
            _authState.value = isAuthenticated()
        }
    }

    init {
        prefs.registerOnSharedPreferenceChangeListener(listener)
    }

    companion object {
        private const val KEY_JWT = "jwt_token"
        private const val KEY_USER_ID = "user_id"
    }

    fun saveToken(token: String) {
        prefs.edit().putString(KEY_JWT, token).apply()
    }

    fun getToken(): String? = prefs.getString(KEY_JWT, null)

    fun saveUserId(userId: Int) {
        prefs.edit().putInt(KEY_USER_ID, userId).apply()
    }

    fun getUserId(): Int = prefs.getInt(KEY_USER_ID, 1)

    fun isAuthenticated(): Boolean = !getToken().isNullOrBlank()

    fun clear() {
        prefs.edit().clear().apply()
    }
}
