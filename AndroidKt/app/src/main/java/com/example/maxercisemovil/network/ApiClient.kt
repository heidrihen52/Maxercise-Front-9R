package com.example.maxercisemovil.network

import com.example.maxercisemovil.data.AuthManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // Note: 10.0.2.2 is the special IP for Android Emulator to connect to localhost
    private const val BASE_URL = "http://10.0.2.2:3000/api/"

    private var retrofit: Retrofit? = null

    fun getService(authManager: AuthManager): ApiService {
        if (retrofit == null) {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val authInterceptor = Interceptor { chain ->
                val requestBuilder = chain.request().newBuilder()
                val token = authManager.getToken()
                
                if (token != null) {
                    requestBuilder.addHeader("Authorization", "Bearer $token")
                }
                
                chain.proceed(requestBuilder.build())
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .addInterceptor(authInterceptor)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build()

            retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        
        return retrofit!!.create(ApiService::class.java)
    }
}
