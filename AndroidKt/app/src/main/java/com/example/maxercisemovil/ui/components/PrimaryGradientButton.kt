package com.example.maxercisemovil.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.maxercisemovil.ui.theme.BlueDeep
import com.example.maxercisemovil.ui.theme.BluePrimary

@Composable
fun PrimaryGradientButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    val gradientColors = if (enabled) {
        listOf(BluePrimary, BlueDeep)
    } else {
        listOf(Color.Gray, Color.DarkGray)
    }

    val shadowColor = if (enabled) BluePrimary.copy(alpha = 0.5f) else Color.Transparent

    Box(
        modifier = modifier
            .height(50.dp)
            .shadow(
                elevation = if (enabled) 8.dp else 0.dp,
                shape = RoundedCornerShape(percent = 50),
                spotColor = shadowColor
            )
            .clip(RoundedCornerShape(percent = 50))
            .background(Brush.linearGradient(gradientColors))
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 24.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
    }
}
