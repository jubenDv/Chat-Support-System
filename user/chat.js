document.addEventListener('DOMContentLoaded', function() {
    const chatId = localStorage.getItem('chat_id');
    const chatApproved = localStorage.getItem('is_chat_approved') === 'true';

    // Display stored bot responses
    displayStoredBotResponses();

    if (chatId) {
        toggleChatUI(true);

        if (chatApproved) {
            enableChatControls();
            startFetchingMessages(chatId);
        } else {
            disableChatControls();
            checkStatus(chatId);
        }
    }
});

let fetchInterval = null;
let isChatApproved = false;
let lastMessageId = 0; // Track the last message ID

function requestChat() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    fetch('../user_b/request_chat.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email})
    })
    .then(handleResponse)
    .then(data => {
        if (data.success) {
            localStorage.setItem('chat_id', data.chat_id);
            localStorage.setItem('is_chat_approved', 'false');
            toggleChatUI(true);
            disableChatControls();
            sendBotMessage(data.chat_id, "Chat request successful");
            checkStatus(data.chat_id);
        } else {
            alert('Chat request failed. Try again.');
        }
    });
}

function storeBotResponse(response) {
    const responses = getBotResponses() || [];
    responses.push(response);
    localStorage.setItem('botResponses', JSON.stringify(responses));
}

function getBotResponses() {
    return JSON.parse(localStorage.getItem('botResponses')) || [];
}

function displayStoredBotResponses() {
    const storedBotResponses = getBotResponses();
    storedBotResponses.forEach(displayBotMessage);
}

function getChatId() {
    return localStorage.getItem('chat_id');
}

function sendBotMessage(chatId, botMessage) {
    displayBotMessage(botMessage);
    storeBotResponse(botMessage);
}

function displayBotMessage(botMessage) {
    const notificationElement = document.getElementById('notifications');
    const newNotificationElement = document.createElement('div');
    newNotificationElement.className = 'notification';
    newNotificationElement.textContent = `Bot: ${botMessage}`;
    notificationElement.appendChild(newNotificationElement);
}

function checkStatus(chatId) {
    fetchInterval = setInterval(() => {
        fetch('../user_b/check_status.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({chat_id: chatId})
        })
        .then(handleResponse)
        .then(data => {
            if (data.status === 'active' && !isChatApproved) {
                isChatApproved = true;
                localStorage.setItem('is_chat_approved', 'true');
                clearInterval(fetchInterval);
                sendBotMessage(chatId, "Chat Approved, an Agent will respond shortly.");
                startFetchingMessages(chatId);
                enableChatControls();
            }
        });
    }, 5000);
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    const imageInput = document.getElementById('image');
    const chatId = getChatId();

    // Disable chat controls
    disableChatControls();

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('sender', 'user');

    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Resize the image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxWidth = 800; // Maximum width
                const maxHeight = 800; // Maximum height
                let width = img.width;
                let height = img.height;

                // Calculate the new dimensions
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Convert the canvas to a Blob
                canvas.toBlob(function(blob) {
                    formData.append('image', blob, file.name);
                    if (messageInput.value.trim() !== '') {
                        formData.append('message', messageInput.value);
                    }
                    sendFormData(formData);
                }, file.type);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        if (messageInput.value.trim() !== '') {
            formData.append('message', messageInput.value);
        }
        sendFormData(formData);
    }
}

function sendFormData(formData) {
    fetch('../user_b/send_message.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            document.getElementById('message').value = '';
            document.getElementById('image').value = ''; // Clear the file input
            fetchMessages(getChatId());
        } else {
            alert('Message sending failed: ' + (data.error || 'Try again.'));
        }
    })
    .catch(error => {
        alert('Message sending failed: ' + error.message);
    })
    .finally(() => {
        // Re-enable chat controls
        enableChatControls();
    });
}

function fetchMessages(chatId) {
    fetch('../user_b/get_messages.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chat_id: chatId, last_message_id: lastMessageId})
    })
    .then(handleResponse)
    .then(data => {
        const messagesDiv = document.getElementById('messages');
        data.forEach(msg => {
            const messageElement = document.createElement('p');
            
            if (msg.image) {
                // Create a container for the image and label
                const imageContainer = document.createElement('div');
                
                // Create and set up the label for the image
                const imageLabel = document.createElement('span');
                imageLabel.textContent = `${msg.sender}:`;
                
                // Create and set up the image element
                const img = document.createElement('img');
                img.src = msg.image; // Use base64 data URL
                img.alt = 'Image';
                img.style.maxWidth = '100%'; // Adjust as needed
                img.style.height = 'auto';

                // Append label and image to the container
                imageContainer.appendChild(imageLabel);
                imageContainer.appendChild(img);
                
                // Append the container to the message element
                messageElement.appendChild(imageContainer);
            } else {
                // Display text message
                messageElement.textContent = `${msg.sender}: ${msg.message}`;
            }

            messagesDiv.appendChild(messageElement);
            lastMessageId = Math.max(lastMessageId, msg.id); // Update lastMessageId
        });
        // Ensure the scroll is at the bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}




function startFetchingMessages(chatId) {
    fetchMessages(chatId);
    fetchInterval = setInterval(() => fetchMessages(chatId), 5000);
}

function endChat() {
    const chatId = getChatId();
    if (chatId) {
        fetch('../user_b/end_chat.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({chat_id: chatId})
        })
        .then(handleResponse)
        .then(data => {
            if (data.success) {
                localStorage.removeItem('chat_id');
                localStorage.removeItem('is_chat_approved');
                localStorage.removeItem('botResponses');
                toggleChatUI(false);
                document.getElementById('messages').innerHTML = '';
                document.getElementById('message').value = '';
                disableChatControls();
                if (fetchInterval) {
                    clearInterval(fetchInterval);
                    fetchInterval = null;
                }
                isChatApproved = false;
                document.querySelectorAll('.notification').forEach(element => element.remove());
            } else {
                alert('Ending chat failed. Try again.');
            }
        });
    }
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

function toggleChatUI(isChatActive) {
    document.getElementById('chat-request-form').style.display = isChatActive ? 'none' : 'block';
    document.getElementById('chat-window').style.display = isChatActive ? 'block' : 'none';
}

function disableChatControls() {
    document.getElementById('message').disabled = true;
    document.getElementById('send-message-button').disabled = true;
    document.getElementById('image').disabled = true;
}

function enableChatControls() {
    document.getElementById('message').disabled = false;
    document.getElementById('send-message-button').disabled = false;
    document.getElementById('image').disabled = false;
}

