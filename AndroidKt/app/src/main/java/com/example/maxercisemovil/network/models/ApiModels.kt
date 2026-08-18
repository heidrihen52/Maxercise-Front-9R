package com.example.maxercisemovil.network.models

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    val success: Boolean,
    val data: T
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val user: User
)

data class RegisterRequest(
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val email: String,
    @SerializedName("phone_number") val phoneNumber: String,
    @SerializedName("body_type") val bodyType: String,
    @SerializedName("birth_date") val birthDate: String, // format "YYYY-MM-DD" expected
    val password: String
)

data class PaginatedResponse<T>(
    val success: Boolean,
    val data: T,
    val total: Int?,
    val page: Int?,
    val limit: Int?
)

data class User(
    val id: Int,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val email: String,
    @SerializedName("phone_number") val phoneNumber: String? = null,
    val role: String? = null,
    @SerializedName("body_type") val bodyType: String? = null,
    @SerializedName("birth_date") val birthDate: String? = null,
    val status: Boolean = true
)

data class Exercise(
    val id: Int,
    val title: String,
    val description: String,
    val instructions: String,
    @SerializedName("author_id") val authorId: Int? = null,
    val status: Boolean = true,
    val media: List<Media>? = null
)



data class Routine(
    val id: Int,
    val title: String,
    val description: String? = null,
    val difficulty: String,
    @SerializedName("body_type") val bodyType: String,
    @SerializedName("author_id") val authorId: Int? = null,
    val status: Boolean = true,
    val exercises: List<RoutineExercise> = emptyList()
)

data class RoutineExercise(
    val id: Int,
    val reps: Int,
    val sets: Int,
    @SerializedName("day_number") val dayNumber: Int,
    val order: Int,
    val exercise: Exercise? = null
)

data class ErrorResponse(
    val error: String
)

data class Media(
    val id: Int,
    val type: String, // THUMBNAIL, CONTENT, YOUTUBE
    val url: String,
    @SerializedName("exercise_id") val exerciseId: Int? = null,
    @SerializedName("routine_id") val routineId: Int? = null
)

data class Muscle(
    val id: Int,
    val name: String,
    val description: String,
    @SerializedName("muscle_group_id") val muscleGroupId: Int? = null,
    val status: Boolean = true
)

data class MuscleGroup(
    val id: Int,
    val name: String,
    val description: String,
    val muscles: List<Muscle>? = null,
    val status: Boolean = true
)

data class Restriction(
    val id: Int,
    val name: String,
    val description: String,
    val status: Boolean = true
)

data class WorkoutLog(
    val id: Int,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("routine_id") val routineId: Int? = null,
    @SerializedName("day_number") val dayNumber: Int,
    @SerializedName("started_at") val startedAt: String,
    @SerializedName("completed_at") val completedAt: String,
    @SerializedName("duration_sec") val durationSec: Int? = null,
    val calories: Int? = null,
    @SerializedName("avg_heart_rate") val avgHeartRate: Int? = null,
    @SerializedName("max_heart_rate") val maxHeartRate: Int? = null
)
