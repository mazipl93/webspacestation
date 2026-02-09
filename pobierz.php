<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
$url = $_GET['url'];
if (strpos($url, 'https://services.swpc.noaa.gov/') === 0) {
    echo file_get_contents($url);
}
?>