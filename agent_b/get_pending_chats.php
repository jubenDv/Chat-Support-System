<?php
$pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');

$stmt = $pdo->query("SELECT id, name, email, timestamp FROM chat_request WHERE status = 'pending'");
$chats = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($chats);
?>
