<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once __DIR__ . "/../repositories/UserRepository.php";

try {
    $type = $_GET['type'] ?? 'all';

    if ($type === 'cafes') {
        // Return cafes with order analytics
        $cafes = getCafeOrderStats();
        echo json_encode(["success" => true, "data" => $cafes]);

    } elseif ($type === 'students') {
        $all = getAllUsers();
        $students = array_values(array_filter($all, fn($u) => $u['role'] === 'student'));
        echo json_encode(["success" => true, "data" => $students]);

    } elseif ($type === 'blocked') {
        $all = getAllUsers();
        $blocked = array_values(array_filter($all, fn($u) => $u['status'] === 'blocked'));
        echo json_encode(["success" => true, "data" => $blocked]);

    } elseif ($type === 'pending') {
        $all = getAllUsers();
        $pending = array_values(array_filter($all, fn($u) => $u['status'] === 'pending'));
        echo json_encode(["success" => true, "data" => $pending]);

    } elseif ($type === 'stats') {
        // Summary counts for the dashboard
        $all      = getAllUsers();
        $cafes    = getCafeOrderStats();

        $totalStudents  = count(array_filter($all, fn($u) => $u['role'] === 'student'));
        $totalCafes     = count(array_filter($all, fn($u) => $u['role'] === 'cafe'));
        $pendingCafes   = count(array_filter($all, fn($u) => $u['role'] === 'cafe' && $u['status'] === 'pending'));
        $blockedUsers   = count(array_filter($all, fn($u) => $u['status'] === 'blocked'));
        $approvedCafes  = count(array_filter($all, fn($u) => $u['role'] === 'cafe' && $u['status'] === 'approved'));

        echo json_encode([
            "success" => true,
            "data"    => [
                "total_students"  => $totalStudents,
                "total_cafes"     => $totalCafes,
                "pending_cafes"   => $pendingCafes,
                "approved_cafes"  => $approvedCafes,
                "blocked_users"   => $blockedUsers,
            ]
        ]);

    } else {
        $all = getAllUsers();
        echo json_encode(["success" => true, "data" => $all]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
