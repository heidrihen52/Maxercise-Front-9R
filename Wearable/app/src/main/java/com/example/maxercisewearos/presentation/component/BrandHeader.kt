package com.example.maxercisewearos.presentation.component

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Icon
import androidx.wear.compose.material3.Text
import com.example.maxercisewearos.R
import com.example.maxercisewearos.presentation.theme.ComfortaaFont
import com.example.maxercisewearos.presentation.theme.QuicksandFont

@Composable
fun MaxerciseLogo(modifier: Modifier = Modifier) {
    Box(modifier = modifier, contentAlignment = Alignment.CenterStart) {
        // Back kettlebell (leftmost, lowest alpha/lighter blue)
        Icon(
            painter = painterResource(id = R.drawable.ic_kettlebell),
            contentDescription = null,
            tint = Color(0xFF2A94FF).copy(alpha = 0.4f),
            modifier = Modifier
                .size(20.dp)
                .offset(x = 0.dp)
        )
        // Middle kettlebell (shifted right, slightly higher alpha)
        Icon(
            painter = painterResource(id = R.drawable.ic_kettlebell),
            contentDescription = null,
            tint = Color(0xFF2A94FF).copy(alpha = 0.7f),
            modifier = Modifier
                .size(20.dp)
                .offset(x = 5.dp)
        )
        // Front kettlebell (rightmost, full color)
        Icon(
            painter = painterResource(id = R.drawable.ic_kettlebell),
            contentDescription = null,
            tint = Color(0xFF0071E3),
            modifier = Modifier
                .size(20.dp)
                .offset(x = 10.dp)
        )
    }
}

@Composable
fun BrandHeader(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            MaxerciseLogo(modifier = Modifier.width(32.dp).height(20.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "maxercise",
                fontFamily = ComfortaaFont,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = Color.White
            )
        }
        Text(
            text = "consúltalo. aplícalo. maximízalo.",
            fontFamily = QuicksandFont,
            fontSize = 9.sp,
            color = Color(0xFF2A94FF),
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )
    }
}
