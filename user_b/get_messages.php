<?php
$mysqli = new mysqli('localhost', 'root', '', 'db_pc2go');

if ($mysqli->connect_error) {
    die('Connection failed: ' . $mysqli->connect_error);
}

// Get the chat_id and last_message_id from the input
$input = json_decode(file_get_contents('php://input'), true);
$chat_id = intval($input['chat_id'] ?? 0);
$last_message_id = intval($input['last_message_id'] ?? 0);

// Prepare the SQL query to fetch messages with IDs greater than the last_message_id
$sql = "SELECT id, sender, message, image FROM chat_message WHERE chat_id = ? AND id > ? ORDER BY id ASC";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param('ii', $chat_id, $last_message_id);
$stmt->execute();
$result = $stmt->get_result();

// Fetch messages and return them as JSON
$messages = [];
while ($row = $result->fetch_assoc()) {
    // For image, convert to base64 if needed
    if ($row['image']) {
        $imagePath = $_SERVER['DOCUMENT_ROOT'] . '/pc2go/uploads/' . $row['image'];
        if (file_exists($imagePath)) {
            $imageData = base64_encode(file_get_contents($imagePath));
            $row['image'] = 'data:image/' . pathinfo($row['image'], PATHINFO_EXTENSION) . ';base64,' . $imageData;
        } else {
            $row['image'] = null;
        }
    }
    $messages[] = $row;
}

header('Content-Type: application/json');
echo json_encode($messages);

$mysqli->close();
?>
