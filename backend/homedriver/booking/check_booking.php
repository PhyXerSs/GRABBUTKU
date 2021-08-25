<?php

$postData = json_decode(file_get_contents("php://input"));
$driver_id = $postData->driver_id;

$sql = "SELECT * FROM `booking` WHERE `booking`.`driver_id` IS NULL ORDER BY `booking`.`booking_id`";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $user_id = $row["user_id"];
    $sql1 = "UPDATE `booking` SET `booking`.`driver_id` = $driver_id WHERE `booking`.`user_id` = $user_id";
    if ($conn->query($sql1) == TRUE) {
        echo json_encode([
            "message" => "update booking table successfully"
        ]);
        $sql2 = "UPDATE `queue` SET `queue`.`status` = 'ready' WHERE `queue`.`driver_id` = $driver_id";
        if ($conn->query($sql2) == TRUE) {
            echo json_encode([
                "message" => "update successfully"
            ]);
        } else {
            echo json_encode([
                "message" => "database not found"
            ]);
        }
    } else {
        echo json_encode([
            "message" => "data not found"
        ]);
    }
}
