package com.example.tradeoff

import android.app.AlertDialog
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.widget.doAfterTextChanged
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import coil.load
import com.example.tradeoff.model.AuthRequest
import com.example.tradeoff.model.ChatMessage
import com.example.tradeoff.model.Item
import com.example.tradeoff.model.LoginRequest
import com.example.tradeoff.model.SendMessageRequest
import com.example.tradeoff.model.UserProfile
import com.example.tradeoff.network.RetrofitClient
import com.example.tradeoff.ui.ChatMessageAdapter
import com.example.tradeoff.ui.ItemListAdapter
import com.example.tradeoff.utils.SessionManager
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.Locale

class MainActivity : ComponentActivity() {

    private enum class Screen {
        LANDING,
        LOGIN,
        REGISTER,
        DASHBOARD
    }

    private enum class DashboardTab {
        MARKETPLACE,
        MY_LISTINGS,
        PROFILE,
        SETTINGS
    }

    private lateinit var sessionManager: SessionManager

    private lateinit var layoutLanding: View
    private lateinit var layoutLogin: View
    private lateinit var layoutRegister: View
    private lateinit var layoutDashboard: View

    private lateinit var btnLandingLogin: Button
    private lateinit var btnLandingRegister: Button
    private lateinit var etLandingSearch: EditText
    private lateinit var tvLandingStatus: TextView
    private lateinit var progressLanding: ProgressBar
    private lateinit var rvLandingItems: RecyclerView

    private lateinit var btnLoginBack: Button
    private lateinit var etLoginEmail: EditText
    private lateinit var etLoginPassword: EditText
    private lateinit var btnLoginSubmit: Button
    private lateinit var btnLoginGoRegister: Button

    private lateinit var btnRegisterBack: Button
    private lateinit var etRegisterFullName: EditText
    private lateinit var etRegisterDisplayName: EditText
    private lateinit var etRegisterEmail: EditText
    private lateinit var etRegisterPassword: EditText
    private lateinit var btnRegisterSubmit: Button

    private lateinit var tvDashboardWelcome: TextView
    private lateinit var etDashboardSearch: EditText
    private lateinit var btnTabMarketplace: Button
    private lateinit var btnTabMyListings: Button
    private lateinit var btnTabProfile: Button
    private lateinit var btnTabSettings: Button
    private lateinit var spDashboardCategory: Spinner
    private lateinit var spDashboardSort: Spinner
    private lateinit var btnDashboardSell: Button
    private lateinit var tvDashboardStatus: TextView
    private lateinit var progressDashboard: ProgressBar
    private lateinit var btnDashboardRefresh: Button
    private lateinit var btnDashboardChat: Button
    private lateinit var btnDashboardLogout: Button
    private lateinit var rvDashboardItems: RecyclerView
    private lateinit var layoutDashboardFilters: View
    private lateinit var layoutDashboardListHeader: View
    private lateinit var layoutDashboardProfile: View
    private lateinit var layoutDashboardSettings: View
    private lateinit var tvProfileDisplayName: TextView
    private lateinit var tvProfileFullName: TextView
    private lateinit var tvProfileEmail: TextView
    private lateinit var tvProfileListingCount: TextView

    private lateinit var landingAdapter: ItemListAdapter
    private lateinit var dashboardAdapter: ItemListAdapter

    private var currentScreen = Screen.LANDING
    private var currentTab = DashboardTab.MARKETPLACE
    private var landingSearchQuery = ""
    private var dashboardSearchQuery = ""
    private var selectedCategory = "All"
    private var selectedSortIndex = 0
    private var allItems: List<Item> = emptyList()
    private var pendingImageResult: ((Uri?) -> Unit)? = null

    private val singleImagePicker =
        registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
            pendingImageResult?.invoke(uri)
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        sessionManager = SessionManager(this)
        bindViews()
        setupListingGrids()
        setupFilterControls()
        setupSearchInputs()
        setupClickListeners()

