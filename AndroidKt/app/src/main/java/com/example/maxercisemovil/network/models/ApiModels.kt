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
    val id: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val email: String,
    val role: String? = null,
    val status: Boolean = true
)

data class Exercise(
    val id: Int,
    val title: String,
    val description: String,
    val instructions: String,
    @SerializedName("author_id") val authorId: Int? = null,
    val status: Boolean = true
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

