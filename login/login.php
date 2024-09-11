<?php
session_start();
$input = json_decode(file_get_contents('php://input'), true);

$email = $input['email'];
$password = $input['password'];

$pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');

$stmt = $pdo->prepare("SELECT * FROM agents WHERE email = ?");
$stmt->execute([$email]);
$agent = $stmt->fetch(PDO::FETCH_ASSOC);

if ($agent && password_verify($password, $agent['password'])) {
    $_SESSION['agent_id'] = $agent['agent_id'];
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>
