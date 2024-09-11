<?php
// end_chat.php

session_start();
if (!isset($_SESSION['agent_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $chat_id = $data['chat_id'];

    // Database connection
    $db = new mysqli('localhost', 'root', '', 'db_pc2go');

    // Check for connection errors
    if ($db->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit();
    }

    // Update chat status to 'closed'
    $stmt = $db->prepare("UPDATE chat_request SET status = 'closed' WHERE id = ? AND agent_id = ?");
    $stmt->bind_param('ii', $chat_id, $_SESSION['agent_id']);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to close chat']);
    }

    $stmt->close();
    $db->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
