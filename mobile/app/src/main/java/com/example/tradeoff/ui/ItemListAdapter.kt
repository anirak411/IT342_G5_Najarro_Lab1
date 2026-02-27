package com.example.tradeoff.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import coil.load
import com.example.tradeoff.R
import com.example.tradeoff.model.Item
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.Locale

class ItemListAdapter(
    private val onItemClick: ((Item) -> Unit)? = null
) : RecyclerView.Adapter<ItemListAdapter.ItemViewHolder>() {

    private val items = mutableListOf<Item>()

    fun submitItems(newItems: List<Item>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItemViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_dashboard_listing, parent, false)
        return ItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: ItemViewHolder, position: Int) {
        val item = items[position]
        holder.bind(item)
        holder.itemView.setOnClickListener { onItemClick?.invoke(item) }
    }

    override fun getItemCount(): Int = items.size

    class ItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val ivImage: ImageView = itemView.findViewById(R.id.ivItemImage)
        private val tvTitle: TextView = itemView.findViewById(R.id.tvItemTitle)
        private val tvPrice: TextView = itemView.findViewById(R.id.tvItemPrice)
        private val tvMeta: TextView = itemView.findViewById(R.id.tvItemMeta)
        private val tvDescription: TextView = itemView.findViewById(R.id.tvItemDescription)

        fun bind(item: Item) {
            val title = item.title?.takeIf { it.isNotBlank() }
                ?: itemView.context.getString(R.string.item_unknown_title)
            val category = item.category?.takeIf { it.isNotBlank() }
                ?: itemView.context.getString(R.string.item_unknown_category)
            val condition = item.condition?.takeIf { it.isNotBlank() }
                ?: itemView.context.getString(R.string.item_unknown_condition)
            val ageLabel = getListingAgeLabel(item.createdAt)
            val description = item.description?.takeIf { it.isNotBlank() }
                ?: itemView.context.getString(R.string.item_no_description)

            ivImage.load(resolvePrimaryImage(item.imageUrl)) {
                crossfade(true)
                placeholder(R.drawable.bg_listing_image_placeholder)
                error(R.drawable.bg_listing_image_placeholder)
            }
            tvTitle.text = title
            tvPrice.text = itemView.context.getString(
                R.string.item_price,
                String.format(Locale.US, "%.2f", item.price)
            )
            tvMeta.text = itemView.context.getString(
                R.string.item_meta,
                category,
                condition,
                ageLabel
            )
            tvDescription.text = description
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

        private fun getListingAgeLabel(createdAt: String?): String {
            if (createdAt.isNullOrBlank()) return "Recently posted"

            val formats = listOf(
                DateTimeFormatter.ISO_DATE_TIME,
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            )
            val parsed = formats.firstNotNullOfOrNull { formatter ->
                try {
                    LocalDateTime.parse(createdAt, formatter)
                } catch (_: DateTimeParseException) {
                    null
                }
            } ?: return "Recently posted"

            val duration = Duration.between(parsed, LocalDateTime.now())
            if (duration.toMinutes() < 1) return "Just now"
            if (duration.toHours() < 1) return "${duration.toMinutes()}m ago"
            if (duration.toDays() < 1) return "${duration.toHours()}h ago"
            if (duration.toDays() < 7) return "${duration.toDays()}d ago"
            return "Posted earlier"
        }
    }
}
