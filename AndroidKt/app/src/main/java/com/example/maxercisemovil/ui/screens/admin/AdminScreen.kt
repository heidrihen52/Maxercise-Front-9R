package com.example.maxercisemovil.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp

data class NavItem(val title: String, val icon: ImageVector)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminScreen(
    onLogout: () -> Unit
) {
    var selectedItem by remember { mutableStateOf("Catálogo ejercicios") }
    
    val items = listOf(
        NavItem("Catálogo ejercicios", Icons.Default.Home),
        NavItem("Catálogo rutinas", Icons.Default.List),
        NavItem("Usuarios", Icons.Default.Person)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        text = selectedItem, 
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    ) 
                },
                actions = {
                    IconButton(onClick = onLogout) {
                        Icon(
                            Icons.Default.ExitToApp, 
                            contentDescription = "Cerrar sesión", 
                            tint = MaterialTheme.colorScheme.error
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                items.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { 
                            Text(
                                item.title, 
                                maxLines = 1, 
                                overflow = TextOverflow.Ellipsis,
                                style = MaterialTheme.typography.labelSmall
                            ) 
                        },
                        selected = selectedItem == item.title,
                        onClick = { selectedItem = item.title },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.onPrimary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            indicatorColor = MaterialTheme.colorScheme.primary,
                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            val context = androidx.compose.ui.platform.LocalContext.current
            val factory = com.example.maxercisemovil.ui.screens.ViewModelFactory(context)
            
            when (selectedItem) {
                "Mis ejercicios", "Catálogo ejercicios" -> {
                    val viewModel: com.example.maxercisemovil.ui.screens.exercises.ExercisesViewModel = 
                        androidx.lifecycle.viewmodel.compose.viewModel(factory = factory)
                    com.example.maxercisemovil.ui.screens.exercises.ExercisesScreen(viewModel = viewModel)
                }
                "Mis rutinas", "Catálogo rutinas" -> {
                    val viewModel: com.example.maxercisemovil.ui.screens.routines.RoutinesViewModel = 
                        androidx.lifecycle.viewmodel.compose.viewModel(factory = factory)
                    com.example.maxercisemovil.ui.screens.routines.RoutinesScreen(viewModel = viewModel)
                }
                "Usuarios" -> {
                    val viewModel: com.example.maxercisemovil.ui.screens.users.AdminUsersViewModel = 
                        androidx.lifecycle.viewmodel.compose.viewModel(factory = factory)
                    com.example.maxercisemovil.ui.screens.users.AdminUsersScreen(viewModel = viewModel)
                }
                else -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Pantalla no encontrada")
                    }
                }
            }
        }
    }
}
