<?php
// Database connection code
$con = mysqli_connect('localhost', 'root', '', 'outlookrecengine');

// Check if the connection was successful
if (!$con) {
    die('Could not connect to the database: ' . mysqli_error());
}

// Get the post records
$name = $_POST['orgName'];
$address = $_POST['orgAddress'];
$phone = $_POST['orgPhone'];
$email = $_POST['orgEmail'];
$domain = $_POST['orgDomain'];

// Generate a unique 6-digit alphanumeric key
function generateUniqueKey() {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $keyLength = 6;
    $key = '';

    for ($i = 0; $i < $keyLength; $i++) {
        $randomIndex = rand(0, strlen($characters) - 1);
        $key .= $characters[$randomIndex];
    }

    return $key;
}

// Usage example
$orgKey = generateUniqueKey();

// Database insert SQL code
$sql = "INSERT INTO `organizations` (`orgKey`, `name`, `address`, `phone`, `email_id`, `orgDomain`) VALUES ('$orgKey', '$name', '$address', '$phone', '$email', '$domain')";

// Insert into the database
$rs = mysqli_query($con, $sql);

if ($rs) {
    echo "Organization record inserted successfully";
} else {
    echo "Error: " . mysqli_error($con);
}

// Close the database connection
mysqli_close($con);
?>
