package com.example.maxercisemovil.network

import com.example.maxercisemovil.network.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<LoginResponse>>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<LoginResponse>>

    @GET("users/me")
    suspend fun getMe(): Response<ApiResponse<User>>

    @GET("exercises")
    suspend fun getExercises(
        @Query("bodyPart") bodyPart: String? = null,
        @Query("equipment") equipment: String? = null,
        @Query("target") target: String? = null
    ): Response<ApiResponse<List<Exercise>>>

    @GET("routines")
    suspend fun getRoutines(): Response<ApiResponse<List<Routine>>>

    @POST("exercises/{id}/favorite")
    suspend fun toggleExerciseFavorite(
        @Path("id") exerciseId: Int
    ): Response<ApiResponse<Any>>

    @POST("routines/{id}/favorite")
    suspend fun toggleRoutineFavorite(
        @Path("id") routineId: Int
    ): Response<ApiResponse<Any>>

    @GET("users")
    suspend fun getUsers(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50
    ): Response<PaginatedResponse<List<User>>>
}
