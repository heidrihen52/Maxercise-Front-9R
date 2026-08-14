package com.example.maxercisemovil.data

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class AuthManager(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "auth_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) {
        sharedPreferences.edit().putString("jwt_token", token).apply()
    }

    fun getToken(): String? {
        return sharedPreferences.getString("jwt_token", null)
    }

    fun saveUserId(userId: Int) {
        sharedPreferences.edit().putInt("user_id", userId).apply()
    }

    fun getUserId(): Int {
        return sharedPreferences.getInt("user_id", 1)
    }

    fun saveRole(role: String) {
        sharedPreferences.edit().putString("user_role", role).apply()
    }

    fun getRole(): String? {
        return sharedPreferences.getString("user_role", null)
    }

    fun clearAuth() {
        sharedPreferences.edit()
            .remove("jwt_token")
            .remove("user_id")
            .remove("user_role")
            .apply()
    }

    fun isLoggedIn(): Boolean {
        return getToken() != null
    }
}
