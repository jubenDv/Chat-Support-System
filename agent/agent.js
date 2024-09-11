document.addEventListener('DOMContentLoaded', function() {
    // Prevent browser back button after logout
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function() {
        window.history.go(1);
    };

    checkSession();
    loadAgentInfo();
    loadPendingChats();
    loadActiveChats();

    // Set refresh interval for updating pending and active chats
    setInterval(() => {
        loadPendingChats();
        loadActiveChats();
    }, 5000); // Refresh every 5 seconds
});

function checkSession() {
    fetch('../agent_b/check_session.php')
    .then(response => response.json())
    .then(data => {
        if (!data.logged_in) {
            window.location.href = '../login/login.html';
        }
    });
}

function loadAgentInfo() {
    fetch('../agent_b/agent_info.php')
    .then(response => response.json())
    .then(data => {
        document.getElementById('agent-name').textContent = data.name;
    });
}

function loadPendingChats() {
    fetch('../agent_b/get_pending_chats.php')
    .then(response => response.json())
    .then(data => {
        let pendingChatsDiv = document.getElementById('pending-chats');
        pendingChatsDiv.innerHTML = '';
        data.forEach(chat => {
            pendingChatsDiv.innerHTML += `
                <div>
                    <p>Name: ${chat.name}</p>
                    <p>Email: ${chat.email}</p>
                    <p>Requested at: ${chat.timestamp}</p>
                    <button onclick="acceptChat(${chat.id})">Accept</button>
                </div>`;
        });
    });
}

function loadActiveChats() {
    fetch('../agent_b/get_active_chats.php')
    .then(response => response.json())
    .then(data => {
        let activeChatsDiv = document.getElementById('active-chats');
        activeChatsDiv.innerHTML = '';
        data.forEach(chat => {
            activeChatsDiv.innerHTML += `
                <div>
                    <p>Name: ${chat.name}</p>
                    <p>Email: ${chat.email}</p>
                    <button onclick="openChat(${chat.id}, '${chat.name}', '${chat.email}')">Open Chat</button>
                    <button onclick="endChat(${chat.id})">End Chat</button>
                </div>`;
        });
    });
}

function acceptChat(chatId) {
    fetch('../agent_b/accept_chat.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chat_id: chatId})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadPendingChats();
            loadActiveChats();
        } else {
            alert('Failed to accept chat. Try again.');
        }
    });
}

function openChat(chatId, userName, userEmail) {
    document.getElementById('chat-box').style.display = 'block';
    document.getElementById('user-info').textContent = `${userName} (${userEmail})`;
    localStorage.setItem('current_chat_id', chatId);
    loadMessages(chatId);
}

function loadMessages(chatId) {
    fetch('../agent_b/get_messages.php?chat_id=' + chatId)
    .then(response => response.json())
    .then(data => {
        let messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        data.forEach(msg => {
            messagesDiv.innerHTML += `<p>${msg.sender}: ${msg.message}</p>`;
        });
    });
}

function sendMessage() {
    var message = document.getElementById('message').value;
    var chatId = localStorage.getItem('current_chat_id');

    fetch('../agent_b/send_message.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chat_id: chatId, message: message, sender: 'agent'})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('messages').innerHTML += '<p>agent: ' + message + '</p>';
            document.getElementById('message').value = '';
        } else {
            alert('Message sending failed. Try again.');
        }
    });
}

function endChat(chatId) {
    fetch('../agent_b/end_chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('chat-box').style.display = 'none';
            localStorage.removeItem('current_chat_id');
            loadActiveChats();
        } else {
            alert('Failed to end chat. Try again.');
        }
    });
}

function logout() {
    fetch('../agent_b/logout.php')
    .then(() => {
        // Refresh the page to ensure logout
        window.location.reload(true);
    });
}
