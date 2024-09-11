<?php
// Set up database connection
$pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');

// Get the input data
$input = json_decode(file_get_contents('php://input'), true);
$chat_id = intval($input['chat_id'] ?? 0);

// Prepare and execute the query
$stmt = $pdo->prepare("SELECT status FROM chat_request WHERE id = ?");
$stmt->execute([$chat_id]);
$status = $stmt->fetchColumn();

// Set header
header('Content-Type: application/json');

// Return status as a string
echo json_encode(['status' => $status]);
?>
