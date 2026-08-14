package com.example.maxercisewearos.presentation.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Warning
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.wear.compose.material3.*
import coil.compose.AsyncImage
import com.example.maxercisewearos.presentation.theme.ComfortaaFont
import com.example.maxercisewearos.presentation.theme.QuicksandFont
import com.example.maxercisewearos.presentation.viewmodel.WorkoutViewModel
import com.example.maxercisewearos.presentation.component.HapticFeedbackHelper

@Composable
fun ExerciseScreen(
    viewModel: WorkoutViewModel,
    onStartRest: () -> Unit,
    onFinishWorkout: () -> Unit
) {
    val exercise by viewModel.currentExercise.collectAsStateWithLifecycle()
    val series by viewModel.currentSeries.collectAsStateWithLifecycle()
    val isSafe by viewModel.isSafe.collectAsStateWithLifecycle()
    val restrictedReason by viewModel.restrictedReason.collectAsStateWithLifecycle()
    val isWorkoutFinished by viewModel.isWorkoutFinished.collectAsStateWithLifecycle()
    val heartRate by viewModel.currentHeartRate.collectAsStateWithLifecycle()
    val progressState by viewModel.progress.collectAsStateWithLifecycle()

    val context = LocalContext.current
    val hapticHelper = remember { HapticFeedbackHelper(context) }

    val completedMsg = remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        viewModel.vibrationEvent.collect {
            hapticHelper.vibrateMedicalAlert()
        }
    }

    LaunchedEffect(Unit) {
        viewModel.exerciseCompletedEvent.collect { name ->
            completedMsg.value = name
            hapticHelper.vibrateExerciseCompleted()
        }
    }

    LaunchedEffect(completedMsg.value) {
        if (completedMsg.value != null) {
            kotlinx.coroutines.delay(1500)
            completedMsg.value = null
        }
    }

    ScreenScaffold {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                LinearProgressIndicator(
                    progress = { progressState.current.toFloat() / progressState.total.toFloat() },
                    modifier = Modifier.fillMaxWidth().padding(bottom = 2.dp)
                )
                Text(
                    text = "Ej. ${progressState.current} de ${progressState.total}",
                    fontSize = 10.sp,
                    fontFamily = QuicksandFont,
                    color = Color.Gray,
                    modifier = Modifier.padding(bottom = 4.dp)
                )

                Text(
                    text = exercise?.exercise?.name ?: "Ejercicio",
                    style = MaterialTheme.typography.titleMedium,
                    textAlign = TextAlign.Center,
                    fontSize = 14.sp
                )
                
                val imageUrl = exercise?.exercise?.thumbnail?.replace("localhost", "10.0.2.2")
                if (!imageUrl.isNullOrEmpty()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = "Ilustración",
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFF1E1E1E))
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Serie $series de ${exercise?.sets ?: 0} — ${exercise?.reps ?: 0} Reps",
                    style = MaterialTheme.typography.bodyMedium,
                    fontSize = 12.sp,
                    color = Color.White.copy(alpha = 0.8f)
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center,
                    modifier = Modifier.padding(top = 2.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Favorite,
                        contentDescription = "Ritmo Cardíaco",
                        tint = Color.Red,
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "$heartRate BPM",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontFamily = QuicksandFont,
                        fontSize = 11.sp
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = if (isSafe) Icons.Filled.CheckCircle else Icons.Filled.Warning,
                        contentDescription = null,
                        tint = if (isSafe) Color(0xFF4CAF50) else Color(0xFFE57373),
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (isSafe) "Seguro" else "No Seguro",
                        color = if (isSafe) Color(0xFF4CAF50) else Color(0xFFE57373),
                        fontWeight = FontWeight.Bold,
                        fontFamily = QuicksandFont,
                        fontSize = 11.sp
                    )
                }

                if (!isSafe) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "🚫 No Recomendado: Este ejercicio no es seguro para ti debido a tu condición de ${restrictedReason ?: "condición médica"}.",
                        style = MaterialTheme.typography.labelSmall,
                        textAlign = TextAlign.Center,
                        color = Color(0xFFE57373),
                        fontSize = 10.sp,
                        lineHeight = 12.sp
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center
                ) {
                    if (isWorkoutFinished) {
                        Button(
                            onClick = onFinishWorkout,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0071E3)),
                            modifier = Modifier.height(30.dp).fillMaxWidth(0.8f)
                        ) {
                            Text(
                                text = "Finalizar",
                                fontFamily = ComfortaaFont,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                color = Color.White
                            )
                        }
                    } else {
                        Button(
                            onClick = { viewModel.completeSeries() },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Check,
                                contentDescription = "Completar serie",
                                modifier = Modifier.size(22.dp),
                                tint = Color.White
                            )
                        }
                        
                        Spacer(modifier = Modifier.width(16.dp))
                        
                        Button(
                            onClick = onStartRest,
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Timer,
                                contentDescription = "Descanso",
                                modifier = Modifier.size(22.dp),
                                tint = Color.White
                            )
                        }
                    }
                }
            }

            if (completedMsg.value != null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.9f)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Filled.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF4CAF50),
                            modifier = Modifier.size(36.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "¡Completado!",
                            fontFamily = ComfortaaFont,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = completedMsg.value!!,
                            fontFamily = QuicksandFont,
                            fontSize = 12.sp,
                            color = Color.Gray,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                    }
                }
            }
        }
    }
}
