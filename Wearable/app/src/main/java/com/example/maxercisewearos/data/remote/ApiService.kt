package com.example.maxercisewearos.data.remote

import com.example.maxercisewearos.data.model.*
import retrofit2.http.*

interface ApiService {
    @GET("api/wearable/sync")
    suspend fun syncWearable(): SyncResponse

    @POST("api/wearable/complete-day")
    suspend fun completeDay(
        @Body body: CompleteDayRequest
    ): CompleteDayResponse

    @GET("api/exercises/{id}")
    suspend fun getExerciseById(
        @Path("id") id: Int
    ): ExerciseDetailResponse

    @POST("api/routines/{id}/activate")
    suspend fun activateRoutine(
        @Path("id") routineId: Int
    ): ActivateRoutineResponse
}
