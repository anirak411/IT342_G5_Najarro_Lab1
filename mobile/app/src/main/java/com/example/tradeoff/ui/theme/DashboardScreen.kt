package com.example.tradeoff.ui.theme

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.tradeoff.model.ChatMessage
import com.example.tradeoff.model.Item
import com.example.tradeoff.model.SendMessageRequest
import com.example.tradeoff.network.RetrofitClient
import com.example.tradeoff.utils.SessionManager
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

enum class DashboardTab {
    MARKETPLACE,
    MY_LISTINGS,
    PROFILE,
    SETTINGS
}

private data class ListingForm(
    val title: String = "",
    val description: String = "",
    val price: String = "",
    val category: String = "Electronics",
    val condition: String = "Used",
    val location: String = ""
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    context: Context,
    onLogout: () -> Unit
) {
    val session = remember { SessionManager(context) }
    val user = remember { session.getUserProfile() }

    var currentTab by remember { mutableStateOf(DashboardTab.MARKETPLACE) }
    var items by remember { mutableStateOf<List<Item>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var loadError by remember { mutableStateOf<String?>(null) }

    var searchTerm by remember { mutableStateOf("") }
    val categories = listOf("All", "Electronics", "Clothing", "Books", "Others")
    var selectedCategory by remember { mutableStateOf("All") }
    var categoryExpanded by remember { mutableStateOf(false) }

    var notificationsExpanded by remember { mutableStateOf(false) }
    var profileMenuExpanded by remember { mutableStateOf(false) }

    var selectedItem by remember { mutableStateOf<Item?>(null) }
    var selectedPhotoIndex by remember { mutableIntStateOf(0) }

    var showSellDialog by remember { mutableStateOf(false) }
    var showEditDialog by remember { mutableStateOf(false) }
    var sellForm by remember { mutableStateOf(ListingForm()) }
    var sellImageUri by remember { mutableStateOf<Uri?>(null) }

    var showChatDialog by remember { mutableStateOf(false) }
    var chatPartnerEmail by remember { mutableStateOf("") }
    var chatPartnerLabel by remember { mutableStateOf("") }
    var chatMessages by remember { mutableStateOf<List<ChatMessage>>(emptyList()) }
    var chatText by remember { mutableStateOf("") }

    val drawerState = rememberDrawerState(initialValue = androidx.compose.material3.DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        sellImageUri = uri
    }

    fun refreshItems() {
        scope.launch {
            loading = true
            try {
                items = RetrofitClient.api.getItems()
                loadError = null
            } catch (_: Exception) {
                loadError = "Failed to load listings"
            } finally {
                loading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        refreshItems()
    }

    val filteredMarketplaceItems = remember(items, searchTerm, selectedCategory) {
        val term = searchTerm.trim().lowercase()

        items
            .filter { item ->
                selectedCategory == "All" || item.category.orEmpty()
                    .equals(selectedCategory, ignoreCase = true)
            }
            .filter { item ->
                if (term.isBlank()) {
                    true
                } else {
                    listOf(
                        item.title,
                        item.description,
                        item.category,
                        item.location,
                        item.condition ?: "",
                        item.sellerName ?: "",
                        item.sellerEmail ?: "",
                        item.price.toString()
                    ).joinToString(" ").lowercase().contains(term)
                }
            }
    }

    val myItems = remember(items, user.email, user.displayName) {
        items.filter { item ->
            val sellerEmail = item.sellerEmail?.trim().orEmpty()
            val emailMatch = user.email.isNotBlank() &&
                sellerEmail.isNotBlank() &&
                sellerEmail.equals(user.email.trim(), ignoreCase = true)

            val nameMatch = sellerEmail.isBlank() &&
                user.displayName.isNotBlank() &&
                cleanSellerName(item.sellerName)
                    .equals(user.displayName.trim(), ignoreCase = true)

            emailMatch || nameMatch
        }
    }

    val chatContacts = remember(items, user.email) {
        items.mapNotNull { item ->
            val email = item.sellerEmail?.trim().orEmpty()
            if (email.isBlank() || email.equals(user.email, ignoreCase = true)) {
                null
            } else {
                val rawLabel = item.sellerName?.ifBlank { email } ?: email
                val cleanedLabel = cleanSellerName(rawLabel).ifBlank { rawLabel }
                email to cleanedLabel
            }
        }.distinctBy { it.first }
    }

    suspend fun loadConversation() {
        if (chatPartnerEmail.isBlank() || user.email.isBlank()) {
            chatMessages = emptyList()
            return
        }
        chatMessages = try {
            RetrofitClient.api.getConversation(user.email, chatPartnerEmail)
        } catch (_: Exception) {
            emptyList()
        }
    }

    LaunchedEffect(showChatDialog, chatPartnerEmail) {
        if (showChatDialog) {
            loadConversation()
        }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(
                drawerContainerColor = androidx.compose.ui.graphics.Color.Transparent,
                drawerContentColor = MaterialTheme.colorScheme.onSurface
            ) {
                GlassCard(
                    modifier = Modifier
                        .padding(12.dp)
                        .fillMaxWidth(),
                    corner = 20.dp
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        SidebarItem("Marketplace") {
                            currentTab = DashboardTab.MARKETPLACE
                            scope.launch { drawerState.close() }
                        }
                        SidebarItem("My Listings") {
                            currentTab = DashboardTab.MY_LISTINGS
                            scope.launch { drawerState.close() }
                        }
                        SidebarItem("Profile") {
                            currentTab = DashboardTab.PROFILE
                            scope.launch { drawerState.close() }
                        }
                        SidebarItem("Settings") {
                            currentTab = DashboardTab.SETTINGS
                            scope.launch { drawerState.close() }
                        }
                        SidebarItem("Logout") {
                            session.clear()
                            onLogout()
                        }
                    }
                }
            }
        }
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(BackgroundColor)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    GlassIconButton(icon = Icons.Filled.Menu, onClick = {
                        scope.launch { drawerState.open() }
                    })

                    Text(
                        text = "TradeOff",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.primary
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box {
                            GlassIconButton(icon = Icons.Filled.Notifications, onClick = {
                                notificationsExpanded = true
                            })
                            DropdownMenu(
                                expanded = notificationsExpanded,
                                onDismissRequest = { notificationsExpanded = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("No notifications yet") },
                                    onClick = { notificationsExpanded = false }
                                )
                            }
                        }

                        Box {
                            ProfileAvatar(
                                name = user.displayName,
                                imageUrl = user.profilePicUrl,
                                onClick = {
                                profileMenuExpanded = true
                            })
                            DropdownMenu(
                                expanded = profileMenuExpanded,
                                onDismissRequest = { profileMenuExpanded = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("My Profile") },
                                    onClick = {
                                        currentTab = DashboardTab.PROFILE
                                        profileMenuExpanded = false
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Settings") },
                                    onClick = {
                                        currentTab = DashboardTab.SETTINGS
                                        profileMenuExpanded = false
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Logout") },
                                    onClick = {
                                        profileMenuExpanded = false
                                        session.clear()
                                        onLogout()
                                    }
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                when (currentTab) {
                    DashboardTab.MARKETPLACE -> {
                        OutlinedTextField(
                            value = searchTerm,
                            onValueChange = { searchTerm = it },
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = { Text("Search listings...") },
                            singleLine = true,
                            shape = RoundedCornerShape(14.dp)
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            ExposedDropdownMenuBox(
                                expanded = categoryExpanded,
                                onExpandedChange = { categoryExpanded = !categoryExpanded },
                                modifier = Modifier.weight(1f)
                            ) {
                                OutlinedTextField(
                                    value = selectedCategory,
                                    onValueChange = {},
                                    modifier = Modifier
                                        .menuAnchor()
                                        .fillMaxWidth(),
                                    readOnly = true,
                                    trailingIcon = {
                                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryExpanded)
                                    },
                                    shape = RoundedCornerShape(14.dp)
                                )

                                ExposedDropdownMenu(
                                    expanded = categoryExpanded,
                                    onDismissRequest = { categoryExpanded = false }
                                ) {
                                    categories.forEach { category ->
                                        DropdownMenuItem(
                                            text = { Text(category) },
                                            onClick = {
                                                selectedCategory = category
                                                categoryExpanded = false
                                            }
                                        )
                                    }
                                }
                            }

                            Button(
                                onClick = {
                                    sellForm = ListingForm()
                                    sellImageUri = null
                                    showSellDialog = true
                                },
                                shape = RoundedCornerShape(14.dp)
                            ) {
                                Text("Sell")
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        if (loading) {
                            Text("Loading listings...", color = GrayText)
                        } else if (loadError != null) {
                            Text(loadError ?: "", color = MaterialTheme.colorScheme.error)
                        } else {
                            ListingGrid(
                                items = filteredMarketplaceItems,
                                onItemClick = {
                                    selectedItem = it
                                    selectedPhotoIndex = 0
                                }
                            )
                        }
                    }

                    DashboardTab.MY_LISTINGS -> {
                        SectionTitle(text = "My Listings")
                        if (myItems.isEmpty()) {
                            Text("No listings yet.", color = GrayText)
                        } else {
                            ListingGrid(items = myItems, onItemClick = { selectedItem = it })
                        }
                    }

                    DashboardTab.PROFILE -> {
                        SectionTitle(text = "Profile")

                        GlassCard(modifier = Modifier.fillMaxWidth()) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                ProfileAvatar(
                                    name = user.displayName,
                                    imageUrl = user.profilePicUrl,
                                    size = 64.dp
                                )

                                Spacer(modifier = Modifier.width(12.dp))

                                Column {
                                    Text(
                                        text = user.displayName.ifBlank { "User" },
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = user.fullName,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = GrayText
                                    )
                                    Text(
                                        text = user.email,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = GrayText
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                        SectionTitle(text = "Your Listings")
                        if (myItems.isEmpty()) {
                            Text("No listings yet.", color = GrayText)
                        } else {
                            ListingGrid(items = myItems, onItemClick = { selectedItem = it })
                        }
                    }

                    DashboardTab.SETTINGS -> {
                        SectionTitle(text = "Settings")
                        GlassCard(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Account", style = MaterialTheme.typography.titleMedium)
                                Text("Manage account preferences.", color = GrayText)
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        GlassCard(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Notifications", style = MaterialTheme.typography.titleMedium)
                                Text("Configure message and listing notifications.", color = GrayText)
                            }
                        }
                    }
                }
            }

            ExtendedFloatingActionButton(
                onClick = {
                    if (chatContacts.isNotEmpty()) {
                        chatPartnerEmail = chatContacts.first().first
                        chatPartnerLabel = chatContacts.first().second
                    }
                    showChatDialog = true
                },
                icon = { Icon(imageVector = Icons.Filled.Chat, contentDescription = null) },
                text = { Text("Chat") },
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(18.dp),
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            )
        }
    }

    if (showSellDialog) {
        ListingFormDialog(
            title = "Sell Item",
            initial = sellForm,
            onDismiss = { showSellDialog = false },
            onPickImage = { imagePicker.launch("image/*") },
            pickedImageUri = sellImageUri,
            onSubmit = { form ->
                scope.launch {
                    val imagePart = buildImagePart(context, sellImageUri)
                    if (imagePart == null) {
                        showSellDialog = false
                        return@launch
                    }

                    val response = RetrofitClient.api.uploadItem(
                        title = form.title.toPlainRequestBody(),
                        description = form.description.toPlainRequestBody(),
                        price = form.price.toPlainRequestBody(),
                        category = form.category.toPlainRequestBody(),
                        condition = form.condition.toPlainRequestBody(),
                        location = form.location.toPlainRequestBody(),
                        sellerName = user.displayName.toPlainRequestBody(),
                        sellerEmail = user.email.toPlainRequestBody(),
                        images = listOf(imagePart)
                    )

                    if (response.isSuccessful) {
                        refreshItems()
                    }
                    showSellDialog = false
                }
            }
        )
    }

    val openItem = selectedItem
    if (openItem != null) {
        val images = itemImages(openItem)
        val isOwner = isOwner(openItem, user.email, user.displayName)

        AlertDialog(
            onDismissRequest = { selectedItem = null },
            confirmButton = {},
            dismissButton = {},
            title = {
                Text(
                    openItem.title?.ifBlank { "Untitled listing" } ?: "Untitled listing",
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (images.isNotEmpty()) {
                        AsyncImage(
                            model = images[selectedPhotoIndex.coerceIn(images.indices)],
                            contentDescription = openItem.title,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(180.dp)
                                .clip(RoundedCornerShape(14.dp)),
                            contentScale = ContentScale.Crop
                        )

                        if (images.size > 1) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                TextButton(onClick = {
                                    selectedPhotoIndex = (selectedPhotoIndex - 1 + images.size) % images.size
                                }) { Text("Prev") }
                                Text("${selectedPhotoIndex + 1}/${images.size}", color = GrayText)
                                TextButton(onClick = {
                                    selectedPhotoIndex = (selectedPhotoIndex + 1) % images.size
                                }) { Text("Next") }
                            }
                        }
                    }

                    Text("₱" + "%,.2f".format(openItem.price), color = MaterialTheme.colorScheme.primary)
                    Text(
                        "${openItem.location?.ifBlank { "Unknown location" } ?: "Unknown location"} • " +
                            "${openItem.category?.ifBlank { "Others" } ?: "Others"} • " +
                            "${openItem.condition ?: "Used"}"
                    )
                    Text(listingAgeLabel(openItem.createdAt), color = GrayText)
                    Text(openItem.description?.ifBlank { "No description provided." } ?: "No description provided.")

                    if (isOwner) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = {
                                    sellForm = ListingForm(
                                        title = openItem.title.orEmpty(),
                                        description = openItem.description.orEmpty(),
                                        price = openItem.price.toString(),
                                        category = openItem.category ?: "Others",
                                        condition = openItem.condition ?: "Used",
                                        location = openItem.location.orEmpty()
                                    )
                                    showEditDialog = true
                                },
                                modifier = Modifier.weight(1f)
                            ) { Text("Edit") }

                            TextButton(
                                onClick = {
                                    scope.launch {
                                        RetrofitClient.api.deleteItem(
                                            id = openItem.id,
                                            sellerEmail = user.email,
                                            sellerName = user.displayName
                                        )
                                        selectedItem = null
                                        refreshItems()
                                    }
                                },
                                modifier = Modifier.weight(1f)
                            ) { Text("Delete") }
                        }
                    } else {
                        Button(
                            onClick = {
                                chatPartnerEmail = openItem.sellerEmail.orEmpty()
                                chatPartnerLabel =
                                    openItem.sellerName?.ifBlank { chatPartnerEmail }
                                        ?: chatPartnerEmail
                                if (chatPartnerEmail.isNotBlank()) {
                                    showChatDialog = true
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) { Text("Message Seller") }
                    }

                    TextButton(onClick = { selectedItem = null }) { Text("Close") }
                }
            },
            shape = RoundedCornerShape(18.dp),
            containerColor = GlassSurface
        )
    }

    if (showEditDialog && selectedItem != null) {
        ListingFormDialog(
            title = "Edit Listing",
            initial = sellForm,
            onDismiss = { showEditDialog = false },
            onPickImage = { imagePicker.launch("image/*") },
            pickedImageUri = sellImageUri,
            onSubmit = { form ->
                scope.launch {
                    val parts = buildImagePart(context, sellImageUri)?.let { listOf(it) } ?: emptyList()

                    RetrofitClient.api.updateItem(
                        id = selectedItem!!.id,
                        title = form.title.toPlainRequestBody(),
                        description = form.description.toPlainRequestBody(),
                        price = form.price.toPlainRequestBody(),
                        category = form.category.toPlainRequestBody(),
                        condition = form.condition.toPlainRequestBody(),
                        location = form.location.toPlainRequestBody(),
                        sellerName = user.displayName.toPlainRequestBody(),
                        sellerEmail = user.email.toPlainRequestBody(),
                        images = parts
                    )

                    showEditDialog = false
                    selectedItem = null
                    refreshItems()
                }
            }
        )
    }

    if (showChatDialog) {
        AlertDialog(
            onDismissRequest = { showChatDialog = false },
            confirmButton = {},
            dismissButton = {},
            title = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Chat")
                    TextButton(onClick = { showChatDialog = false }) {
                        Icon(Icons.Filled.Close, contentDescription = null)
                    }
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (chatContacts.isNotEmpty()) {
                        var contactExpanded by remember { mutableStateOf(false) }
                        ExposedDropdownMenuBox(
                            expanded = contactExpanded,
                            onExpandedChange = { contactExpanded = !contactExpanded }
                        ) {
                            OutlinedTextField(
                                value = if (chatPartnerEmail.isBlank()) "Select contact" else chatPartnerLabel,
                                onValueChange = {},
                                modifier = Modifier
                                    .menuAnchor()
                                    .fillMaxWidth(),
                                readOnly = true,
                                trailingIcon = {
                                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = contactExpanded)
                                }
                            )
                            ExposedDropdownMenu(
                                expanded = contactExpanded,
                                onDismissRequest = { contactExpanded = false }
                            ) {
                                chatContacts.forEach { (email, label) ->
                                    DropdownMenuItem(
                                        text = { Text(label) },
                                        onClick = {
                                            chatPartnerEmail = email
                                            chatPartnerLabel = label
                                            contactExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(220.dp)
                            .background(GlassIconBg, RoundedCornerShape(12.dp))
                            .padding(8.dp)
                    ) {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            items(chatMessages) { msg ->
                                val mine = msg.senderEmail.equals(user.email, ignoreCase = true)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = if (mine) Arrangement.End else Arrangement.Start
                                ) {
                                    GlassCard(corner = 12.dp) {
                                        Text(
                                            msg.content,
                                            modifier = Modifier.padding(8.dp),
                                            color = if (mine) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = chatText,
                            onValueChange = { chatText = it },
                            modifier = Modifier.weight(1f),
                            placeholder = { Text("Type a message") },
                            singleLine = true
                        )
                        Button(onClick = {
                            if (chatPartnerEmail.isBlank() || chatText.isBlank()) return@Button
                            scope.launch {
                                try {
                                    RetrofitClient.api.sendMessage(
                                        SendMessageRequest(
                                            senderEmail = user.email,
                                            receiverEmail = chatPartnerEmail,
                                            content = chatText.trim()
                                        )
                                    )
                                    chatText = ""
                                    loadConversation()
                                } catch (_: Exception) {
                                }
                            }
                        }) {
                            Text("Send")
                        }
                    }
                }
            },
            shape = RoundedCornerShape(18.dp),
            containerColor = GlassSurface
        )
    }
}

@Composable
private fun ListingFormDialog(
    title: String,
    initial: ListingForm,
    onDismiss: () -> Unit,
    onPickImage: () -> Unit,
    pickedImageUri: Uri?,
    onSubmit: (ListingForm) -> Unit
) {
    var form by remember(initial) { mutableStateOf(initial) }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {},
        dismissButton = {},
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = form.title, onValueChange = { form = form.copy(title = it) }, label = { Text("Title") })
                OutlinedTextField(value = form.description, onValueChange = { form = form.copy(description = it) }, label = { Text("Description") })
                OutlinedTextField(value = form.price, onValueChange = { form = form.copy(price = it) }, label = { Text("Price") })
                OutlinedTextField(value = form.category, onValueChange = { form = form.copy(category = it) }, label = { Text("Category") })
                OutlinedTextField(value = form.condition, onValueChange = { form = form.copy(condition = it) }, label = { Text("Condition") })
                OutlinedTextField(value = form.location, onValueChange = { form = form.copy(location = it) }, label = { Text("Location") })

                Button(onClick = onPickImage) {
                    Text(if (pickedImageUri == null) "Choose Image" else "Change Image")
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = {
                        onSubmit(form)
                    }) { Text("Save") }

                    TextButton(onClick = onDismiss) { Text("Cancel") }
                }
            }
        },
        shape = RoundedCornerShape(18.dp),
        containerColor = GlassSurface
    )
}

@Composable
private fun SidebarItem(label: String, onClick: () -> Unit) {
    TextButton(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Text(text = label, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
private fun ProfileAvatar(
    name: String,
    imageUrl: String = "",
    size: Dp = 36.dp,
    onClick: (() -> Unit)? = null
) {
    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(GlassIconBg)
            .then(
                if (onClick != null) Modifier.clickable { onClick() } else Modifier
            ),
        contentAlignment = Alignment.Center
    ) {
        if (imageUrl.isNotBlank()) {
            AsyncImage(
                model = imageUrl,
                contentDescription = "Profile avatar",
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )
        } else if (name.isBlank()) {
            Icon(
                imageVector = Icons.Filled.Person,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
        } else {
            Text(
                text = name.first().uppercase(),
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
private fun ListingGrid(items: List<Item>, onItemClick: (Item) -> Unit) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        items(items) { item ->
            ListingCard(item = item, onClick = { onItemClick(item) })
        }
    }
}

@Composable
private fun ListingCard(item: Item, onClick: () -> Unit) {
    GlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        corner = 18.dp
    ) {
        Column {
            val image = primaryImageUrl(item)
            if (image.isNotBlank()) {
                AsyncImage(
                    model = image,
                    contentDescription = item.title ?: "Listing image",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp),
                    contentScale = ContentScale.Crop
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                        .background(GlassIconBg),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Person,
                        contentDescription = null,
                        tint = GrayText
                    )
                }
            }

            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = "₱" + "%,.2f".format(item.price),
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold
                )

                Text(
                    text = item.title?.ifBlank { "Untitled listing" } ?: "Untitled listing",
                    style = MaterialTheme.typography.bodyLarge,
                    maxLines = 1
                )

                Text(
                    text = "${item.location?.ifBlank { "Unknown location" } ?: "Unknown location"} • " +
                        "${item.category?.ifBlank { "Others" } ?: "Others"} • " +
                        listingAgeLabel(item.createdAt),
                    style = MaterialTheme.typography.bodyMedium,
                    color = GrayText,
                    maxLines = 2
                )
            }
        }
    }
}

private fun itemImages(item: Item): List<String> {
    return item.imageUrl
        ?.split(",")
        ?.map { it.trim() }
        ?.filter { it.isNotBlank() }
        ?: emptyList()
}

private fun primaryImageUrl(item: Item): String {
    return itemImages(item).firstOrNull() ?: ""
}

private fun listingAgeLabel(createdAt: String?): String {
    if (createdAt.isNullOrBlank()) return "Posted recently"

    val date = try {
        LocalDateTime.parse(createdAt, DateTimeFormatter.ISO_DATE_TIME)
    } catch (_: DateTimeParseException) {
        return "Posted recently"
    }

    val duration = Duration.between(date, LocalDateTime.now())
    val minutes = duration.toMinutes().coerceAtLeast(0)
    val hours = duration.toHours().coerceAtLeast(0)
    val days = duration.toDays().coerceAtLeast(0)

    return when {
        minutes < 1 -> "Posted just now"
        minutes == 1L -> "Posted 1 minute ago"
        minutes < 60 -> "Posted $minutes minutes ago"
        hours == 1L -> "Posted 1 hour ago"
        hours < 24 -> "Posted $hours hours ago"
        days == 1L -> "Posted 1 day ago"
        days < 7 -> "Posted $days days ago"
        days < 365 -> "Posted ${days / 7} weeks ago"
        else -> "Posted ${days / 365} years ago"
    }
}

private fun isOwner(item: Item, email: String, displayName: String): Boolean {
    val sellerEmail = item.sellerEmail?.trim().orEmpty()
    val cleanedSellerName = cleanSellerName(item.sellerName)

    val byEmail = email.isNotBlank() &&
        sellerEmail.isNotBlank() &&
        sellerEmail.equals(email.trim(), ignoreCase = true)

    val byName = sellerEmail.isBlank() &&
        displayName.isNotBlank() &&
        cleanedSellerName.equals(displayName.trim(), ignoreCase = true)

    return byEmail || byName
}

private fun cleanSellerName(raw: String?): String {
    val value = raw?.trim().orEmpty()
    if (value.isBlank()) return ""

    if (value.startsWith("{")) {
        val display = Regex("\"displayName\"\\s*:\\s*\"([^\"]+)\"")
            .find(value)
            ?.groupValues
            ?.getOrNull(1)
            .orEmpty()

        if (display.isNotBlank()) return display

        return Regex("\"fullName\"\\s*:\\s*\"([^\"]+)\"")
            .find(value)
            ?.groupValues
            ?.getOrNull(1)
            .orEmpty()
            .ifBlank { value }
    }

    return value
}

private fun String.toPlainRequestBody() = toRequestBody("text/plain".toMediaType())

private fun buildImagePart(context: Context, uri: Uri?): MultipartBody.Part? {
    if (uri == null) return null

    val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return null
    val requestBody = bytes.toRequestBody("image/*".toMediaType())
    return MultipartBody.Part.createFormData("images", "mobile_image.jpg", requestBody)
}
