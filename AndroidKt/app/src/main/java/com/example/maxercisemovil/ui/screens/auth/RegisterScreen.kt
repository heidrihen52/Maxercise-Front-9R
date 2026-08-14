package com.example.maxercisemovil.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.maxercisemovil.ui.theme.BluePrimary
import com.example.maxercisemovil.ui.theme.OffWhite

import com.example.maxercisemovil.ui.components.GlassCard
import com.example.maxercisemovil.ui.components.MaxerciseTextField
import com.example.maxercisemovil.ui.components.PrimaryGradientButton

@Composable
fun RegisterScreen(
    viewModel: RegisterViewModel,
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // Form State
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var birthDate by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var bodyType by remember { mutableStateOf("") }
    
    var currentStep by remember { mutableIntStateOf(0) }

    LaunchedEffect(uiState) {
        if (uiState is RegisterState.Success) {
            onRegisterSuccess()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center
    ) {
        GlassCard(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            isDark = false
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header
                Text(
                    text = if (currentStep == 0) "Crear Cuenta" else "Tu Tipo de Cuerpo",
                    style = MaterialTheme.typography.displayLarge,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = if (currentStep == 0) "Paso 1 de 2: Información Básica" else "Paso 2 de 2: Conocer tu somatotipo nos ayuda a recomendarte mejor",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
                Spacer(modifier = Modifier.height(24.dp))

                if (currentStep == 0) {
                    BasicInfoStep(
                        firstName = firstName, onFirstNameChange = { firstName = it },
                        lastName = lastName, onLastNameChange = { lastName = it },
                        phone = phone, onPhoneChange = { phone = it },
                        birthDate = birthDate, onBirthDateChange = { birthDate = it },
                        email = email, onEmailChange = { email = it },
                        password = password, onPasswordChange = { password = it },
                        onNext = { currentStep = 1 },
                        onNavigateToLogin = onNavigateToLogin
                    )
                } else {
                    BodyTypeStep(
                        selectedBodyType = bodyType,
                        onBodyTypeSelected = { bodyType = it },
                        onBack = { currentStep = 0 },
                        onSubmit = { viewModel.register(firstName, lastName, email, phone, bodyType, birthDate, password) },
                        isLoading = uiState is RegisterState.Loading,
                        error = if (uiState is RegisterState.Error) (uiState as RegisterState.Error).message else null
                    )
                }
            }
        }
    }
}

@Composable
fun BasicInfoStep(
    firstName: String, onFirstNameChange: (String) -> Unit,
    lastName: String, onLastNameChange: (String) -> Unit,
    phone: String, onPhoneChange: (String) -> Unit,
    birthDate: String, onBirthDateChange: (String) -> Unit,
    email: String, onEmailChange: (String) -> Unit,
    password: String, onPasswordChange: (String) -> Unit,
    onNext: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    val scrollState = rememberScrollState()
    val canProceed = firstName.isNotBlank() && lastName.isNotBlank() && email.isNotBlank() && password.isNotBlank()

    Column(modifier = Modifier.verticalScroll(scrollState)) {
        MaxerciseTextField(
            value = firstName, onValueChange = onFirstNameChange, label = "Nombre",
            leadingIcon = { Icon(androidx.compose.material.icons.Icons.Default.Person, contentDescription = "Nombre") }
        )
        Spacer(modifier = Modifier.height(8.dp))
        MaxerciseTextField(
            value = lastName, onValueChange = onLastNameChange, label = "Apellido",
            leadingIcon = { Icon(androidx.compose.material.icons.Icons.Default.Person, contentDescription = "Apellido") }
        )
        Spacer(modifier = Modifier.height(8.dp))
        MaxerciseTextField(
            value = email, onValueChange = onEmailChange, label = "Correo Electrónico",
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            leadingIcon = { Icon(androidx.compose.material.icons.Icons.Default.Email, contentDescription = "Email") }
        )
        Spacer(modifier = Modifier.height(8.dp))
        MaxerciseTextField(
            value = phone, onValueChange = onPhoneChange, label = "Teléfono",
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
            leadingIcon = { Icon(androidx.compose.material.icons.Icons.Default.Phone, contentDescription = "Teléfono") }
        )
        Spacer(modifier = Modifier.height(8.dp))
        MaxerciseTextField(
            value = birthDate, onValueChange = onBirthDateChange, label = "Fecha de Nacimiento (YYYY-MM-DD)",
            leadingIcon = { Icon(androidx.compose.material.icons.Icons.Default.DateRange, contentDescription = "Fecha de Nacimiento") }
        )
        Spacer(modifier = Modifier.height(8.dp))
        MaxerciseTextField(
            value = password, onValueChange = onPasswordChange, label = "Contraseña",
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            leadingIcon = { Icon(androidx.compose.material.icons.Icons.Default.Lock, contentDescription = "Password") }
        )
        
        Spacer(modifier = Modifier.height(24.dp))

        PrimaryGradientButton(
            text = "Siguiente",
            onClick = onNext,
            modifier = Modifier.fillMaxWidth(),
            enabled = canProceed
        )
        Spacer(modifier = Modifier.height(16.dp))
        TextButton(onClick = onNavigateToLogin, modifier = Modifier.fillMaxWidth()) {
            Text("¿Ya tienes cuenta? Inicia Sesión", color = BluePrimary)
        }
    }
}

@Composable
fun BodyTypeStep(
    selectedBodyType: String,
    onBodyTypeSelected: (String) -> Unit,
    onBack: () -> Unit,
    onSubmit: () -> Unit,
    isLoading: Boolean,
    error: String?
) {
    val bodyTypes = listOf(
        Pair("ECTOMORFO", "Contextura delgada, dificultad para ganar peso"),
        Pair("MESOMORFO", "Contextura atlética, facilidad para ganar músculo"),
        Pair("ENDOMORFO", "Contextura robusta, facilidad para ganar peso")
    )
    
    Column {
        LazyVerticalGrid(
            columns = GridCells.Fixed(1),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.heightIn(max = 300.dp)
        ) {
            items(bodyTypes) { type ->
                val isSelected = selectedBodyType == type.first
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSelected) BluePrimary.copy(alpha = 0.1f) else Color.Transparent)
                        .border(
                            width = if (isSelected) 2.dp else 1.dp,
                            color = if (isSelected) BluePrimary else MaterialTheme.colorScheme.outlineVariant,
                            shape = RoundedCornerShape(12.dp)
                        )
                        .clickable { onBodyTypeSelected(type.first) }
                        .padding(16.dp)
                ) {
                    Column {
                        Text(type.first, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                        Text(type.second, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    if (isSelected) {
                        Icon(
                            Icons.Default.CheckCircle, 
                            contentDescription = "Selected",
                            tint = BluePrimary,
                            modifier = Modifier.align(Alignment.CenterEnd)
                        )
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        if (error != null) {
            Text(error, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            Spacer(modifier = Modifier.height(8.dp))
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedButton(
                onClick = onBack,
                modifier = Modifier.weight(1f).height(50.dp),
                shape = RoundedCornerShape(25.dp)
            ) {
                Text("Atrás")
            }
            
            if (isLoading) {
                Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = BluePrimary, modifier = Modifier.size(24.dp))
                }
            } else {
                PrimaryGradientButton(
                    text = "Finalizar",
                    onClick = onSubmit,
                    modifier = Modifier.weight(1f),
                    enabled = selectedBodyType.isNotBlank()
                )
            }
        }
    }
}
