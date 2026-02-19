package com.example.tradeoff.ui.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun GlassBackground(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit
) {
    Box(
        modifier = modifier
            .background(BackgroundColor),
        content = content
    )
}

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    corner: Dp = 24.dp,
    content: @Composable () -> Unit
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(corner),
        colors = CardDefaults.cardColors(
            containerColor = GlassSurface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        content()
    }
}

@Composable
fun GlassIconButton(
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    IconButton(
        onClick = onClick,
        modifier = modifier
            .background(
                color = GlassIconBg,
                shape = RoundedCornerShape(12.dp)
            )
    ) {
        Icon(imageVector = icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
    }
}

@Composable
fun SectionTitle(
    text: String,
    modifier: Modifier = Modifier
) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleLarge,
        color = MaterialTheme.colorScheme.onBackground,
        modifier = modifier.padding(bottom = 8.dp)
    )
}
