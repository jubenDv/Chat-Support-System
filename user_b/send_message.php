<?php
header('Content-Type: application/json');

// Initialize response
$response = ['success' => false];

try {
    // Database connection
    $pdo = new PDO('mysql:host=localhost;dbname=db_pc2go', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if chat_id and sender are set
    if (!isset($_POST['chat_id']) || !isset($_POST['sender'])) {
        throw new Exception('Chat ID or sender not provided.');
    }

    $chat_id = $_POST['chat_id'];
    $sender = $_POST['sender'];

    // Check for image and message
    $hasImage = isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK;
    $hasMessage = isset($_POST['message']) && !empty($_POST['message']);
    
    // Initialize image and message variables
    $imageName = null;
    $message = null;

    if ($hasImage) {
        $image = $_FILES['image']['tmp_name'];
        $imageName = basename($_FILES['image']['name']);
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/pc2go/uploads/';
        $uploadFile = $uploadDir . $imageName;

        // Validate image file type and size
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB

        if (!in_array($_FILES['image']['type'], $allowedMimeTypes)) {
            throw new Exception('Invalid image type.');
        }

        if ($_FILES['image']['size'] > $maxFileSize) {
            throw new Exception('Image file size exceeds limit.');
        }

        // Move the uploaded file
        if (!move_uploaded_file($image, $uploadFile)) {
            throw new Exception('Image upload failed.');
        }
    }

    if ($hasMessage) {
        $message = $_POST['message'];
    }

    // Insert text message if provided
    if ($hasMessage) {
        $stmt = $pdo->prepare("INSERT INTO chat_message (chat_id, sender, message) VALUES (?, ?, ?)");
        if (!$stmt->execute([$chat_id, $sender, $message])) {
            $response['error'] = 'Database insert failed for message.';
            echo json_encode($response);
            exit;
        }
    }

    // Insert image if provided
    if ($hasImage) {
        $stmt = $pdo->prepare("INSERT INTO chat_message (chat_id, sender, image) VALUES (?, ?, ?)");
        if (!$stmt->execute([$chat_id, $sender, $imageName])) {
            $response['error'] = 'Database insert failed for image.';
            echo json_encode($response);
            exit;
        }
    }

    $response['success'] = true;
} catch (Exception $e) {
    $response['error'] = 'An error occurred: ' . $e->getMessage();
}

// Output JSON response
echo json_encode($response);
?>
