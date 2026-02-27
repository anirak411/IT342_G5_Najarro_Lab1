package com.example.tradeoff.ui

import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.tradeoff.R
import com.example.tradeoff.model.ChatMessage

class ChatMessageAdapter(
    private val currentUserEmail: String
) : RecyclerView.Adapter<ChatMessageAdapter.ChatViewHolder>() {

    private val messages = mutableListOf<ChatMessage>()

    fun submitMessages(newMessages: List<ChatMessage>) {
        messages.clear()
        messages.addAll(newMessages)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_chat_message, parent, false)
        return ChatViewHolder(view)
    }

    override fun onBindViewHolder(holder: ChatViewHolder, position: Int) {
        holder.bind(messages[position], currentUserEmail)
    }

    override fun getItemCount(): Int = messages.size

    class ChatViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val row: LinearLayout = itemView.findViewById(R.id.layoutChatRow)
        private val message: TextView = itemView.findViewById(R.id.tvChatMessage)

        fun bind(chat: ChatMessage, userEmail: String) {
            val mine = chat.senderEmail.equals(userEmail, ignoreCase = true)
            row.gravity = if (mine) Gravity.END else Gravity.START
            message.background = itemView.context.getDrawable(
                if (mine) R.drawable.bg_chat_bubble_mine else R.drawable.bg_chat_bubble_theirs
            )
            message.setTextColor(
                itemView.context.getColor(
                    if (mine) android.R.color.white else R.color.text_main
                )
            )
            message.text = chat.content
        }
    }
}
