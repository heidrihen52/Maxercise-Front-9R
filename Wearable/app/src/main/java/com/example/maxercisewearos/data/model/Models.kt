package com.example.maxercisewearos.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Exercise(
    val id: Int,
    val name: String,
    val description: String? = null,
    val thumbnail: String? = null
)

@Serializable
data class Restriction(
    val id: Int,
    val name: String
)

@Serializable
data class ExerciseRestrictions(
    val id: Int,
    val exercise_id: Int,
    val restriction_id: Int
)

@Serializable
data class Routine(
    val id: Int,
    val name: String
)

@Serializable
data class RoutineExercise(
    val id: Int,
    val reps: Int,
    val sets: Int,
    val day_number: Int,
    val order: Int,
    val routine_id: Int,
    val exercise_id: Int,
    val exercise: Exercise? = null
)

@Serializable
data class UserActiveRoutine(
    val id: Int,
    val user_id: Int,
    val routine_id: Int,
    val last_completed_day: Int,
    val routine: Routine? = null
)

@Serializable
data class UserFavoriteRoutine(
    val id: Int,
    val user_id: Int,
    val routine_id: Int,
    val routine: Routine? = null
)

@Serializable
data class UserRestriction(
    val id: Int,
    val user_id: Int,
    val restriction_id: Int,
    val restriction: Restriction? = null
)

@Serializable
data class SyncResponse(
    val success: Boolean,
    val data: SyncData
)

@Serializable
data class SyncData(
    val syncedAt: String,
    val activeRoutine: ActiveRoutinePayload?,
    val favorites: List<FavoriteRoutinePayload>,
    val restrictions: List<RestrictionPayload>
)

@Serializable
data class ActiveRoutinePayload(
    val id: Int,
    val title: String,
    val difficulty: String,
    val bodyType: String,
    val startDate: String,
    val lastCompletedDay: Int,
    val days: List<DayPayload>
)

@Serializable
data class DayPayload(
    val dayNumber: Int,
    val exercises: List<ExercisePayload>
)

@Serializable
data class ExercisePayload(
    val order: Int,
    val reps: Int,
    val sets: Int,
    val exercise: ExerciseDetailPayload
)

@Serializable
data class ExerciseDetailPayload(
    val id: Int,
    val title: String,
    val thumbnail: String? = null
)

@Serializable
data class FavoriteRoutinePayload(
    val id: Int,
    val title: String,
    val difficulty: String,
    val bodyType: String
)

@Serializable
data class RestrictionPayload(
    val id: Int,
    val name: String
)

@Serializable
data class CompleteDayRequest(
    val dayNumber: Int,
    val startedAt: String,
    val durationSec: Int?,
    val avgHeartRate: Int?,
    val maxHeartRate: Int?,
    val calories: Int?
)

@Serializable
data class CompleteDayResponse(
    val success: Boolean
)

@Serializable
data class ExerciseDetailResponse(
    val success: Boolean,
    val data: ExerciseDetailData
)

@Serializable
data class ExerciseDetailData(
    val id: Int,
    val title: String,
    val exercise_restrictions: List<ExerciseRestrictionLink> = emptyList()
)

@Serializable
data class ExerciseRestrictionLink(
    val id: Int,
    val exercise_id: Int,
    val restriction_id: Int,
    val restriction: RestrictionDetail? = null
)

@Serializable
data class RestrictionDetail(
    val id: Int,
    val name: String
)

@Serializable
data class ActivateRoutineResponse(
    val success: Boolean
)

