<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$limit = isset($_GET['limit']) ? max(1, min(12, intval($_GET['limit']))) : 6;
$token = getenv('IG_ACCESS_TOKEN');
$userId = getenv('IG_USER_ID');

if (!$token) {
    http_response_code(501);
    echo json_encode(['error' => 'missing_token', 'message' => 'Set IG_ACCESS_TOKEN env var on server.']);
    exit;
}

$base = 'https://graph.instagram.com';
$path = $userId ? "/$userId/media" : '/me/media';
$query = http_build_query([
    'fields' => 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp',
    'access_token' => $token,
    'limit' => $limit
]);
$url = $base . $path . '?' . $query;

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 12,
    CURLOPT_HTTPHEADER => ['Accept: application/json']
]);
$body = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($body === false) {
    http_response_code(502);
    echo json_encode(['error' => 'upstream_error', 'message' => $err ?: 'Unknown error']);
    exit;
}

http_response_code($http ?: 200);
if ($http >= 200 && $http < 300) {
    header('Cache-Control: public, max-age=120, s-maxage=300');
} else {
    header('Cache-Control: no-store');
}
echo $body;

