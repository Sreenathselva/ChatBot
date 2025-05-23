<?php
// MySQL credentials
// $host = "localhost";
// $username = "root";
// $password = "";
// $database = "chatbot_data";

set_exception_handler(function ($e) {
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
    exit;
});

require_once __DIR__ . '/db.php';

// $conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Get JSON input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "error" => "Invalid JSON input"]);
    exit;
}

if (!$data || !isset($data['field'], $data['value']) || trim($data['value']) === '') {
    echo json_encode(["success" => false, "error" => "Missing or empty field/value"]);
    exit;
}


$field = $data['field'];
$value = $data['value'];
$sessionId = $data['sessionId'] ?? $_SERVER['REMOTE_ADDR'];

$allowedFields = ['name', 'email', 'purpose', 'jobTitle', 'company','phone'];
if (!in_array($field, $allowedFields)) {
    echo json_encode(["success" => false, "error" => "Invalid field"]);
    exit;
}

// Check if session exists
$stmt = $conn->prepare("SELECT id FROM user_hybrid WHERE session_id = ?");
$stmt->bind_param("s", $sessionId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Row exists — update
    $stmt = $conn->prepare("UPDATE user_hybrid SET $field = ? WHERE session_id = ?");
    $stmt->bind_param("ss", $value, $sessionId);
} else {
    // Insert with all fields as NULL except the current one
    $columns = implode(", ", array_fill(0, count($allowedFields), "?"));
    $placeholders = implode(", ", array_fill(0, count($allowedFields), ""));
    $stmt = $conn->prepare("INSERT INTO user_hybrid (session_id, $field) VALUES (?, ?)");
    $stmt->bind_param("ss", $sessionId, $value);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "field" => $field, "value" => $value]);
} else {
    echo json_encode([
        "success" => false,
        "field" => $field,
        "value" => $value,
        "error" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
