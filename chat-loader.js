// Self-executing function to avoid polluting the global scope
(() => {
    // --- Configuration ---
    // IMPORTANT: Replace these with your actual URLs
    const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/ddfb6cfb-539b-45c9-bcb9-dc12188b50fe';
    const CSS_URL = 'https://cdn.jsdelivr.net/gh/github.com/aritra404/miso_chatbot/chatbot.css';

    // A unique ID for the conversation session
    const conversationId = `web-chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // --- 1. Inject CSS into the page ---
    const styleSheet = document.createElement('link');
    styleSheet.href = CSS_URL;
    styleSheet.rel = 'stylesheet';
    styleSheet.type = 'text/css';
    document.head.appendChild(styleSheet);

    // --- 2. Inject Chatbot HTML into the page ---
    const chatbotHTML = `
        <div class="chatbot-container">
            <div class="chat-toggle" id="chatToggle">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.35L2 22l5.65-1.05C9.96 21.64 11.46 22 13 22h7c1.1 0 2-.9 2-2V12c0-5.52-4.48-10-10-10zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <div class="chat-widget" id="chatWidget">
                <div class="chat-header">
                    <div class="chat-avatar">S</div>
                    <div class="chat-info"><h4>sonia</h4><p>ur jewelry bestie ✨</p></div>
                    <div class="online-status"><div class="online-indicator"></div>online</div>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="message bot"><div class="message-bubble">hey there! welcome to MISO 💎 i'm sonia and i'm obsessed with helping you find jewelry that actually slaps. what vibe are we going for today?</div></div>
                    <div class="quick-actions" id="quickActionsContainer">
                        <div class="quick-action" data-message="show me something edgy">edgy vibes</div>
                        <div class="quick-action" data-message="silver chains pls">silver chains</div>
                        <div class="quick-action" data-message="minimalist earrings">minimal earrings</div>
                        <div class="quick-action" data-message="where is my order">track order</div>
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" class="input-field" placeholder="type something..." id="messageInput">
                    <button class="send-button" id="sendButton"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
                </div>
            </div>
        </div>
    `;
    document.body.innerHTML += chatbotHTML;
    
    // --- 3. Add all the Chatbot Logic ---
    // We wait for the DOM to be ready before selecting elements
    document.addEventListener('DOMContentLoaded', () => {
        const chatToggle = document.getElementById('chatToggle');
        const chatWidget = document.getElementById('chatWidget');
        const chatMessages = document.getElementById('chatMessages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const quickActionsContainer = document.getElementById('quickActionsContainer');

        chatToggle.addEventListener('click', () => {
            chatToggle.classList.toggle('active');
            chatWidget.classList.toggle('active');
        });

        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') sendMessage();
        });

        // Event delegation for quick actions
        quickActionsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('quick-action')) {
                const message = event.target.getAttribute('data-message');
                sendQuickMessage(message);
            }
        });

        const sendQuickMessage = (message) => {
            messageInput.value = message;
            sendMessage();
        };

        const sendMessage = async () => {
            const messageText = messageInput.value.trim();
            if (messageText === '') return;
            displayUserMessage(messageText);
            messageInput.value = '';
            showTypingIndicator();
            quickActionsContainer.style.display = 'none'; // Hide quick actions after first message

            try {
                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: messageText, sessionId: conversationId }),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const botReply = data.reply || "Sorry, something went wrong.";
                removeTypingIndicator();
                displayBotMessage(botReply);
            } catch (error) {
                console.error('Error:', error);
                removeTypingIndicator();
                displayBotMessage("Oops! I can't connect right now. Please try again later.");
            }
        };

        const displayUserMessage = (message) => {
            const msgHtml = `<div class="message user"><div class="message-bubble">${message}</div></div>`;
            chatMessages.innerHTML += msgHtml;
            scrollToBottom();
        };

        const displayBotMessage = (message) => {
            const msgHtml = `<div class="message bot"><div class="message-bubble">${message}</div></div>`;
            chatMessages.innerHTML += msgHtml;
            scrollToBottom();
        };

        const showTypingIndicator = () => {
            const typingHtml = `<div class="message bot" id="typing-indicator"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
            chatMessages.innerHTML += typingHtml;
            scrollToBottom();
        };

        const removeTypingIndicator = () => {
            document.getElementById('typing-indicator')?.remove();
        };

        const scrollToBottom = () => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };
    });
})();