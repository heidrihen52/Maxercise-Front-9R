package com.example.maxercisewearos.data.repository

import android.content.Context
import com.example.maxercisewearos.data.model.*
import com.example.maxercisewearos.data.remote.ApiService
import com.example.maxercisewearos.data.sync.TokenManager
import com.example.maxercisewearos.data.sync.WearableDataLayerService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

data class WorkoutSummary(
    val dayNumber: Int,
    val durationMinutes: Int,
    val caloriesBurned: Int,
    val avgHeartRate: Int,
    val maxHeartRate: Int,
    val exercisesCount: Int,
    val setsCount: Int
)

/** Sealed class for UI loading states */
sealed class LoadState {
    object Idle : LoadState()
    object Loading : LoadState()
    data class Success(val message: String = "") : LoadState()
    data class Error(val message: String) : LoadState()
}

class WorkoutRepository(private val apiService: ApiService, context: Context) {

    private val persistence = WorkoutSessionPersistence(context)
    private val heartRateMonitor = HeartRateMonitor(context)
    private val appContext = context.applicationContext

    // ── Loading state ──
    private val _loadState = MutableStateFlow<LoadState>(LoadState.Idle)
    val loadState: StateFlow<LoadState> = _loadState

    private val _activeRoutine = MutableStateFlow<UserActiveRoutine?>(null)
    val activeRoutine: StateFlow<UserActiveRoutine?> = _activeRoutine

    private val _routineExercises = MutableStateFlow<List<RoutineExercise>>(emptyList())
    val routineExercises: StateFlow<List<RoutineExercise>> = _routineExercises

    private val _favoriteRoutines = MutableStateFlow<List<UserFavoriteRoutine>>(emptyList())
    val favoriteRoutines: StateFlow<List<UserFavoriteRoutine>> = _favoriteRoutines

    private val _userRestrictions = MutableStateFlow<List<UserRestriction>>(emptyList())
    val userRestrictions: StateFlow<List<UserRestriction>> = _userRestrictions

    private val _availableDays = MutableStateFlow<List<Int>>(emptyList())
    val availableDays: StateFlow<List<Int>> = _availableDays

    private val _activeSession = MutableStateFlow<SavedSession?>(null)
    val activeSession: StateFlow<SavedSession?> = _activeSession

    val currentHeartRate = heartRateMonitor.currentHeartRate

    private var _allDays: List<DayPayload> = emptyList()
    private var _activeRoutineId: Int = 0

    private var startedAtTimestamp: String = ""
    private var startedAtMillis: Long = 0L

    // In-memory progress
    private val _currentExerciseIndex = MutableStateFlow(0)
    val currentExerciseIndex: StateFlow<Int> = _currentExerciseIndex

    private val _currentSeries = MutableStateFlow(1)
    val currentSeries: StateFlow<Int> = _currentSeries

    init {
        // Load active session from SharedPreferences on start
        _activeSession.value = persistence.getSession()
    }

