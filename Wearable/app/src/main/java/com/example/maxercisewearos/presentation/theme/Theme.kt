package com.example.maxercisewearos.presentation.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.googlefonts.Font
import androidx.compose.ui.text.googlefonts.GoogleFont
import androidx.wear.compose.material3.ColorScheme
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Typography
import com.example.maxercisewearos.R

val PrimaryBlue = Color(0xFF0071E3)
val SecondaryBlue = Color(0xFF2A94FF)
val BackgroundColor = Color(0xFF000000)
val SurfaceColor = Color(0xFF1C1C1E) // Darker gray for cards
val OnSurfaceColor = Color(0xFFFBFBFE)
val OnPrimaryColor = Color(0xFFFBFBFE)

private val provider = GoogleFont.Provider(
    providerAuthority = "com.google.android.gms.fonts",
    providerPackage = "com.google.android.gms",
    certificates = R.array.com_google_android_gms_fonts_certs
)

val QuicksandFont = FontFamily(Font(googleFont = GoogleFont("Quicksand"), fontProvider = provider))
val RalewayFont = FontFamily(Font(googleFont = GoogleFont("Raleway"), fontProvider = provider))
val ComfortaaFont = FontFamily(Font(googleFont = GoogleFont("Comfortaa"), fontProvider = provider))

val MaxerciseColorScheme = ColorScheme(
    primary = PrimaryBlue,
    onPrimary = OnPrimaryColor,
    secondary = SecondaryBlue,
    onSecondary = OnPrimaryColor,
    background = BackgroundColor,
    onBackground = OnSurfaceColor,
    onSurface = OnSurfaceColor,
    surfaceContainer = SurfaceColor
)

val MaxerciseTypography = Typography(
    titleMedium = Typography().titleMedium.copy(
        fontFamily = ComfortaaFont,
        fontWeight = FontWeight.Bold
    ),
    bodyMedium = Typography().bodyMedium.copy(
        fontFamily = QuicksandFont
    ),
    labelSmall = Typography().labelSmall.copy(
        fontFamily = QuicksandFont
    )
)

@Composable
fun MaxerciseWearOSTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = MaxerciseColorScheme,
        typography = MaxerciseTypography,
        content = content
    )
}