        if (sessionManager.isLoggedIn()) {
            showScreen(Screen.DASHBOARD)
        } else {
            showScreen(Screen.LANDING)
        }
    }

    private fun bindViews() {
        layoutLanding = findViewById(R.id.layoutLanding)
        layoutLogin = findViewById(R.id.layoutLogin)
        layoutRegister = findViewById(R.id.layoutRegister)
        layoutDashboard = findViewById(R.id.layoutDashboard)

        btnLandingLogin = findViewById(R.id.btnLandingLogin)
        btnLandingRegister = findViewById(R.id.btnLandingRegister)
        etLandingSearch = findViewById(R.id.etLandingSearch)
        tvLandingStatus = findViewById(R.id.tvLandingStatus)
        progressLanding = findViewById(R.id.progressLanding)
        rvLandingItems = findViewById(R.id.rvLandingItems)

        btnLoginBack = findViewById(R.id.btnLoginBack)
        etLoginEmail = findViewById(R.id.etLoginEmail)
        etLoginPassword = findViewById(R.id.etLoginPassword)
        btnLoginSubmit = findViewById(R.id.btnLoginSubmit)
        btnLoginGoRegister = findViewById(R.id.btnLoginGoRegister)

        btnRegisterBack = findViewById(R.id.btnRegisterBack)
        etRegisterFullName = findViewById(R.id.etRegisterFullName)
        etRegisterDisplayName = findViewById(R.id.etRegisterDisplayName)
        etRegisterEmail = findViewById(R.id.etRegisterEmail)
        etRegisterPassword = findViewById(R.id.etRegisterPassword)
        btnRegisterSubmit = findViewById(R.id.btnRegisterSubmit)

        tvDashboardWelcome = findViewById(R.id.tvDashboardWelcome)
        etDashboardSearch = findViewById(R.id.etDashboardSearch)
        btnTabMarketplace = findViewById(R.id.btnTabMarketplace)
        btnTabMyListings = findViewById(R.id.btnTabMyListings)
        btnTabProfile = findViewById(R.id.btnTabProfile)
        btnTabSettings = findViewById(R.id.btnTabSettings)
        spDashboardCategory = findViewById(R.id.spDashboardCategory)
        spDashboardSort = findViewById(R.id.spDashboardSort)
        btnDashboardSell = findViewById(R.id.btnDashboardSell)
        tvDashboardStatus = findViewById(R.id.tvDashboardStatus)
        progressDashboard = findViewById(R.id.progressDashboard)
        btnDashboardRefresh = findViewById(R.id.btnDashboardRefresh)
        btnDashboardChat = findViewById(R.id.btnDashboardChat)
        btnDashboardLogout = findViewById(R.id.btnDashboardLogout)
        rvDashboardItems = findViewById(R.id.rvDashboardItems)
        layoutDashboardFilters = findViewById(R.id.layoutDashboardFilters)
        layoutDashboardListHeader = findViewById(R.id.layoutDashboardListHeader)
        layoutDashboardProfile = findViewById(R.id.layoutDashboardProfile)
        layoutDashboardSettings = findViewById(R.id.layoutDashboardSettings)
        tvProfileDisplayName = findViewById(R.id.tvProfileDisplayName)
        tvProfileFullName = findViewById(R.id.tvProfileFullName)
        tvProfileEmail = findViewById(R.id.tvProfileEmail)
        tvProfileListingCount = findViewById(R.id.tvProfileListingCount)
    }

    private fun setupListingGrids() {
        landingAdapter = ItemListAdapter {
            showLoginRequiredPrompt()
        }
        dashboardAdapter = ItemListAdapter {
            showItemDetailsDialog(it)
        }

        val spanCount = when {
            resources.configuration.screenWidthDp >= 700 -> 3
            resources.configuration.screenWidthDp >= 420 -> 2
            else -> 1
        }

        rvLandingItems.layoutManager = GridLayoutManager(this, spanCount)
        rvLandingItems.adapter = landingAdapter

        rvDashboardItems.layoutManager = GridLayoutManager(this, spanCount)
        rvDashboardItems.adapter = dashboardAdapter
    }

    private fun setupFilterControls() {
        val categoryAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.listing_categories_with_all,
            android.R.layout.simple_spinner_item
        )
        categoryAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spDashboardCategory.adapter = categoryAdapter

        val sortAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.listing_sort_options,
            android.R.layout.simple_spinner_item
        )
        sortAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spDashboardSort.adapter = sortAdapter

        spDashboardCategory.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                selectedCategory = parent.getItemAtPosition(position).toString()
                applyDashboardTabState()
            }

            override fun onNothingSelected(parent: AdapterView<*>) = Unit
        }

        spDashboardSort.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                selectedSortIndex = position
                applyDashboardTabState()
            }

            override fun onNothingSelected(parent: AdapterView<*>) = Unit
        }
    }

    private fun setupSearchInputs() {
        etLandingSearch.doAfterTextChanged { editable ->
            landingSearchQuery = editable?.toString().orEmpty()
            applyLandingFilter()
        }

        etDashboardSearch.doAfterTextChanged { editable ->
            dashboardSearchQuery = editable?.toString().orEmpty()
            applyDashboardTabState()
        }
    }

    private fun setupClickListeners() {
        btnLandingLogin.setOnClickListener { showScreen(Screen.LOGIN) }
        btnLandingRegister.setOnClickListener { showScreen(Screen.REGISTER) }

        btnLoginBack.setOnClickListener { showScreen(Screen.LANDING) }
        btnLoginGoRegister.setOnClickListener { showScreen(Screen.REGISTER) }
        btnLoginSubmit.setOnClickListener { login() }

        btnRegisterBack.setOnClickListener { showScreen(Screen.LANDING) }
        btnRegisterSubmit.setOnClickListener { register() }

        btnTabMarketplace.setOnClickListener { switchDashboardTab(DashboardTab.MARKETPLACE) }
        btnTabMyListings.setOnClickListener { switchDashboardTab(DashboardTab.MY_LISTINGS) }
        btnTabProfile.setOnClickListener { switchDashboardTab(DashboardTab.PROFILE) }
        btnTabSettings.setOnClickListener { switchDashboardTab(DashboardTab.SETTINGS) }

        btnDashboardSell.setOnClickListener { openListingFormDialog(null) }
        btnDashboardRefresh.setOnClickListener { requestItems(force = true) }
        btnDashboardChat.setOnClickListener { openChatContactPicker() }
        btnDashboardLogout.setOnClickListener {
            sessionManager.clear()
            allItems = emptyList()
            landingAdapter.submitItems(emptyList())
            dashboardAdapter.submitItems(emptyList())
            showScreen(Screen.LANDING)
        }
    }

    private fun showScreen(screen: Screen) {
        currentScreen = screen
        layoutLanding.visibility = if (screen == Screen.LANDING) View.VISIBLE else View.GONE
        layoutLogin.visibility = if (screen == Screen.LOGIN) View.VISIBLE else View.GONE
        layoutRegister.visibility = if (screen == Screen.REGISTER) View.VISIBLE else View.GONE
        layoutDashboard.visibility = if (screen == Screen.DASHBOARD) View.VISIBLE else View.GONE

        when (screen) {
            Screen.LANDING -> requestItems(force = allItems.isEmpty())
            Screen.DASHBOARD -> {
                updateDashboardHeader()
                updateProfileSection()
                requestItems(force = allItems.isEmpty())
            }
            Screen.LOGIN, Screen.REGISTER -> Unit
        }
    }

    private fun switchDashboardTab(tab: DashboardTab) {
        currentTab = tab
        updateTabButtons()
        updateProfileSection()
        applyDashboardTabState()
    }

    private fun updateTabButtons() {
        setTabSelected(btnTabMarketplace, currentTab == DashboardTab.MARKETPLACE)
        setTabSelected(btnTabMyListings, currentTab == DashboardTab.MY_LISTINGS)
        setTabSelected(btnTabProfile, currentTab == DashboardTab.PROFILE)
        setTabSelected(btnTabSettings, currentTab == DashboardTab.SETTINGS)
    }

    private fun setTabSelected(button: Button, selected: Boolean) {
        button.setBackgroundResource(
            if (selected) R.drawable.bg_btn_primary else R.drawable.bg_btn_outline
        )
        button.setTextColor(
            ContextCompat.getColor(
                this,
                if (selected) android.R.color.white else R.color.text_main
            )
        )
    }

    private fun requestItems(force: Boolean) {
        if (!force && allItems.isNotEmpty()) {
            applyLandingFilter()
            applyDashboardTabState()
            return
        }

        showLoading(true)
        lifecycleScope.launch {
            try {
                allItems = RetrofitClient.api.getItems()
                applyLandingFilter()
                applyDashboardTabState()
            } catch (_: Exception) {
                if (currentScreen == Screen.LANDING) {
                    landingAdapter.submitItems(emptyList())
                    tvLandingStatus.text = getString(R.string.landing_error)
                } else if (currentScreen == Screen.DASHBOARD) {
                    dashboardAdapter.submitItems(emptyList())
                    tvDashboardStatus.text = getString(R.string.dashboard_error)
                }
            } finally {
                showLoading(false)
            }
        }
    }

    private fun showLoading(isLoading: Boolean) {
        if (currentScreen == Screen.LANDING) {
            progressLanding.visibility = if (isLoading) View.VISIBLE else View.GONE
            if (isLoading) {
                tvLandingStatus.text = getString(R.string.landing_loading)
            }
        }

        if (currentScreen == Screen.DASHBOARD && isListingTab()) {
            progressDashboard.visibility = if (isLoading) View.VISIBLE else View.GONE
            if (isLoading) {
                tvDashboardStatus.text = getString(R.string.dashboard_loading)
            }
        }
    }

    private fun isListingTab(): Boolean {
        return currentTab == DashboardTab.MARKETPLACE || currentTab == DashboardTab.MY_LISTINGS
    }

    private fun applyLandingFilter() {
        val filtered = filterItems(allItems, landingSearchQuery)
        val shown = filtered.take(8)
        landingAdapter.submitItems(shown)

        tvLandingStatus.text = when {
            allItems.isEmpty() -> getString(R.string.landing_empty)
            filtered.isEmpty() && landingSearchQuery.isNotBlank() -> getString(R.string.landing_no_results)
            landingSearchQuery.isNotBlank() || filtered.size > shown.size -> {
                getString(R.string.items_count_filtered, shown.size, filtered.size)
            }
            else -> resources.getQuantityString(
                R.plurals.landing_items_count,
                shown.size,
                shown.size
            )
        }
    }

    private fun applyDashboardTabState() {
        when (currentTab) {
            DashboardTab.PROFILE -> {
                showDashboardSection(profile = true, settings = false, listings = false)
                updateProfileSection()
            }
            DashboardTab.SETTINGS -> {
                showDashboardSection(profile = false, settings = true, listings = false)
            }
            DashboardTab.MARKETPLACE, DashboardTab.MY_LISTINGS -> {
                showDashboardSection(profile = false, settings = false, listings = true)
                applyDashboardListingFilters()
            }
        }
    }

    private fun showDashboardSection(profile: Boolean, settings: Boolean, listings: Boolean) {
        layoutDashboardProfile.visibility = if (profile) View.VISIBLE else View.GONE
        layoutDashboardSettings.visibility = if (settings) View.VISIBLE else View.GONE
        layoutDashboardFilters.visibility = if (listings) View.VISIBLE else View.GONE
        layoutDashboardListHeader.visibility = if (listings) View.VISIBLE else View.GONE
        rvDashboardItems.visibility = if (listings) View.VISIBLE else View.GONE
        progressDashboard.visibility = if (listings && progressDashboard.visibility == View.VISIBLE) {
            View.VISIBLE
        } else {
            View.GONE
        }
    }

    private fun applyDashboardListingFilters() {
        val ownerFiltered = when (currentTab) {
            DashboardTab.MY_LISTINGS -> allItems.filter { isItemOwnedByCurrentUser(it) }
            else -> allItems
        }

        val categoryFiltered = ownerFiltered.filter { item ->
            selectedCategory.equals("All", ignoreCase = true) ||
                item.category.orEmpty().equals(selectedCategory, ignoreCase = true)
        }

        val searchFiltered = filterItems(categoryFiltered, dashboardSearchQuery)
        val finalItems = sortItems(searchFiltered)
        dashboardAdapter.submitItems(finalItems)

        tvDashboardStatus.text = when {
            ownerFiltered.isEmpty() && currentTab == DashboardTab.MY_LISTINGS -> {
                getString(R.string.my_listings_empty)
            }
            ownerFiltered.isEmpty() -> {
                getString(R.string.dashboard_empty)
            }
            finalItems.isEmpty() -> {
                getString(R.string.dashboard_no_results)
            }
            dashboardSearchQuery.isNotBlank() || !selectedCategory.equals("All", ignoreCase = true) -> {
                getString(R.string.items_count_filtered, finalItems.size, ownerFiltered.size)
            }
            else -> {
                resources.getQuantityString(
                    R.plurals.dashboard_items_count,
                    finalItems.size,
                    finalItems.size
                )
            }
        }
    }

    private fun sortItems(items: List<Item>): List<Item> {
        return when (selectedSortIndex) {
            1 -> items.sortedBy { it.price }
            2 -> items.sortedByDescending { it.price }
            else -> items.sortedWith(
                compareByDescending<Item> { parseCreatedAt(it.createdAt) ?: LocalDateTime.MIN }
                    .thenByDescending { it.id }
            )
        }
    }

    private fun filterItems(items: List<Item>, query: String): List<Item> {
        val term = query.trim().lowercase(Locale.ROOT)
        if (term.isBlank()) return items

        return items.filter { item ->
            buildString {
                append(item.title.orEmpty())
                append(' ')
                append(item.description.orEmpty())
                append(' ')
                append(item.category.orEmpty())
                append(' ')
                append(item.condition.orEmpty())
                append(' ')
                append(item.location.orEmpty())
                append(' ')
                append(item.sellerName.orEmpty())
                append(' ')
                append(item.sellerEmail.orEmpty())
                append(' ')
                append(item.price)
            }.lowercase(Locale.ROOT).contains(term)
        }
    }

    private fun login() {
        val email = etLoginEmail.text.toString().trim()
        val password = etLoginPassword.text.toString()

        if (email.isBlank() || password.isBlank()) {
            Toast.makeText(this, R.string.error_fill_login, Toast.LENGTH_SHORT).show()
            return
        }

        btnLoginSubmit.isEnabled = false
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.api.login(
                    LoginRequest(email = email, password = password)
                )

                if (response.isSuccessful && response.body()?.success == true) {
                    val fallbackName = email.substringBefore("@").ifBlank { email }
                    val profile = response.body()?.data ?: UserProfile(
                        displayName = fallbackName,
                        fullName = fallbackName,
                        email = email
                    )
                    sessionManager.saveToken("logged_in")
                    sessionManager.saveUserProfile(profile)
                    Toast.makeText(
                        this@MainActivity,
                        R.string.login_success,
                        Toast.LENGTH_SHORT
                    ).show()
                    showScreen(Screen.DASHBOARD)
                } else {
                    Toast.makeText(
                        this@MainActivity,
                        response.body()?.message ?: getString(R.string.login_failed),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (_: Exception) {
                Toast.makeText(
                    this@MainActivity,
                    R.string.server_error,
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                btnLoginSubmit.isEnabled = true
            }
        }
    }

    private fun register() {
        val fullName = etRegisterFullName.text.toString().trim()
        val displayName = etRegisterDisplayName.text.toString().trim()
        val email = etRegisterEmail.text.toString().trim()
        val password = etRegisterPassword.text.toString()

        if (fullName.isBlank() || displayName.isBlank() || email.isBlank() || password.isBlank()) {
            Toast.makeText(this, R.string.error_fill_register, Toast.LENGTH_SHORT).show()
            return
        }

        btnRegisterSubmit.isEnabled = false
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.api.register(
                    AuthRequest(
                        fullName = fullName,
                        displayName = displayName,
                        email = email,
                        password = password
                    )
                )

                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(
                        this@MainActivity,
                        R.string.register_success,
                        Toast.LENGTH_SHORT
                    ).show()
                    etLoginEmail.setText(email)
                    etLoginPassword.setText("")
                    showScreen(Screen.LOGIN)
                } else {
                    Toast.makeText(
                        this@MainActivity,
                        response.body()?.message ?: getString(R.string.register_failed),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (_: Exception) {
                Toast.makeText(
                    this@MainActivity,
                    R.string.server_error,
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                btnRegisterSubmit.isEnabled = true
            }
        }
    }

    private fun showLoginRequiredPrompt() {
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.login_title))
            .setMessage(getString(R.string.landing_subtitle))
            .setNegativeButton(getString(R.string.action_cancel), null)
            .setPositiveButton(getString(R.string.action_sign_in)) { _, _ ->
                showScreen(Screen.LOGIN)
            }
            .show()
    }

    private fun showItemDetailsDialog(item: Item) {
        if (!sessionManager.isLoggedIn()) {
            showScreen(Screen.LOGIN)
            return
        }

        val dialogView = layoutInflater.inflate(R.layout.dialog_item_details, null)
        val ivImage = dialogView.findViewById<ImageView>(R.id.ivDetailImage)
        val tvPrice = dialogView.findViewById<TextView>(R.id.tvDetailPrice)
        val tvTitle = dialogView.findViewById<TextView>(R.id.tvDetailTitle)
        val tvMeta = dialogView.findViewById<TextView>(R.id.tvDetailMeta)
        val tvSeller = dialogView.findViewById<TextView>(R.id.tvDetailSeller)
        val tvDescription = dialogView.findViewById<TextView>(R.id.tvDetailDescription)
        val btnMessage = dialogView.findViewById<Button>(R.id.btnDetailMessage)
        val btnEdit = dialogView.findViewById<Button>(R.id.btnDetailEdit)
        val btnDelete = dialogView.findViewById<Button>(R.id.btnDetailDelete)

        ivImage.load(resolvePrimaryImage(item.imageUrl)) {
            crossfade(true)
            placeholder(R.drawable.bg_listing_image_placeholder)
            error(R.drawable.bg_listing_image_placeholder)
        }
        tvPrice.text = getString(R.string.item_price, String.format(Locale.US, "%.2f", item.price))
        tvTitle.text = item.title?.ifBlank { getString(R.string.item_unknown_title) }
            ?: getString(R.string.item_unknown_title)
        tvMeta.text = getString(
            R.string.listing_meta_detail,
            item.category?.ifBlank { getString(R.string.item_unknown_category) }
                ?: getString(R.string.item_unknown_category),
            item.condition?.ifBlank { getString(R.string.item_unknown_condition) }
                ?: getString(R.string.item_unknown_condition),
            listingAgeLabel(item.createdAt)
        )
        val seller = cleanSellerName(item.sellerName)
            .ifBlank { item.sellerEmail.orEmpty() }
            .ifBlank { getString(R.string.item_unknown_seller) }
        tvSeller.text = getString(R.string.listing_seller_label, seller)
        tvDescription.text = item.description?.ifBlank { getString(R.string.item_no_description) }
            ?: getString(R.string.item_no_description)

        val isOwner = isItemOwnedByCurrentUser(item)
        btnMessage.visibility = if (isOwner) View.GONE else View.VISIBLE
        btnEdit.visibility = if (isOwner) View.VISIBLE else View.GONE
        btnDelete.visibility = if (isOwner) View.VISIBLE else View.GONE

        val dialog = AlertDialog.Builder(this)
            .setTitle(getString(R.string.listing_details_title))
            .setView(dialogView)
            .setNegativeButton(getString(R.string.action_close), null)
            .create()

        btnMessage.setOnClickListener {
            val email = item.sellerEmail?.trim().orEmpty()
            val label = cleanSellerName(item.sellerName).ifBlank { email }
            if (email.isBlank()) {
                Toast.makeText(this, R.string.chat_no_contacts, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            dialog.dismiss()
            openChatDialog(email, label)
        }

        btnEdit.setOnClickListener {
            dialog.dismiss()
            openListingFormDialog(item)
        }

        btnDelete.setOnClickListener {
            dialog.dismiss()
            confirmDeleteListing(item)
        }

        dialog.show()
    }

    private fun openListingFormDialog(editingItem: Item?) {
        if (!sessionManager.isLoggedIn()) {
            showScreen(Screen.LOGIN)
            return
        }

        val dialogView = layoutInflater.inflate(R.layout.dialog_listing_form, null)
        val etTitle = dialogView.findViewById<EditText>(R.id.etFormTitle)
        val etDescription = dialogView.findViewById<EditText>(R.id.etFormDescription)
        val etPrice = dialogView.findViewById<EditText>(R.id.etFormPrice)
        val spCategory = dialogView.findViewById<Spinner>(R.id.spFormCategory)
        val spCondition = dialogView.findViewById<Spinner>(R.id.spFormCondition)
        val etLocation = dialogView.findViewById<EditText>(R.id.etFormLocation)
        val btnPickImage = dialogView.findViewById<Button>(R.id.btnFormPickImage)
        val btnClearImage = dialogView.findViewById<Button>(R.id.btnFormClearImage)
        val tvImageState = dialogView.findViewById<TextView>(R.id.tvFormImageState)

        val categoryAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.listing_categories,
            android.R.layout.simple_spinner_item
        )
        categoryAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spCategory.adapter = categoryAdapter

        val conditionAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.listing_conditions,
            android.R.layout.simple_spinner_item
        )
        conditionAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spCondition.adapter = conditionAdapter

        var selectedImageUri: Uri? = null
        tvImageState.text = if (editingItem == null) {
            getString(R.string.image_not_selected_label)
        } else {
            getString(R.string.image_not_selected_label)
        }

        if (editingItem != null) {
            etTitle.setText(editingItem.title.orEmpty())
            etDescription.setText(editingItem.description.orEmpty())
            etPrice.setText(editingItem.price.toString())
            etLocation.setText(editingItem.location.orEmpty())

            val categoryIndex = resources.getStringArray(R.array.listing_categories)
                .indexOfFirst { it.equals(editingItem.category, ignoreCase = true) }
            if (categoryIndex >= 0) spCategory.setSelection(categoryIndex)

            val conditionIndex = resources.getStringArray(R.array.listing_conditions)
                .indexOfFirst { it.equals(editingItem.condition, ignoreCase = true) }
            if (conditionIndex >= 0) spCondition.setSelection(conditionIndex)
        }

        btnPickImage.setOnClickListener {
            pendingImageResult = { uri ->
                selectedImageUri = uri
                tvImageState.text = if (uri != null) {
                    getString(R.string.image_selected_label)
                } else {
                    getString(R.string.image_not_selected_label)
                }
            }
            singleImagePicker.launch("image/*")
        }

        btnClearImage.setOnClickListener {
            selectedImageUri = null
            tvImageState.text = getString(R.string.image_not_selected_label)
        }

        val dialog = AlertDialog.Builder(this)
            .setTitle(
                getString(
                    if (editingItem == null) R.string.sell_dialog_title
                    else R.string.edit_dialog_title
                )
            )
            .setView(dialogView)
            .setNegativeButton(getString(R.string.action_cancel), null)
            .setPositiveButton(getString(R.string.action_save), null)
            .create()

        dialog.setOnDismissListener {
            pendingImageResult = null
        }

        dialog.setOnShowListener {
            val saveButton = dialog.getButton(AlertDialog.BUTTON_POSITIVE)
            saveButton.setOnClickListener {
                val title = etTitle.text.toString().trim()
                val description = etDescription.text.toString().trim()
                val priceText = etPrice.text.toString().trim()
                val location = etLocation.text.toString().trim()
                val category = spCategory.selectedItem?.toString().orEmpty()
                val condition = spCondition.selectedItem?.toString().orEmpty()

                if (
                    title.isBlank() ||
                    description.isBlank() ||
                    priceText.isBlank() ||
                    location.isBlank() ||
                    category.isBlank() ||
                    condition.isBlank()
                ) {
                    Toast.makeText(this, R.string.listing_form_required, Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                val price = priceText.toDoubleOrNull()
                if (price == null || price < 0.0) {
                    Toast.makeText(this, R.string.listing_invalid_price, Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                if (editingItem == null && selectedImageUri == null) {
                    Toast.makeText(this, R.string.listing_pick_image_required, Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                val user = sessionManager.getUserProfile()
                if (user.email.isBlank()) {
                    Toast.makeText(this, R.string.server_error, Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                saveButton.isEnabled = false
                lifecycleScope.launch {
                    try {
                        val parts = buildImagePart(selectedImageUri)?.let { listOf(it) } ?: emptyList()
                        val response = if (editingItem == null) {
                            RetrofitClient.api.uploadItem(
                                title = title.toPlainRequestBody(),
                                description = description.toPlainRequestBody(),
                                price = price.toString().toPlainRequestBody(),
                                category = category.toPlainRequestBody(),
                                condition = condition.toPlainRequestBody(),
                                location = location.toPlainRequestBody(),
                                sellerName = user.displayName.toPlainRequestBody(),
                                sellerEmail = user.email.toPlainRequestBody(),
                                images = parts
                            )
                        } else {
                            RetrofitClient.api.updateItem(
                                id = editingItem.id,
                                title = title.toPlainRequestBody(),
                                description = description.toPlainRequestBody(),
                                price = price.toString().toPlainRequestBody(),
                                category = category.toPlainRequestBody(),
                                condition = condition.toPlainRequestBody(),
                                location = location.toPlainRequestBody(),
                                sellerName = user.displayName.toPlainRequestBody(),
                                sellerEmail = user.email.toPlainRequestBody(),
                                images = parts
                            )
                        }

                        if (response.isSuccessful) {
                            Toast.makeText(
                                this@MainActivity,
                                R.string.listing_save_success,
                                Toast.LENGTH_SHORT
                            ).show()
                            dialog.dismiss()
                            requestItems(force = true)
                        } else {
                            Toast.makeText(
                                this@MainActivity,
                                R.string.listing_save_failed,
                                Toast.LENGTH_SHORT
                            ).show()
                            saveButton.isEnabled = true
                        }
                    } catch (_: Exception) {
                        Toast.makeText(
                            this@MainActivity,
                            R.string.listing_save_failed,
                            Toast.LENGTH_SHORT
                        ).show()
                        saveButton.isEnabled = true
                    }
                }
            }
        }

        dialog.show()
    }

    private fun confirmDeleteListing(item: Item) {
        if (!isItemOwnedByCurrentUser(item)) {
            Toast.makeText(this, R.string.listing_owner_only, Toast.LENGTH_SHORT).show()
            return
        }

        val user = sessionManager.getUserProfile()
        AlertDialog.Builder(this)
            .setMessage(getString(R.string.listing_delete_confirm))
            .setNegativeButton(getString(R.string.action_cancel), null)
            .setPositiveButton(getString(R.string.action_delete)) { _, _ ->
                lifecycleScope.launch {
                    try {
                        val response = RetrofitClient.api.deleteItem(
                            id = item.id,
                            sellerEmail = user.email,
                            sellerName = user.displayName
                        )
                        if (response.isSuccessful) {
                            Toast.makeText(
                                this@MainActivity,
                                R.string.listing_delete_success,
                                Toast.LENGTH_SHORT
                            ).show()
                            requestItems(force = true)
                        } else {
                            Toast.makeText(
                                this@MainActivity,
                                R.string.listing_delete_failed,
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    } catch (_: Exception) {
                        Toast.makeText(
                            this@MainActivity,
                            R.string.listing_delete_failed,
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
            .show()
    }

    private fun openChatContactPicker() {
        val contacts = buildChatContacts()
        if (contacts.isEmpty()) {
            Toast.makeText(this, R.string.chat_no_contacts, Toast.LENGTH_SHORT).show()
            return
        }

        val labels = contacts.map { (email, label) ->
            getString(R.string.chat_partner_label, label, email)
        }.toTypedArray()

        AlertDialog.Builder(this)
            .setTitle(getString(R.string.chat_pick_contact))
            .setItems(labels) { _, index ->
                val target = contacts[index]
                openChatDialog(target.first, target.second)
            }
            .setNegativeButton(getString(R.string.action_cancel), null)
            .show()
    }

    private fun openChatDialog(partnerEmail: String, partnerLabel: String) {
        val user = sessionManager.getUserProfile()
        if (user.email.isBlank() || partnerEmail.isBlank()) {
            Toast.makeText(this, R.string.chat_no_contacts, Toast.LENGTH_SHORT).show()
            return
        }

        val dialogView = layoutInflater.inflate(R.layout.dialog_chat, null)
        val tvPartner = dialogView.findViewById<TextView>(R.id.tvChatPartner)
        val rvMessages = dialogView.findViewById<RecyclerView>(R.id.rvChatMessages)
        val tvState = dialogView.findViewById<TextView>(R.id.tvChatState)
        val etInput = dialogView.findViewById<EditText>(R.id.etChatInput)
        val btnSend = dialogView.findViewById<Button>(R.id.btnChatSend)

        tvPartner.text = getString(R.string.chat_partner_label, partnerLabel, partnerEmail)

        val adapter = ChatMessageAdapter(user.email)
        rvMessages.layoutManager = LinearLayoutManager(this)
        rvMessages.adapter = adapter

        fun loadConversation() {
            tvState.text = getString(R.string.dashboard_loading)
            lifecycleScope.launch {
                try {
                    val messages = RetrofitClient.api.getConversation(user.email, partnerEmail)
                    adapter.submitMessages(messages)
                    if (messages.isEmpty()) {
                        tvState.text = getString(R.string.chat_no_messages)
                    } else {
                        tvState.text = ""
                        rvMessages.scrollToPosition(messages.lastIndex)
                    }
                } catch (_: Exception) {
                    tvState.text = getString(R.string.chat_load_error)
                }
            }
        }

        btnSend.setOnClickListener {
            val content = etInput.text.toString().trim()
            if (content.isBlank()) return@setOnClickListener

            btnSend.isEnabled = false
            lifecycleScope.launch {
                try {
                    RetrofitClient.api.sendMessage(
                        SendMessageRequest(
                            senderEmail = user.email,
                            receiverEmail = partnerEmail,
                            content = content
                        )
                    )
                    etInput.setText("")
                    loadConversation()
                } catch (_: Exception) {
                    Toast.makeText(
                        this@MainActivity,
                        R.string.chat_send_error,
                        Toast.LENGTH_SHORT
                    ).show()
                } finally {
                    btnSend.isEnabled = true
                }
            }
        }

        val dialog = AlertDialog.Builder(this)
            .setTitle(getString(R.string.chat_dialog_title, partnerLabel))
            .setView(dialogView)
            .setNegativeButton(getString(R.string.action_close), null)
            .create()

        dialog.setOnShowListener {
            loadConversation()
        }
        dialog.show()
    }

    private fun updateDashboardHeader() {
        val user = sessionManager.getUserProfile()
        val displayName = user.displayName.ifBlank {
            user.fullName.ifBlank { user.email.ifBlank { getString(R.string.profile_name_fallback) } }
        }
        tvDashboardWelcome.text = getString(R.string.dashboard_welcome, displayName)
    }

    private fun updateProfileSection() {
        val user = sessionManager.getUserProfile()
        val displayName = user.displayName.ifBlank {
            user.fullName.ifBlank { getString(R.string.profile_name_fallback) }
        }
        tvProfileDisplayName.text = displayName
        tvProfileFullName.text = user.fullName.ifBlank { displayName }
        tvProfileEmail.text = user.email
        tvProfileListingCount.text = getString(
            R.string.profile_listing_count,
            allItems.count { isItemOwnedByCurrentUser(it) }
        )
    }

    private fun isItemOwnedByCurrentUser(item: Item): Boolean {
        val user = sessionManager.getUserProfile()
        val sellerEmail = item.sellerEmail?.trim().orEmpty()
        val byEmail = user.email.isNotBlank() &&
            sellerEmail.isNotBlank() &&
            sellerEmail.equals(user.email.trim(), ignoreCase = true)

        val cleanedSellerName = cleanSellerName(item.sellerName)
        val byName = sellerEmail.isBlank() &&
            user.displayName.isNotBlank() &&
            cleanedSellerName.equals(user.displayName.trim(), ignoreCase = true)

        return byEmail || byName
    }

    private fun buildChatContacts(): List<Pair<String, String>> {
        val user = sessionManager.getUserProfile()
        return allItems.mapNotNull { item ->
            val email = item.sellerEmail?.trim().orEmpty()
            if (email.isBlank() || email.equals(user.email, ignoreCase = true)) {
                null
            } else {
                val label = cleanSellerName(item.sellerName).ifBlank { email }
                email to label
            }
        }.distinctBy { it.first }
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

    private fun parseCreatedAt(createdAt: String?): LocalDateTime? {
        if (createdAt.isNullOrBlank()) return null
        val formats = listOf(
            DateTimeFormatter.ISO_DATE_TIME,
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        )
        return formats.firstNotNullOfOrNull { formatter ->
            try {
                LocalDateTime.parse(createdAt, formatter)
            } catch (_: DateTimeParseException) {
                null
            }
        }
    }

    private fun listingAgeLabel(createdAt: String?): String {
        val parsed = parseCreatedAt(createdAt) ?: return "Recently posted"
        val duration = Duration.between(parsed, LocalDateTime.now())
        if (duration.toMinutes() < 1) return "Just now"
        if (duration.toHours() < 1) return "${duration.toMinutes()}m ago"
        if (duration.toDays() < 1) return "${duration.toHours()}h ago"
        if (duration.toDays() < 7) return "${duration.toDays()}d ago"
        return "Posted earlier"
    }

    private fun resolvePrimaryImage(raw: String?): String? {
        val value = raw?.trim().orEmpty()
        if (value.isBlank()) return null

        if (value.startsWith("[")) {
            val cleaned = value.removePrefix("[").removeSuffix("]")
            val first = cleaned.split(",")
                .map { it.trim().trim('"') }
                .firstOrNull { it.isNotBlank() }
            if (!first.isNullOrBlank()) return first
        }

        if (value.contains(",")) {
            return value.split(",")
                .map { it.trim() }
                .firstOrNull { it.isNotBlank() }
        }

        return value
    }

    private fun buildImagePart(uri: Uri?): MultipartBody.Part? {
        if (uri == null) return null
        val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return null
        val requestBody = bytes.toRequestBody("image/*".toMediaType())
        return MultipartBody.Part.createFormData("images", "mobile_image.jpg", requestBody)
    }

    private fun String.toPlainRequestBody() = toRequestBody("text/plain".toMediaType())
}
