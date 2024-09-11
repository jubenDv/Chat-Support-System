<?php
session_start();
$pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');

$agent_id = $_SESSION['agent_id'];

$stmt = $pdo->prepare("SELECT id, name, email FROM chat_request WHERE status = 'active' AND agent_id = ?");
$stmt->execute([$agent_id]);
$chats = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($chats);
?>
