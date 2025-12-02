<?php
//set credentials
$servername = "localhost";
$username = "436_mysql_user";
$password = "123pwd456";
$dbname = "436db";

//create the connection to the database
$conn = new mysqli($servername, $username, $password, $dbname);
//check db connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>