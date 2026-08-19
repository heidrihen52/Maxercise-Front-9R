package com.example.maxercisewearos.presentation.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.wear.compose.foundation.lazy.TransformingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberTransformingLazyColumnState
import androidx.wear.compose.material3.*
import androidx.wear.compose.material3.lazy.rememberTransformationSpec
import androidx.wear.compose.material3.lazy.transformedHeight
import com.example.maxercisewearos.data.repository.LoadState
import com.example.maxercisewearos.presentation.component.BrandHeader
import com.example.maxercisewearos.presentation.theme.ComfortaaFont
import com.example.maxercisewearos.presentation.theme.QuicksandFont
import com.example.maxercisewearos.presentation.viewmodel.HomeViewModel

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onStartWorkout: () -> Unit,
    onNavigateToFavorites: () -> Unit,
    userId: Int = 1
) {
    val activeRoutine by viewModel.activeRoutine.collectAsStateWithLifecycle()
    val favorites by viewModel.favoriteRoutines.collectAsStateWithLifecycle()
    val availableDays by viewModel.availableDays.collectAsStateWithLifecycle()
    val activeSession by viewModel.activeSession.collectAsStateWithLifecycle()
    val loadState by viewModel.loadState.collectAsStateWithLifecycle()
    
    val listState = rememberTransformingLazyColumnState()
    val transformationSpec = rememberTransformationSpec()

    LaunchedEffect(Unit) {
        viewModel.sync(userId)
    }

    // ── Loading State ──
    if (loadState is LoadState.Loading) {
        ScreenScaffold {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(32.dp),
                        strokeWidth = 3.dp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Sincronizando...",
                        fontFamily = QuicksandFont,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color.White
                    )
                }
            }
        }
        return
    }

    // ── Error State ──
    if (loadState is LoadState.Error) {
        val errorMessage = (loadState as LoadState.Error).message
        ScreenScaffold {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(16.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Warning,
                        contentDescription = null,
                        tint = Color(0xFFFF6B6B),
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Error de conexión",
                        fontFamily = ComfortaaFont,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color.White,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = errorMessage,
                        fontFamily = QuicksandFont,
                        fontSize = 11.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        maxLines = 2
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = { viewModel.retry(userId) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF0071E3)
                        )
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Filled.Refresh,
                                contentDescription = "Reintentar",
                                modifier = Modifier.size(14.dp),
                                tint = Color.White
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Reintentar",
                                fontFamily = QuicksandFont,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }
        }
        return
    }

    // ── Success State — Main Content ──
    ScreenScaffold(scrollState = listState) { contentPadding ->
        TransformingLazyColumn(
            state = listState,
            contentPadding = contentPadding
        ) {
            item {
                ListHeader(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp)
                        .transformedHeight(this, transformationSpec),
                    transformation = SurfaceTransformation(transformationSpec)
                ) {
                    BrandHeader(modifier = Modifier.padding(bottom = 4.dp))
                }
            }

            if (activeSession != null) {
                item {
                    TitleCard(
                        onClick = {
                            viewModel.resumeWorkout(activeSession!!)
                            onStartWorkout()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .transformedHeight(this, transformationSpec),
                        title = {
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.PlayArrow,
                                    contentDescription = null,
                                    tint = Color(0xFF2A94FF),
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Reanudar Sesión",
                                    color = Color.White,
                                    fontFamily = ComfortaaFont,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }
                        },
                        subtitle = {
                            Text(
                                text = "Día ${activeSession?.dayNumber} - Ej. ${activeSession?.exerciseIndex?.plus(1)}",
                                color = Color(0xFF2A94FF),
                                fontFamily = QuicksandFont,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        },
                        colors = CardDefaults.cardColors(
                            containerColor = Color(0xFF1E1E1E),
                            titleColor = Color.White,
                            subtitleColor = Color(0xFF2A94FF)
                        )
                    )
                }
            }

            item {
                TitleCard(
                    onClick = {
                        val suggestedDay = (activeRoutine?.last_completed_day ?: 0) + 1
                        viewModel.selectDay(suggestedDay)
                        viewModel.startWorkout(activeRoutine?.routine_id ?: 0, suggestedDay)
                        onStartWorkout()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .transformedHeight(this, transformationSpec),
                    title = { 
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Start
                        ) {
                            Icon(
                                imageVector = Icons.Filled.FitnessCenter,
                                contentDescription = null,
                                tint = Color(0xFF2A94FF),
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Mi Rutina",
                                color = Color.White,
                                fontFamily = ComfortaaFont,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }
                    },
                    subtitle = { 
                        Text(
                            text = activeRoutine?.routine?.name ?: "Sin rutina activa",
                            color = Color(0xFF2A94FF),
                            fontFamily = QuicksandFont,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            maxLines = 2
                        )
                    },
                    time = {
                        Box(
                            modifier = Modifier
                                .background(Color(0xFF0071E3), shape = RoundedCornerShape(8.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "ACTIVA",
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = QuicksandFont
                            )
                        }
                    },
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF1C1C1E),
                        titleColor = Color.White,
                        subtitleColor = Color(0xFF2A94FF)
                    )
                )
            }

            if (availableDays.isNotEmpty()) {
                item {
                    ListHeader(
                        modifier = Modifier
                            .fillMaxWidth()
                            .transformedHeight(this, transformationSpec),
                        transformation = SurfaceTransformation(transformationSpec)
                    ) {
                        Text(
                            text = "Entrenar Día",
                            fontFamily = ComfortaaFont,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = Color.White,
                            modifier = Modifier.padding(top = 6.dp)
                        )
                    }
                }

                items(availableDays.size) { index ->
                    val dayNum = availableDays[index]
                    val isSuggested = dayNum == (activeRoutine?.last_completed_day ?: 0) + 1
                    Button(
                        onClick = {
                            viewModel.selectDay(dayNum)
                            viewModel.startWorkout(activeRoutine?.routine_id ?: 0, dayNum)
                            onStartWorkout()
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .transformedHeight(this, transformationSpec),
                        transformation = SurfaceTransformation(transformationSpec),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSuggested) Color(0xFF0071E3) else MaterialTheme.colorScheme.surfaceContainer,
                            contentColor = Color.White
                        )
                    ) {
                        Text(
                            text = if (isSuggested) "Día $dayNum (Sugerido)" else "Día $dayNum",
                            fontFamily = QuicksandFont,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }

            item {
                Button(
                    onClick = onNavigateToFavorites,
                    modifier = Modifier
                        .fillMaxWidth()
                        .transformedHeight(this, transformationSpec),
                    transformation = SurfaceTransformation(transformationSpec),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.surfaceContainer,
                        contentColor = MaterialTheme.colorScheme.onSurface
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Favorite,
                            contentDescription = null,
                            tint = Color(0xFF0071E3),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Mis Favoritos",
                            fontFamily = ComfortaaFont,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}
