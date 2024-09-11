<?php
$input = json_decode(file_get_contents('php://input'), true);

$name = $input['name'];
$email = $input['email'];

$pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');

$stmt = $pdo->prepare("INSERT INTO chat_request (name, email, status) VALUES (?, ?, 'pending')");
if ($stmt->execute([$name, $email])) {
    echo json_encode(['success' => true, 'chat_id' => $pdo->lastInsertId()]);
} else {
    echo json_encode(['success' => false]);
}
?>
