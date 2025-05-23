<?php
require_once __DIR__ . '/db.php';

// MySQL credentials
// $host = "localhost";
// $username = "root";
// $password = "";
// $database = "chatbot_data";

// $conn = new mysqli($host, $username, $password, $database);

header('Content-Type: application/json');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$result = $conn->query("SELECT id, name, email, purpose, phone, jobTitle, company, created_at FROM user_hybrid ORDER BY id DESC");

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);

$conn->close();
?>
