<?php
$pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');

$chat_id = $_GET['chat_id'];

$stmt = $pdo->prepare("SELECT sender, message FROM chat_message WHERE chat_id = ?");
$stmt->execute([$chat_id]);
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($messages);
?>
