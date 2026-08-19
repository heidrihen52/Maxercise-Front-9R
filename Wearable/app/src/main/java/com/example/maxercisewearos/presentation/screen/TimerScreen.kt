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

import com.example.maxercisewearos.presentation.theme.ComfortaaFont

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
            onFinish()
        }
    }

    ScreenScaffold {
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Descanso",
                    fontFamily = QuicksandFont,
                    color = Color.Gray,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(bottom = 2.dp)
                )
                
                Text(
                    text = formatTime(timeLeft),
                    style = MaterialTheme.typography.displayMedium,
                    fontFamily = QuicksandFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(8.dp))

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
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
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
            }

            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.BottomCenter) {
                EdgeButton(
                    onClick = { 
                        viewModel.stopTimer()
                        onFinish()
                    },
                    buttonSize = EdgeButtonSize.Medium,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF1E293B),
                        contentColor = Color.White
                    )
                ) {
                    Text(
                        text = "Saltar",
                        fontFamily = ComfortaaFont,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
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
