<?php
$input = json_decode(file_get_contents('php://input'), true);

$name = $input['name'];
$email = $input['email'];
$password = password_hash($input['password'], PASSWORD_DEFAULT);

$pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');

$stmt = $pdo->prepare("INSERT INTO agents (name, email, password) VALUES (?, ?, ?)");
if ($stmt->execute([$name, $email, $password])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>
