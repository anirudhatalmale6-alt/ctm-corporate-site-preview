<?php
/* ============================================================================
   Elevate Technology Partners — contact.php
   ----------------------------------------------------------------------------
   Receives the contact form and emails it to Elevate. Plain PHP, no libraries, no
   database — it runs on any standard shared-hosting account (cPanel, Plesk,
   most Australian and UK hosts).

   HOW TO SWITCH IT ON
     1. Change $TO below to the address that should receive enquiries.
     2. Change $FROM to an address on this domain (see the note beside it —
        this matters, it is the difference between "delivered" and "spam").
     3. In contact.html, delete  data-demo="true"  from the <form> tag.
     4. Send yourself one test enquiry and confirm it arrives.

   SECURITY NOTES
     • Every value is re-validated here. Browser validation is a convenience for
       the visitor; it can be bypassed in ten seconds, so it proves nothing.
     • Newlines are stripped from anything that goes into a mail header. That
       closes the classic "header injection" hole that lets a spammer turn your
       contact form into their mail relay.
     • A hidden "website" field is a honeypot: real visitors never see it, bots
       fill it in. Filled = discard, quietly, with a success response so the bot
       does not learn to try again.
     • One submission per IP per 30 seconds, tracked in a temp file.
   ========================================================================== */

declare(strict_types=1);

/* ---- 1. Settings ---------------------------------------------------------- */

$TO         = 'info@etp.net.au';              // where enquiries land
$TO_NAME    = 'Elevate Technology Partners';

/* IMPORTANT: the From address must be ON THIS DOMAIN. If you put the visitor's
   address here, your host is claiming to be their mail server, SPF fails and
   the message goes to junk (or is rejected outright). The visitor's address
   goes in Reply-To instead, so hitting "Reply" still works. */
$FROM       = 'website@elevatetechpartners.com.au';
$FROM_NAME  = 'Elevate Website';

$SUBJECT_PREFIX = '[Website enquiry]';
$THROTTLE_SECONDS = 30;

/* ---- 2. Only accept POST -------------------------------------------------- */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'This endpoint only accepts form submissions.', 405);
}

/* ---- 3. Honeypot ---------------------------------------------------------- */

if (trim((string)($_POST['website'] ?? '')) !== '') {
    // A bot. Tell it everything went fine and do nothing.
    respond(true, 'Thank you — your message has been sent.');
}

/* ---- 4. Throttle ---------------------------------------------------------- */

$ip = preg_replace('/[^0-9a-f:.]/i', '', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$stamp = sys_get_temp_dir() . '/elevate-contact-' . md5((string)$ip);

if (is_file($stamp) && (time() - (int)filemtime($stamp)) < $THROTTLE_SECONDS) {
    respond(false, 'You have just sent us a message. Please give it a moment before sending another.', 429);
}
@touch($stamp);

/* ---- 5. Collect and validate --------------------------------------------- */

$name    = clean($_POST['name']    ?? '');
$company = clean($_POST['company'] ?? '');
$email   = clean($_POST['email']   ?? '');
$phone   = clean($_POST['phone']   ?? '');
$message = trim((string)($_POST['message'] ?? ''));

$errors = [];

if ($name === '')                                  $errors[] = 'your name';
if ($company === '')                               $errors[] = 'your company';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))    $errors[] = 'a valid work email address';
if (mb_strlen($message) < 20)                      $errors[] = 'a message of at least 20 characters';

/* Length caps: stop someone pasting a megabyte into a field. */
if (mb_strlen($name) > 120 || mb_strlen($company) > 160 || mb_strlen($message) > 5000) {
    $errors[] = 'entries within a sensible length';
}

if ($errors) {
    respond(false, 'Please provide ' . human_list($errors) . '.', 422);
}

/* ---- 6. Build the email --------------------------------------------------- */

$subject = sprintf('%s %s', $SUBJECT_PREFIX, $company);

$body = "A new enquiry was submitted on elevatetechpartners.com.au.\n\n"
      . "Name:     {$name}\n"
      . "Company:  {$company}\n"
      . "Email:    {$email}\n"
      . "Phone:    " . ($phone !== '' ? $phone : '—') . "\n"
      . "\n--- Message ---\n\n"
      . $message . "\n\n"
      . "---\n"
      . "Sent: " . date('r') . "\n"
      . "IP:   {$ip}\n";

/* Headers. Every value here has already been through clean(), which removes
   CR and LF — without that, a crafted "name" could inject extra headers. */
$headers = [
    'From: ' . mb_encode_mimeheader($FROM_NAME) . ' <' . $FROM . '>',
    'Reply-To: ' . mb_encode_mimeheader($name) . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: Elevate-Website',
];

$sent = @mail(
    $TO_NAME . ' <' . $TO . '>',
    mb_encode_mimeheader($subject),
    $body,
    implode("\r\n", $headers),
    '-f' . $FROM      // envelope sender — helps SPF line up
);

if (!$sent) {
    /* Do not lose the enquiry just because the mail server had a bad moment.
       Append it to a log next to this file so nothing is silently dropped.
       Keep the log OUTSIDE the public folder if your host allows it. */
    @file_put_contents(__DIR__ . '/enquiries-fallback.log',
        "==== " . date('c') . " ====\n" . $body . "\n", FILE_APPEND | LOCK_EX);

    respond(false, 'We could not send that just now. Please email info@etp.net.au directly and we will pick it up.', 500);
}

respond(true, 'Thank you — your message is on its way. We will be in touch.');

/* ---- 7. Helpers ----------------------------------------------------------- */

/**
 * Trim, collapse whitespace, and strip the CR/LF characters that make mail
 * header injection possible.
 */
function clean($value): string
{
    $value = is_string($value) ? $value : '';
    $value = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $value);
    return trim(preg_replace('/\s+/u', ' ', $value) ?? '');
}

/** "a, b and c" — used to build a readable error message. */
function human_list(array $items): string
{
    if (count($items) === 1) return $items[0];
    $last = array_pop($items);
    return implode(', ', $items) . ' and ' . $last;
}

/**
 * Answers JSON when the form was sent by site.js (fetch), and a plain HTML page
 * when JavaScript is off and the browser submitted normally. Both paths work.
 */
function respond(bool $ok, string $message, int $status = 200): void
{
    http_response_code($status);

    $wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false
        || strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest'
        || stripos($_SERVER['HTTP_SEC_FETCH_MODE'] ?? '', 'cors') !== false;

    if ($wantsJson) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $safe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    header('Content-Type: text/html; charset=UTF-8');
    echo <<<HTML
<!DOCTYPE html>
<html lang="en-AU"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Contact — Elevate Technology Partners</title>
<link rel="stylesheet" href="assets/css/base.css"></head>
<body>
<main class="section"><div class="container" style="max-width:720px">
<h1>{$safe}</h1>
<p><a class="btn btn--ghost" href="contact.html">Back to the contact page</a></p>
</div></main>
</body></html>
HTML;
    exit;
}
