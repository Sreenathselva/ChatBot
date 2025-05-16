<?php
// MySQL credentials
$host = "localhost";
$username = "root";
$password = "";
$database = "chatbot_data";

// require_once __DIR__ . '/db.php';

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Get JSON input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || !isset($data['field'], $data['value'])) {
    echo json_encode(["success" => false, "error" => "Missing field or value"]);
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
$stmt = $conn->prepare("SELECT id FROM users_hybrid WHERE session_id = ?");
$stmt->bind_param("s", $sessionId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Row exists — update the specific field
    $stmt = $conn->prepare("UPDATE users_hybrid SET $field = ? WHERE session_id = ?");
    $stmt->bind_param("ss", $value, $sessionId);
} else {
    // Insert new row
    $stmt = $conn->prepare("INSERT INTO users_hybrid (session_id, $field) VALUES (?, ?)");
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
