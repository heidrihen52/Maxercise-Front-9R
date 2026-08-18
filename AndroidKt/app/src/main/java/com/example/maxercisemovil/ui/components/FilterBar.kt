package com.example.maxercisemovil.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterBar(
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    showFilters: Boolean,
    onToggleFilters: () -> Unit,
    activeFiltersCount: Int = 0,
    onClearFilters: () -> Unit = {},
    filterContent: @Composable () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White)
            .padding(vertical = 8.dp, horizontal = 16.dp)
    ) {
        // Top Row: Search and Toggle
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Search Input
            OutlinedTextField(
                value = searchQuery,
                onValueChange = onSearchChange,
                modifier = Modifier
                    .weight(1f)
                    .height(50.dp),
                placeholder = { Text("Buscar...", color = Color.Gray, fontSize = 14.sp) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = Color.Gray,
                        modifier = Modifier.size(20.dp)
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { onSearchChange("") }) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Clear",
                                tint = Color.Gray,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedContainerColor = Color(0xFFF1F5F9), // Slate 100
                    focusedContainerColor = Color(0xFFF1F5F9),
                    unfocusedBorderColor = Color.Transparent,
                    focusedBorderColor = Color(0xFF3B82F6), // Blue 500
                    cursorColor = Color(0xFF3B82F6)
                ),
                shape = RoundedCornerShape(8.dp),
                singleLine = true
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Toggle Button
            Button(
                onClick = onToggleFilters,
                modifier = Modifier.height(50.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (showFilters || activeFiltersCount > 0) Color(0xFF3B82F6) else Color(0xFFF1F5F9),
                    contentColor = if (showFilters || activeFiltersCount > 0) Color.White else Color(0xFF475569)
                ),
                contentPadding = PaddingValues(horizontal = 12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Filters",
                    modifier = Modifier.size(20.dp)
                )
                if (activeFiltersCount > 0) {
                    Spacer(modifier = Modifier.width(4.dp))
                    Box(
                        modifier = Modifier
                            .background(Color.White, RoundedCornerShape(50))
                            .padding(horizontal = 6.dp, vertical = 2.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = activeFiltersCount.toString(),
                            color = Color(0xFF3B82F6),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
        
        // Expanded Filters Panel
        AnimatedVisibility(visible = showFilters) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp)
            ) {
                if (activeFiltersCount > 0) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        horizontalArrangement = Arrangement.End
                    ) {
                        Text(
                            text = "Limpiar Filtros",
                            fontSize = 12.sp,
                            color = Color(0xFFEF4444), // Red 500
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.clickable { onClearFilters() }
                        )
                    }
                }
                
                filterContent()
            }
        }
    }
}

@Composable
fun FilterGroup(
    title: String,
    options: List<String>,
    selectedOption: String?,
    onOptionSelected: (String) -> Unit
) {
    Column(modifier = Modifier.padding(bottom = 12.dp)) {
        Text(
            text = title,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF64748B),
            modifier = Modifier.padding(bottom = 8.dp)
        )
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(options) { option ->
                val isSelected = selectedOption == option
                Box(
                    modifier = Modifier
                        .background(
                            color = if (isSelected) Color(0xFF3B82F6) else Color(0xFFF1F5F9),
                            shape = RoundedCornerShape(16.dp)
                        )
                        .clickable { onOptionSelected(if (isSelected) "" else option) }
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = option,
                        color = if (isSelected) Color.White else Color(0xFF475569),
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                }
            }
        }
    }
}
