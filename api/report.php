<?php
/**
 * AP-Tracker Lernkarten Fehler- & Feedback-API
 * 
 * Empfängt Fehlermeldungen zu Lernkarten und sendet sie sicher,
 * DSGVO-konform und datensparsam per E-Mail an info@cwillam.de.
 * Optimiert für IONOS Webhosting Plus (PHP 8.x + sendmail).
 */

header('Content-Type: application/json; charset=utf-8');

// CORS für Tracker-Domains
$allowed_origins = [
    'https://ap1.cwillam.de',
    'https://ap2.cwillam.de',
    'https://ap2-fisi.cwillam.de',
    'https://cwillam.de'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true) || (strpos($origin, 'localhost') !== false) || (strpos($origin, '127.0.0.1') !== false)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Preflight OPTIONS Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Nur POST-Requests verarbeiten
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Nur POST erlaubt.']);
    exit;
}

// JSON-Body auslesen
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ungültiges Datenformat.']);
    exit;
}

// Honeypot-Spamschutz (Feld muss leer sein)
if (!empty($data['hp_check'])) {
    echo json_encode(['success' => true, 'message' => 'Vielen Dank für dein Feedback!']);
    exit;
}

// Pflichtfeld Feedback prüfen
$feedback = trim((string)($data['feedback'] ?? ''));
if (empty($feedback)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Bitte gib eine Fehlerbeschreibung ein.']);
    exit;
}

// Eingabewerte bereinigen
$feedback = function_exists('mb_substr') ? mb_substr($feedback, 0, 2000) : substr($feedback, 0, 2000);
$tracker = strip_tags(trim((string)($data['tracker'] ?? 'AP1 Tracker')));
$topicTitle = strip_tags(trim((string)($data['topicTitle'] ?? 'Thema')));
$topicId = strip_tags(trim((string)($data['topicId'] ?? '-')));
$cardNumber = (int)($data['cardNumber'] ?? 0);
$totalCards = (int)($data['totalCards'] ?? 0);
$cardId = strip_tags(trim((string)($data['cardId'] ?? '-')));
$question = strip_tags(trim((string)($data['question'] ?? '-')));
$answer = strip_tags(trim((string)($data['answer'] ?? '-')));
$timestamp = date('d.m.Y H:i:s');

// Zieladresse
$to = 'info@cwillam.de';

// Betreff (RFC 2047 codiert für Sonderzeichen/Umlaute)
$subject = "[{$tracker}] Fehler: {$topicTitle} ({$cardId})";
$encoded_subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

// Nachrichtentext formatieren
$message = "Hallo Christoph,\n\n"
         . "über das In-App-Meldesystem wurde soeben ein Fehler zu einer Lernkarte eingereicht:\n\n"
         . "==================================================\n"
         . "KARTEN-DETAILS\n"
         . "==================================================\n"
         . "App / Tracker:  {$tracker}\n"
         . "Thema:          {$topicTitle} (ID: {$topicId})\n"
         . "Karte:          #{$cardNumber} von {$totalCards}\n"
         . "Karten-ID:      {$cardId}\n"
         . "Zeitpunkt:      {$timestamp} Uhr\n\n"
         . "FRAGE:\n{$question}\n\n"
         . "ANTWORT:\n{$answer}\n\n"
         . "==================================================\n"
         . "GEMELDETER FEHLER / NUTZER-HINWEIS:\n"
         . "==================================================\n"
         . "{$feedback}\n\n"
         . "==================================================\n"
         . "Gesendet aus der PWA / Web-App (Keine IP gespeichert, lokal im Browser).\n";

// IONOS Mail-Header
$headers = [
    'From: "AP-Tracker" <noreply@cwillam.de>',
    'Reply-To: info@cwillam.de',
    'X-Mailer: PHP/' . phpversion(),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit'
];

$header_str = implode("\r\n", $headers);
$additional_params = '-f noreply@cwillam.de';

// Versand via mail()
$sent = @mail($to, $encoded_subject, $message, $header_str, $additional_params);

if (!$sent) {
    // Fallback ohne additional_params
    $sent = @mail($to, $encoded_subject, $message, $header_str);
}

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Vielen Dank! Dein Hinweis wurde erfolgreich übermittelt.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Konnte E-Mail nicht versenden. Bitte versuche es später erneut.'
    ]);
}
