<?php
$input = json_decode(file_get_contents('php://input'), true);

$chat_id = $input['chat_id'];
$message = $input['message'];
$sender = $input['sender'];

$pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');

$stmt = $pdo->prepare("INSERT INTO chat_message (chat_id, sender, message) VALUES (?, ?, ?)");
if ($stmt->execute([$chat_id, $sender, $message])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>
