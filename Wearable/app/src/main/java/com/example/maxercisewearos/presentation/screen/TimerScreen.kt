package com.example.maxercisewearos.presentation.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.wear.compose.material3.*
import androidx.compose.runtime.remember
import com.example.maxercisewearos.presentation.theme.QuicksandFont
import com.example.maxercisewearos.presentation.viewmodel.TimerViewModel
import com.example.maxercisewearos.presentation.component.HapticFeedbackHelper

@Composable
fun TimerScreen(
    viewModel: TimerViewModel,
    onFinish: () -> Unit
) {
    val timeLeft by viewModel.timeLeft.collectAsStateWithLifecycle()
    val isRunning by viewModel.isRunning.collectAsStateWithLifecycle()
    
    val context = LocalContext.current
    val hapticHelper = remember { HapticFeedbackHelper(context) }

    LaunchedEffect(Unit) {
        hapticHelper.vibrateStartRest()
        viewModel.timerFinishedEvent.collect {
            hapticHelper.vibrateEndRest()
        }
    }

    ScreenScaffold {
        Column(
            modifier = Modifier.fillMaxSize().padding(horizontal = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = formatTime(timeLeft),
                style = MaterialTheme.typography.displayMedium,
                fontFamily = QuicksandFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = { viewModel.adjustTime(-15) },
                    modifier = Modifier.height(28.dp).width(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Text(
                        text = "-15s",
                        fontFamily = QuicksandFont,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2A94FF)
                    )
                }
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Button(
                    onClick = { viewModel.adjustTime(15) },
                    modifier = Modifier.height(28.dp).width(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
                ) {
                    Text(
                        text = "+15s",
                        fontFamily = QuicksandFont,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2A94FF)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (isRunning) {
                    Button(
                        onClick = { viewModel.pauseTimer() },
                        modifier = Modifier.size(42.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Pause,
                            contentDescription = "Pausar",
                            modifier = Modifier.size(24.dp),
                            tint = Color.White
                        )
                    }
                } else {
                    Button(
                        onClick = { viewModel.resumeTimer() },
                        modifier = Modifier.size(42.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.PlayArrow,
                            contentDescription = "Reanudar",
                            modifier = Modifier.size(24.dp),
                            tint = Color.White
                        )
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Button(
                    onClick = { 
                        viewModel.stopTimer()
                        onFinish()
                    },
                    modifier = Modifier.size(42.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Stop,
                        contentDescription = "Detener",
                        modifier = Modifier.size(24.dp),
                        tint = Color.White
                    )
                }
            }
        }
    }
}

private fun formatTime(seconds: Long): String {
    val m = seconds / 60
    val s = seconds % 60
    return "%02d:%02d".format(m, s)
}
