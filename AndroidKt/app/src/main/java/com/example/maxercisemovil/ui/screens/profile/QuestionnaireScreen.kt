package com.example.maxercisemovil.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.maxercisemovil.ui.components.PrimaryGradientButton
import com.example.maxercisemovil.ui.theme.*

data class QuestionField(
    val id: String,
    val label: String,
    val why: String? = null,
    val type: String, // "single" or "multi"
    val options: List<QuestionOption>
)

data class QuestionOption(
    val value: String,
    val label: String,
    val description: String? = null
)

data class QuestionStep(
    val id: String,
    val title: String,
    val subtitle: String,
    val fields: List<QuestionField>
)

val questions = listOf(
    QuestionStep(
        id = "personal",
        title = "Cuéntanos sobre ti",
        subtitle = "Información personal para personalizar tu experiencia",
        fields = listOf(
            QuestionField(
                id = "gender",
                label = "¿Cuál es tu género?",
                type = "single",
                options = listOf(
                    QuestionOption("male", "Hombre"),
                    QuestionOption("female", "Mujer"),
                    QuestionOption("other", "Prefiero no decir")
                )
            ),
            QuestionField(
                id = "age",
                label = "¿Cuál es tu rango de edad?",
                type = "single",
                options = listOf(
                    QuestionOption("15-20", "15 - 20"),
                    QuestionOption("21-30", "21 - 30"),
                    QuestionOption("31-45", "31 - 45"),
                    QuestionOption("46-60", "46 - 60"),
                    QuestionOption("60+", "60+")
                )
            ),
            QuestionField(
                id = "goal",
                label = "¿Cuál es tu objetivo principal?",
                type = "single",
                options = listOf(
                    QuestionOption("lose_weight", "Perder peso"),
                    QuestionOption("gain_muscle", "Ganar músculo"),
                    QuestionOption("stay_fit", "Mantenerme en forma"),
                    QuestionOption("flexibility", "Mejorar flexibilidad"),
                    QuestionOption("health", "Mejorar salud general")
                )
            )
        )
    ),
    QuestionStep(
        id = "bodyType",
        title = "Tu tipo de cuerpo",
        subtitle = "Conocer tu somatotipo nos ayuda a recomendarte mejor",
        fields = listOf(
            QuestionField(
                id = "bodyType",
                label = "¿Con cuál somatotipo te identificas más?",
                type = "single",
                options = listOf(
                    QuestionOption("ectomorph", "Ectomorfo", "Delgado, dificultad para ganar masa"),
                    QuestionOption("mesomorph", "Mesomorfo", "Atlético, músculos bien definidos"),
                    QuestionOption("endomorph", "Endomorfo", "Mayor tendencia a acumular grasa"),
                    QuestionOption("mixed", "No sé / Mixto", "No me identifico con ninguno claramente")
                )
            )
        )
    ),
    QuestionStep(
        id = "fitnessLevel",
        title = "Tu nivel de condición física",
        subtitle = "Sé honesto para que podamos recomendarte correctamente",
        fields = listOf(
            QuestionField(
                id = "fitnessLevel",
                label = "¿Cómo describes tu condición física actual?",
                type = "single",
                options = listOf(
                    QuestionOption("beginner", "Principiante", "Nunca o casi nunca hago ejercicio"),
                    QuestionOption("intermediate", "Intermedio", "Ejercito regularmente pero sin estructura"),
                    QuestionOption("advanced", "Avanzado", "Entrenamiento constante y estructurado")
                )
            ),
            QuestionField(
                id = "daysPerWeek",
                label = "¿Cuántos días a la semana puedes entrenar?",
                type = "single",
                options = listOf(
                    QuestionOption("1-2", "1-2 días"),
                    QuestionOption("3-4", "3-4 días"),
                    QuestionOption("5-6", "5-6 días"),
                    QuestionOption("7", "Todos los días")
                )
            )
        )
    ),
    QuestionStep(
        id = "health",
        title = "Tu salud importa",
        subtitle = "Selecciona todas las condiciones o lesiones que apliquen",
        fields = listOf(
            QuestionField(
                id = "restrictions",
                label = "¿Tienes alguna condición física o lesión?",
                type = "multi",
                options = listOf(
                    QuestionOption("lesión_rodilla", "Lesión de rodilla"),
                    QuestionOption("lesión_espalda", "Lesión de espalda"),
                    QuestionOption("condición_cardiaca", "Condición cardiaca"),
                    QuestionOption("ninguna", "Sin restricciones")
                )
            )
        )
    ),
    QuestionStep(
        id = "equipment",
        title = "Tu equipo disponible",
        subtitle = "Marca todo el equipo al que tienes acceso",
        fields = listOf(
            QuestionField(
                id = "equipment",
                label = "¿Con qué equipo cuentas?",
                type = "multi",
                options = listOf(
                    QuestionOption("gym_full", "Gimnasio completo"),
                    QuestionOption("dumbbells", "Mancuernas"),
                    QuestionOption("none", "Sin equipo (peso corporal)")
                )
            )
        )
    )
)

