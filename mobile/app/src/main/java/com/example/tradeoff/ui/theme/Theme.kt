package com.example.tradeoff.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val TradeOffColorScheme = lightColorScheme(
    primary = PrimaryColor,
    secondary = SecondaryColor,
    background = BackgroundColor,
    surface = CardColor,
    outline = BorderColor,
    onPrimary = Color.White,
    onBackground = SecondaryColor,
    onSurface = SecondaryColor
)

@Composable
fun TradeOffTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = TradeOffColorScheme,
        typography = Typography(),
        content = content
    )
}
