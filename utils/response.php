<?php

function sendResponse(int $status, string $message, $data = null): void {
    http_response_code($status);
    header('Content-Type: application/json');
    $response = ['status' => $status, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}
