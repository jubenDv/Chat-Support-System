<?php
session_start();
$pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');

$agent_id = $_SESSION['agent_id'];

$stmt = $pdo->prepare("SELECT name FROM agents WHERE agent_id = ?");
$stmt->execute([$agent_id]);
$agent = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode($agent);
?>