    suspend fun syncData(userId: Int) {
        _loadState.value = LoadState.Loading
        try {
            val response = apiService.syncWearable()
            if (response.success) {
                val syncData = response.data
                val activePayload = syncData.activeRoutine
                
                if (activePayload != null) {
                    _activeRoutineId = activePayload.id
                    _allDays = activePayload.days
                    _availableDays.value = activePayload.days.map { it.dayNumber }

                    _activeRoutine.value = UserActiveRoutine(
                        id = activePayload.id,
                        user_id = userId,
                        routine_id = activePayload.id,
                        last_completed_day = activePayload.lastCompletedDay,
                        routine = Routine(id = activePayload.id, name = activePayload.title)
                    )
                    
                    val currentDay = activePayload.lastCompletedDay + 1
                    val dayPayload = activePayload.days.find { it.dayNumber == currentDay } ?: activePayload.days.firstOrNull()
                    val mappedExercises = dayPayload?.exercises?.map { ex ->
                        RoutineExercise(
                            id = ex.order,
                            reps = ex.reps,
                            sets = ex.sets,
                            day_number = dayPayload.dayNumber,
                            order = ex.order,
                            routine_id = activePayload.id,
                            exercise_id = ex.exercise.id,
                            exercise = Exercise(
                                id = ex.exercise.id,
                                name = ex.exercise.title,
                                thumbnail = ex.exercise.thumbnail
                            )
                        )
                    } ?: emptyList()
                    _routineExercises.value = mappedExercises.sortedBy { it.order }
                } else {
                    _allDays = emptyList()
                    _activeRoutineId = 0
                    _availableDays.value = emptyList()
                    _activeRoutine.value = null
                    _routineExercises.value = emptyList()
                }

                _favoriteRoutines.value = syncData.favorites.map { fav ->
                    UserFavoriteRoutine(
                        id = fav.id,
                        user_id = userId,
                        routine_id = fav.id,
                        routine = Routine(id = fav.id, name = fav.title)
                    )
                }

                _userRestrictions.value = syncData.restrictions.map { rest ->
                    UserRestriction(
                        id = rest.id,
                        user_id = userId,
                        restriction_id = rest.id,
                        restriction = Restriction(id = rest.id, name = rest.name)
                    )
                }
                
                // Reset local series progress on new sync
                _currentExerciseIndex.value = 0
                _currentSeries.value = 1
                _loadState.value = LoadState.Success()
            } else {
                _loadState.value = LoadState.Error("Error de sincronización")
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _loadState.value = LoadState.Error(
                e.message ?: "No se pudo conectar al servidor"
            )
        }
    }

    fun selectDay(dayNumber: Int) {
        val dayPayload = _allDays.find { it.dayNumber == dayNumber } ?: return
        val mappedExercises = dayPayload.exercises.map { ex ->
            RoutineExercise(
                id = ex.order,
                reps = ex.reps,
                sets = ex.sets,
                day_number = dayPayload.dayNumber,
                order = ex.order,
                routine_id = _activeRoutineId,
                exercise_id = ex.exercise.id,
                exercise = Exercise(
                    id = ex.exercise.id,
                    name = ex.exercise.title,
                    thumbnail = ex.exercise.thumbnail
                )
            )
        }
        _routineExercises.value = mappedExercises.sortedBy { it.order }
        _currentExerciseIndex.value = 0
        _currentSeries.value = 1
    }

    fun startWorkoutSession(routineId: Int, dayNumber: Int) {
        startedAtMillis = System.currentTimeMillis()
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply {
            timeZone = java.util.TimeZone.getTimeZone("UTC")
        }
        startedAtTimestamp = sdf.format(java.util.Date(startedAtMillis))
        
        heartRateMonitor.startMonitoring()
        
        persistence.saveSession(
            routineId = routineId,
            dayNumber = dayNumber,
            exerciseIndex = _currentExerciseIndex.value,
            series = _currentSeries.value,
            startedAt = startedAtTimestamp
        )
        _activeSession.value = persistence.getSession()
    }

    fun resumeWorkoutSession(session: SavedSession) {
        startedAtTimestamp = session.startedAt
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply {
            timeZone = java.util.TimeZone.getTimeZone("UTC")
        }
        startedAtMillis = try {
            sdf.parse(session.startedAt)?.time ?: System.currentTimeMillis()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }

        _currentExerciseIndex.value = session.exerciseIndex
        _currentSeries.value = session.series
        
        selectDay(session.dayNumber)
        
        heartRateMonitor.startMonitoring()
    }

    fun clearActiveSession() {
        persistence.clearSession()
        _activeSession.value = null
        heartRateMonitor.stopMonitoring()
    }

    fun nextSeries() {
        val currentEx = _routineExercises.value.getOrNull(_currentExerciseIndex.value) ?: return
        if (_currentSeries.value < currentEx.sets) {
            _currentSeries.value += 1
        } else {
            if (_currentExerciseIndex.value < _routineExercises.value.size - 1) {
                _currentExerciseIndex.value += 1
                _currentSeries.value = 1
            }
        }

        // Save updated session state locally
        _activeRoutine.value?.let { active ->
            persistence.saveSession(
                routineId = active.routine_id,
                dayNumber = currentEx.day_number,
                exerciseIndex = _currentExerciseIndex.value,
                series = _currentSeries.value,
                startedAt = startedAtTimestamp
            )
            _activeSession.value = persistence.getSession()
        }
    }

    fun getWorkoutSummary(): WorkoutSummary {
        val active = _activeRoutine.value
        val durationSec = ((System.currentTimeMillis() - startedAtMillis) / 1000).toInt().coerceAtLeast(0)
        val durationMin = durationSec / 60
        val calories = (durationMin * 8.5).toInt().coerceAtLeast(10)
        val avgHR = heartRateMonitor.getAverage()
        val maxHR = heartRateMonitor.getMax()
        val exercisesCount = _routineExercises.value.size
        val setsCount = _routineExercises.value.sumOf { it.sets }

        return WorkoutSummary(
            dayNumber = _routineExercises.value.firstOrNull()?.day_number ?: (active?.last_completed_day ?: 0 + 1),
            durationMinutes = durationMin,
            caloriesBurned = calories,
            avgHeartRate = avgHR,
            maxHeartRate = maxHR,
            exercisesCount = exercisesCount,
            setsCount = setsCount
        )
    }

    suspend fun finishBlock(userId: Int) {
        val active = _activeRoutine.value ?: return
        val activeDay = _routineExercises.value.firstOrNull()?.day_number ?: (active.last_completed_day + 1)
        val durationSec = ((System.currentTimeMillis() - startedAtMillis) / 1000).toInt().coerceAtLeast(0)
        val calories = ((durationSec / 60) * 8.5).toInt().coerceAtLeast(10)
        val avgHR = heartRateMonitor.getAverage()
        val maxHR = heartRateMonitor.getMax()

        try {
            apiService.completeDay(
                CompleteDayRequest(
                    dayNumber = activeDay,
                    startedAt = startedAtTimestamp,
                    durationSec = durationSec,
                    avgHeartRate = avgHR,
                    maxHeartRate = maxHR,
                    calories = calories
                )
            )
            clearActiveSession()

            // Notify the companion phone app that the workout was completed
            WearableDataLayerService.sendMessageToPhone(
                appContext,
                "/maxercise/workout-completed",
                "day=$activeDay,duration=${durationSec / 60}min,cal=$calories".toByteArray()
            )
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun getMatchingRestriction(exerciseId: Int): String? {
        val exerciseDetail = try {
            apiService.getExerciseById(exerciseId)
        } catch (e: Exception) {
            null
        }
        val userRestrictions = _userRestrictions.value
        val exerciseRestrictions = exerciseDetail?.data?.exercise_restrictions ?: emptyList()
        
        for (userRest in userRestrictions) {
            val matched = exerciseRestrictions.any { it.restriction_id == userRest.restriction_id }
            if (matched) {
                return userRest.restriction?.name ?: "Condición Médica"
            }
        }
        return null
    }

    suspend fun isExerciseSafe(exerciseId: Int): Boolean {
        return getMatchingRestriction(exerciseId) == null
    }

    suspend fun activateAndSyncRoutine(userId: Int, routineId: Int): Boolean {
        return try {
            val response = apiService.activateRoutine(routineId)
            if (response.success) {
                syncData(userId)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    companion object {
        fun create(baseUrl: String, context: Context): WorkoutRepository {
            val tokenManager = TokenManager(context)

            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .addInterceptor { chain ->
                    // Read JWT from TokenManager (received via Data Layer from phone)
                    val token = tokenManager.getToken() ?: ""
                    val request = chain.request().newBuilder()
                        .addHeader("Authorization", "Bearer $token")
                        .build()
                    chain.proceed(request)
                }
                .build()

            val json = Json { ignoreUnknownKeys = true }
            val retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
                .build()

            return WorkoutRepository(retrofit.create(ApiService::class.java), context)
        }
    }
}