@Composable
fun QuestionnaireScreen(
    onComplete: () -> Unit
) {
    var step by remember { mutableStateOf(0) }
    val currentStep = questions[step]
    
    // Using a map to hold the answers. For 'single', it's a string. For 'multi', it's a set of strings.
    var answers by remember { mutableStateOf(mapOf<String, Any>()) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp)
        ) {
            val progress = (step + 1).toFloat() / questions.size
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .padding(bottom = 8.dp),
                color = BluePrimary,
                trackColor = Gray100
            )
            Text("Paso ${step + 1} de ${questions.size}", color = Gray800, style = MaterialTheme.typography.bodyMedium)
        }

        // Content
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 24.dp)
        ) {
            item {
                Text(currentStep.title, style = MaterialTheme.typography.displayLarge, color = Gray900)
                Spacer(modifier = Modifier.height(8.dp))
                Text(currentStep.subtitle, style = MaterialTheme.typography.bodyLarge, color = Gray800)
                Spacer(modifier = Modifier.height(24.dp))
            }

            items(currentStep.fields) { field ->
                Text(field.label, style = MaterialTheme.typography.titleMedium, color = Gray900)
                if (field.type == "multi") {
                    Text("Puedes seleccionar varias opciones", style = MaterialTheme.typography.bodySmall, color = Gray800)
                }
                Spacer(modifier = Modifier.height(16.dp))

                field.options.forEach { option ->
                    val isSelected = if (field.type == "multi") {
                        val set = answers[field.id] as? Set<String> ?: emptySet()
                        set.contains(option.value)
                    } else {
                        answers[field.id] == option.value
                    }

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                            .clickable {
                                answers = answers.toMutableMap().apply {
                                    if (field.type == "multi") {
                                        val set = (this[field.id] as? Set<String> ?: emptySet()).toMutableSet()
                                        if (option.value == "ninguna" || option.value == "none") {
                                            set.clear()
                                            set.add(option.value)
                                        } else {
                                            set.remove("ninguna")
                                            set.remove("none")
                                            if (set.contains(option.value)) {
                                                set.remove(option.value)
                                            } else {
                                                set.add(option.value)
                                            }
                                        }
                                        this[field.id] = set
                                    } else {
                                        this[field.id] = option.value
                                    }
                                }
                            },
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) BluePale else Color.White
                        ),
                        elevation = CardDefaults.cardElevation(defaultElevation = if (isSelected) 4.dp else 1.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(option.label, style = MaterialTheme.typography.titleMedium, color = if (isSelected) BluePrimary else Gray900)
                                if (option.description != null) {
                                    Text(option.description, style = MaterialTheme.typography.bodyMedium, color = Gray800)
                                }
                            }
                            if (isSelected) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = BluePrimary)
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }
        }

        // Actions
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (step > 0) {
                TextButton(onClick = { step-- }) {
                    Text("← Anterior", color = BluePrimary)
                }
            } else {
                Spacer(modifier = Modifier.width(80.dp))
            }

            val canProceed = currentStep.fields.all { field ->
                val ans = answers[field.id]
                ans != null && (ans !is Set<*> || ans.isNotEmpty())
            }

            Button(
                onClick = {
                    if (step < questions.size - 1) {
                        step++
                    } else {
                        // TODO: Save to API
                        onComplete()
                    }
                },
                enabled = canProceed,
                colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
            ) {
                Text(if (step == questions.size - 1) "Completar y entrar" else "Siguiente →", color = Color.White)
            }
        }
    }
}
