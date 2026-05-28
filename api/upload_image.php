<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

if (!isset($_FILES["image"]) || $_FILES["image"]["error"] !== UPLOAD_ERR_OK) {
    echo json_encode(["status" => "error", "message" => "No image uploaded or upload error"]);
    exit();
}

$file      = $_FILES["image"];
$maxSize   = 5 * 1024 * 1024; // 5MB
$allowed   = ["image/jpeg", "image/png", "image/gif", "image/webp"];
$finfo     = finfo_open(FILEINFO_MIME_TYPE);
$mimeType  = finfo_file($finfo, $file["tmp_name"]);
finfo_close($finfo);

if ($file["size"] > $maxSize) {
    echo json_encode(["status" => "error", "message" => "Image too large. Max 5MB."]);
    exit();
}

if (!in_array($mimeType, $allowed)) {
    echo json_encode(["status" => "error", "message" => "Invalid file type. Use JPG, PNG, GIF or WEBP."]);
    exit();
}

$ext      = pathinfo($file["name"], PATHINFO_EXTENSION);
$filename = uniqid("img_", true) . "." . strtolower($ext);
$uploadDir = __DIR__ . "/../uploads/";
$destPath  = $uploadDir . $filename;

if (!move_uploaded_file($file["tmp_name"], $destPath)) {
    echo json_encode(["status" => "error", "message" => "Failed to save image"]);
    exit();
}

// Return the public URL
$imageUrl = "http://" . $_SERVER["HTTP_HOST"] . "/unibites/uploads/" . $filename;

echo json_encode([
    "status"    => "success",
    "image_url" => $imageUrl
]);
?>
