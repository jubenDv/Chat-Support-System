<?php
session_start();
$input = json_decode(file_get_contents('php://input'), true);

$chat_id = $input['chat_id'];
$agent_id = $_SESSION['agent_id'];

$pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');

$stmt = $pdo->prepare("UPDATE chat_request SET status = 'active', agent_id = ? WHERE id = ?");
if ($stmt->execute([$agent_id, $chat_id])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>
