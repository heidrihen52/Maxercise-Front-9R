package com.example.maxercisemovil.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.maxercisemovil.R
import com.example.maxercisemovil.ui.theme.BluePrimary
import com.example.maxercisemovil.ui.components.GlassCard
import com.example.maxercisemovil.ui.components.PrimaryGradientButton

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    viewModel: RegisterViewModel,
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // Form State
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var captchaResult by remember { mutableStateOf("") }
    
    val captchaA by remember { mutableIntStateOf((1..10).random()) }
    val captchaB by remember { mutableIntStateOf((1..10).random()) }
    var localError by remember { mutableStateOf("") }

    LaunchedEffect(uiState) {
        if (uiState is RegisterState.Success) {
            onRegisterSuccess()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F2C59)) // Dark blue background mimicking the web app auth-bg
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // White card containing the form
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                color = Color.White
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Logo Header
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(bottom = 16.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = android.R.drawable.ic_menu_agenda), // Placeholder for barbell
                            contentDescription = "Logo",
                            tint = BluePrimary,
                            modifier = Modifier.size(32.dp).padding(end = 8.dp)
                        )
                        Text(
                            text = "maxercise",
                            style = MaterialTheme.typography.displayLarge.copy(fontSize = 32.sp),
                            color = Color(0xFF1E293B),
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    // Title
                    Text(
                        text = "Crea tu cuenta",
                        style = MaterialTheme.typography.displayLarge.copy(fontSize = 28.sp),
                        color = Color(0xFF1E293B),
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Comienza gratis y personaliza tu experiencia",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF64748B),
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(32.dp))

                    val combinedError = localError.ifEmpty { 
                        if (uiState is RegisterState.Error) (uiState as RegisterState.Error).message else "" 
                    }
                    if (combinedError.isNotEmpty()) {
                        Text(
                            text = combinedError,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(bottom = 16.dp).align(Alignment.Start)
                        )
                    }

                    // Fields
                    RegisterField(
                        label = "Nombre completo",
                        value = name,
                        onValueChange = { name = it },
                        placeholder = "Tu nombre"
                    )

                    RegisterField(
                        label = "Correo electrónico",
                        value = email,
                        onValueChange = { email = it },
                        placeholder = "tu@correo.com",
                        keyboardType = KeyboardType.Email
                    )

                    RegisterField(
                        label = "Contraseña",
                        value = password,
                        onValueChange = { password = it },
                        placeholder = "Mín. 6 caracteres, 1 mayúscula, 1 número, 1 esp",
                        isPassword = true
                    )

                    RegisterField(
                        label = "Confirmar contraseña",
                        value = confirmPassword,
                        onValueChange = { confirmPassword = it },
                        placeholder = "Repite tu contraseña",
                        isPassword = true
                    )

                    RegisterField(
                        label = "Verificación humana: ¿Cuánto es $captchaA + $captchaB?",
                        value = captchaResult,
                        onValueChange = { captchaResult = it },
                        placeholder = "Resultado",
                        keyboardType = KeyboardType.Number
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))

                    // Submit Button
                    val isLoading = uiState is RegisterState.Loading
                    Button(
                        onClick = {
                            localError = ""
                            if (password != confirmPassword) {
                                localError = "Las contraseñas no coinciden"
                                return@Button
                            }
                            if (captchaResult.toIntOrNull() != (captchaA + captchaB)) {
                                localError = "La suma de verificación humana es incorrecta."
                                return@Button
                            }
                            // Call ViewModel with dummy values for missing Prisma fields
                            // Split name into first and last
                            val parts = name.trim().split(" ")
                            val firstName = parts.firstOrNull() ?: ""
                            val lastName = if (parts.size > 1) parts.drop(1).joinToString(" ") else "N/A"
                            viewModel.register(
                                firstName = firstName,
                                lastName = lastName,
                                email = email,
                                phone = "00000000",
                                bodyType = "ECTOMORFO",
                                birthDate = "1990-01-01",
                                password = password
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(25.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BluePrimary),
                        enabled = !isLoading
                    ) {
                        Text(
                            text = if (isLoading) "Creando cuenta..." else "Crear cuenta y comenzar →",
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Footer
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "¿Ya tienes cuenta? ",
                            color = Color(0xFF64748B),
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Text(
                            text = "Iniciar sesión",
                            color = BluePrimary,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.clickable { onNavigateToLogin() }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    isPassword: Boolean = false,
    keyboardType: KeyboardType = KeyboardType.Text
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = Color(0xFF475569),
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, color = Color(0xFFA0AABF)) },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            visualTransformation = if (isPassword) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = BluePrimary,
                unfocusedBorderColor = Color(0xFFCBD5E1),
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
            ),
            singleLine = true
        )
    }
}
