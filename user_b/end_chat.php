<?php
// end_chat.php
session_start();
header('Content-Type: application/json');

// Check if the user is authenticated (if needed)
// if (!isset($_SESSION['agent_id'])) {
//     echo json_encode(['success' => false, 'message' => 'Not logged in']);
//     exit();
// }

$input = json_decode(file_get_contents('php://input'), true);
$chat_id = $input['chat_id'] ?? null;

if ($chat_id) {
    // Database connection
    $host = 'localhost';
    $dbname = 'db_pc2go';
    $username = 'root'; // Adjust if needed
    $password = ''; // Adjust if needed

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Update chat status to 'closed'
        $stmt = $pdo->prepare('UPDATE chat_request SET status = "closed" WHERE id = :chat_id');
        $stmt->bindParam(':chat_id', $chat_id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Chat ID is required']);
}
?>
