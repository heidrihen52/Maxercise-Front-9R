package com.example.maxercisemovil.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    isDark: Boolean = false,
    content: @Composable BoxScope.() -> Unit
) {
    val backgroundColor = if (isDark) {
        Color(0xFF0F172A).copy(alpha = 0.7f)
    } else {
        Color(0xFFFFFFFF).copy(alpha = 0.75f)
    }

    val borderColor = if (isDark) {
        Color(0xFFFFFFFF).copy(alpha = 0.1f)
    } else {
        Color(0xFFFFFFFF).copy(alpha = 0.5f)
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(backgroundColor)
            .border(1.dp, borderColor, RoundedCornerShape(14.dp)),
        content = content
    )
}
