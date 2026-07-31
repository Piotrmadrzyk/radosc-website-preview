/**
 * PM GROWTH LAB — odbiór raportu uzupełniającego.
 *
 * Funkcja serverless (Vercel, runtime Node.js). Przyjmuje odpowiedzi
 * z formularza /pm-growth-lab/uzupelnienie/ i wysyła je jako wiadomość
 * e-mail przez Resend.
 *
 * Wymagane zmienne środowiskowe:
 *   RESEND_API_KEY          — klucz API Resend
 *   REPORT_RECIPIENT_EMAIL  — adres odbiorcy raportu (nie trafia do przeglądarki)
 *   REPORT_FROM_EMAIL       — adres nadawcy zweryfikowany w Resend
 * Opcjonalnie:
 *   ALLOWED_ORIGINS         — dodatkowe originy, po przecinku (np. na testy)
 *
 * Zasady:
 *   - wyłącznie POST,
 *   - origin z listy dozwolonych,
 *   - limit rozmiaru zgłoszenia,
 *   - walidacja struktury i pusta treść odrzucana,
 *   - honeypot przeciwko botom,
 *   - każdy tekst escapowany przed wstawieniem do HTML,
 *   - treść odpowiedzi nigdy nie trafia do logów,
 *   - adres odbiorcy nigdy nie wraca w odpowiedzi HTTP.
 */

'use strict';

const FORM_ID = 'pm-growth-lab-followup-v1';
const MAX_BYTES = 300 * 1024;
const MAX_SECTIONS = 30;
const MAX_ITEMS = 400;
const LIMITS = { question: 600, answer: 6000, other: 6000, comment: 6000, title: 200 };

const DEFAULT_ORIGINS = [
  'https://piotrmadrzyk.github.io'
];

/* ------------------------------------------------------------------ pomocnicze */

function allowedOrigins() {
  const extra = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return DEFAULT_ORIGINS.concat(extra);
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

function send(res, status, headers, payload) {
  res.statusCode = status;
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

/** Zamienia znaki sterujące i encje HTML. Używane przy KAŻDYM tekście od klienta. */
function esc(value, max) {
  let s = typeof value === 'string' ? value : value === 0 || value ? String(value) : '';
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (typeof max === 'number' && s.length > max) s = s.slice(0, max) + '…';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Czysty tekst — bez encji, ale bez znaków sterujących i w limicie długości. */
function plain(value, max) {
  let s = typeof value === 'string' ? value : value === 0 || value ? String(value) : '';
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (typeof max === 'number' && s.length > max) s = s.slice(0, max) + '…';
  return s;
}

function nl2br(escaped) {
  return escaped.replace(/\r?\n/g, '<br>');
}

function stamp(iso) {
  const d = iso ? new Date(iso) : new Date();
  const date = isNaN(d.getTime()) ? new Date() : d;
  try {
    return new Intl.DateTimeFormat('pl-PL', {
      timeZone: 'Europe/Warsaw',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  } catch (e) {
    return date.toISOString().replace('T', ', ').slice(0, 16);
  }
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      if (Buffer.byteLength(req.body, 'utf8') > MAX_BYTES) return { tooLarge: true };
      try { return { data: JSON.parse(req.body) }; } catch (e) { return { invalid: true }; }
    }
    if (typeof req.body === 'object') return { data: req.body };
  }
  return await new Promise((resolve) => {
    let size = 0;
    const chunks = [];
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BYTES) {
        /* przestajemy zbierać dane, ale nie zrywamy połączenia —
           klient musi dostać czytelną odpowiedź 413, a nie błąd sieci */
        chunks.length = 0;
        finish({ tooLarge: true });
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw.trim()) return finish({ invalid: true });
      try { finish({ data: JSON.parse(raw) }); } catch (e) { finish({ invalid: true }); }
    });
    req.on('error', () => finish({ invalid: true }));
  });
}

/* ------------------------------------------------------------------ walidacja */

function validate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'invalid_payload';
  if (data.formId !== FORM_ID) return 'unknown_form';
  if (data.consent !== true) return 'consent_required';
  if (!Array.isArray(data.sections) || !data.sections.length) return 'empty_payload';
  if (data.sections.length > MAX_SECTIONS) return 'too_many_sections';

  let items = 0;
  let answered = 0;
  for (const section of data.sections) {
    if (!section || typeof section !== 'object' || !Array.isArray(section.items)) return 'invalid_payload';
    for (const item of section.items) {
      if (!item || typeof item !== 'object') return 'invalid_payload';
      if (typeof item.question !== 'string' || !item.question.trim()) return 'invalid_payload';
      items++;
      if (items > MAX_ITEMS) return 'too_many_items';
      const filled = [item.answer, item.other, item.comment]
        .some((v) => typeof v === 'string' && v.trim() !== '');
      if (filled) answered++;
    }
  }
  if (!items) return 'empty_payload';
  if (!answered) return 'no_answers';
  return null;
}

/* --------------------------------------------------------------- budowa raportu */

const C = {
  navy: '#070C1A', ink: '#0E1728', soft: '#46536B', mute: '#6B7A93',
  line: '#E3E9F2', surface: '#F5F8FC', accent: '#0A8FBF', accentSoft: '#E6F7FA'
};

function buildHtml(data) {
  const when = stamp(data.submittedAt);
  const pct = Number.isFinite(Number(data.completion)) ? Math.max(0, Math.min(100, Math.round(Number(data.completion)))) : 0;
  const id = esc(data.submissionId, 64) || '—';
  const missing = [];
  const parts = [];

  data.sections.forEach((section) => {
    const rows = [];
    section.items.forEach((item) => {
      const answer = plain(item.answer, LIMITS.answer).trim();
      const other = plain(item.other, LIMITS.other).trim();
      const comment = plain(item.comment, LIMITS.comment).trim();
      const num = Number.isFinite(Number(item.n)) ? Number(item.n) : null;
      const label = (num ? num + '. ' : '') + plain(item.question, LIMITS.question);

      if (!answer && !other && !comment) { missing.push(label); return; }

      let body = '';
      if (answer) {
        body += '<div style="margin:0 0 6px;font-size:15px;line-height:1.55;color:' + C.ink + ';">' +
          nl2br(esc(answer, LIMITS.answer)) + '</div>';
      }
      if (other) {
        body += '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 0;">' +
          '<tr><td style="border-left:3px solid ' + C.accent + ';background:' + C.accentSoft + ';padding:10px 14px;border-radius:0 8px 8px 0;">' +
          '<div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:' + C.accent + ';font-weight:700;margin-bottom:4px;">Własna odpowiedź</div>' +
          '<div style="font-size:15px;line-height:1.55;color:' + C.ink + ';">' + nl2br(esc(other, LIMITS.other)) + '</div>' +
          '</td></tr></table>';
      }
      if (comment) {
        body += '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 0;">' +
          '<tr><td style="border-left:3px solid #C9B27A;background:#FDF8EE;padding:10px 14px;border-radius:0 8px 8px 0;">' +
          '<div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9A7A2E;font-weight:700;margin-bottom:4px;">Komentarz Michała</div>' +
          '<div style="font-size:15px;line-height:1.55;color:' + C.ink + ';">' + nl2br(esc(comment, LIMITS.comment)) + '</div>' +
          '</td></tr></table>';
      }

      rows.push(
        '<tr><td style="padding:16px 0;border-top:1px solid ' + C.line + ';">' +
        '<div style="font-size:13.5px;line-height:1.5;color:' + C.mute + ';margin:0 0 8px;">' +
        (num ? '<b style="color:' + C.accent + ';">' + num + '.</b> ' : '') +
        esc(plain(item.question, LIMITS.question)) + '</div>' + body +
        '</td></tr>'
      );
    });

    if (!rows.length) return;
    parts.push(
      '<tr><td style="padding:26px 0 0;">' +
      '<div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:' + C.accent + ';font-weight:700;">' +
      'Sekcja ' + esc(section.n, 8) + ' — ' + esc(plain(section.title, LIMITS.title)) + '</div>' +
      '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:6px;">' +
      rows.join('') + '</table></td></tr>'
    );
  });

  const missingBlock = missing.length
    ? '<tr><td style="padding:26px 0 0;">' +
      '<div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:' + C.mute + ';font-weight:700;">' +
      'Pytania bez odpowiedzi (' + missing.length + ')</div>' +
      '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:8px;background:' + C.surface +
      ';border:1px solid ' + C.line + ';border-radius:10px;"><tr><td style="padding:14px 16px;">' +
      missing.map((m) => '<div style="font-size:14px;line-height:1.5;color:' + C.soft + ';margin:0 0 5px;">· ' + esc(m) + '</div>').join('') +
      '</td></tr></table></td></tr>'
    : '';

  return '<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Raport uzupełniający — PM Growth Lab</title></head>' +
    '<body style="margin:0;padding:0;background:#EEF2F8;">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Raport uzupełniający — Michał Elżbieciak — uzupełnienie ' + pct + '%</div>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#EEF2F8;padding:24px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="640" style="width:100%;max-width:640px;background:#FFFFFF;border-radius:16px;overflow:hidden;font-family:-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">' +

    '<tr><td style="background:' + C.navy + ';padding:28px 30px;">' +
    '<div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">' +
    '<b style="letter-spacing:.12em;">PM</b> GROWTH LAB</div>' +
    '<div style="font-size:12px;color:#9DAFC9;letter-spacing:.06em;margin-top:4px;">Strategia. Technologia. Wzrost.</div>' +
    '<div style="height:2px;background:#34E0E8;width:54px;margin:16px 0 14px;"></div>' +
    '<div style="font-size:22px;font-weight:700;color:#FFFFFF;line-height:1.25;">RAPORT UZUPEŁNIAJĄCY</div>' +
    '<div style="font-size:16px;color:#EAF1FF;margin-top:2px;">MICHAŁ ELŻBIECIAK</div>' +
    '</td></tr>' +

    '<tr><td style="padding:20px 30px;background:' + C.surface + ';border-bottom:1px solid ' + C.line + ';">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%">' +
    '<tr><td style="font-size:14px;color:' + C.soft + ';padding:3px 0;"><b style="color:' + C.ink + ';">Data przesłania:</b> ' + esc(when) + '</td></tr>' +
    '<tr><td style="font-size:14px;color:' + C.soft + ';padding:3px 0;"><b style="color:' + C.ink + ';">Poziom uzupełnienia:</b> ' + pct + '%</td></tr>' +
    '<tr><td style="font-size:14px;color:' + C.soft + ';padding:3px 0;"><b style="color:' + C.ink + ';">Identyfikator zgłoszenia:</b> ' + id + '</td></tr>' +
    '</table></td></tr>' +

    '<tr><td style="padding:6px 30px 30px;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%">' +
    parts.join('') + missingBlock +
    '</table></td></tr>' +

    '<tr><td style="background:' + C.navy + ';padding:20px 30px;">' +
    '<div style="font-size:13px;color:#9DAFC9;line-height:1.5;">Raport wygenerowany automatycznie przez formularz uzupełniający PM Growth Lab.<br>' +
    'Wiadomość nie zawiera załączników.</div>' +
    '</td></tr>' +

    '</table></td></tr></table></body></html>';
}

function buildText(data) {
  const when = stamp(data.submittedAt);
  const pct = Number.isFinite(Number(data.completion)) ? Math.round(Number(data.completion)) : 0;
  const L = [];
  const missing = [];

  L.push('RAPORT UZUPEŁNIAJĄCY');
  L.push('MICHAŁ ELŻBIECIAK');
  L.push('PM GROWTH LAB');
  L.push('Data przesłania: ' + when);
  L.push('Poziom uzupełnienia: ' + pct + '%');
  L.push('Identyfikator zgłoszenia: ' + (plain(data.submissionId, 64) || '—'));
  L.push('');

  data.sections.forEach((section) => {
    const lines = [];
    section.items.forEach((item) => {
      const answer = plain(item.answer, LIMITS.answer).trim();
      const other = plain(item.other, LIMITS.other).trim();
      const comment = plain(item.comment, LIMITS.comment).trim();
      const num = Number.isFinite(Number(item.n)) ? Number(item.n) : null;
      const label = (num ? num + '. ' : '') + plain(item.question, LIMITS.question);
      if (!answer && !other && !comment) { missing.push(label); return; }
      lines.push(label);
      if (answer) answer.split('\n').forEach((l, i) => lines.push((i === 0 ? '-> ' : '   ') + l));
      if (other) other.split('\n').forEach((l, i) => lines.push((i === 0 ? 'WŁASNA ODPOWIEDŹ: ' : '   ') + l));
      if (comment) comment.split('\n').forEach((l, i) => lines.push((i === 0 ? 'KOMENTARZ: ' : '   ') + l));
      lines.push('');
    });
    if (!lines.length) return;
    L.push('==================================================');
    L.push('SEKCJA ' + plain(section.n, 8) + ' — ' + plain(section.title, LIMITS.title));
    L.push('==================================================');
    L.push('');
    L.push.apply(L, lines);
  });

  if (missing.length) {
    L.push('==================================================');
    L.push('PYTANIA BEZ ODPOWIEDZI (' + missing.length + ')');
    L.push('==================================================');
    L.push('');
    missing.forEach((m) => L.push('· ' + m));
    L.push('');
  }

  L.push('Raport wygenerowany automatycznie. Wiadomość nie zawiera załączników.');
  return L.join('\n');
}

/* --------------------------------------------------------------------- handler */

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const permitted = allowedOrigins();
  const ok = permitted.includes(origin);
  const headers = corsHeaders(ok ? origin : permitted[0]);

  if (req.method === 'OPTIONS') {
    res.statusCode = ok ? 204 : 403;
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    return res.end();
  }
  if (req.method !== 'POST') return send(res, 405, headers, { ok: false, error: 'method_not_allowed' });
  if (origin && !ok) return send(res, 403, headers, { ok: false, error: 'origin_not_allowed' });

  /* deklarowany rozmiar odrzucamy zanim cokolwiek wczytamy */
  const declared = Number(req.headers['content-length'] || 0);
  if (declared && declared > MAX_BYTES) return send(res, 413, headers, { ok: false, error: 'payload_too_large' });

  const body = await readBody(req);
  if (body.tooLarge) {
    send(res, 413, headers, { ok: false, error: 'payload_too_large' });
    req.resume();               /* dopuszczamy dokończenie transmisji bez zbierania danych */
    return;
  }
  if (body.invalid) return send(res, 400, headers, { ok: false, error: 'invalid_json' });

  const data = body.data;

  /* honeypot — bot wypełnia niewidoczne pole; nie wysyłamy nic, nie mówimy dlaczego */
  if (typeof data === 'object' && data && typeof data.hp === 'string' && data.hp.trim() !== '') {
    return send(res, 200, headers, { ok: true, submissionId: plain(data.submissionId, 64) || null });
  }

  const problem = validate(data);
  if (problem) {
    const status = problem === 'consent_required' ? 403
      : problem === 'too_many_items' || problem === 'too_many_sections' ? 413 : 400;
    return send(res, status, headers, { ok: false, error: problem });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REPORT_RECIPIENT_EMAIL;
  const from = process.env.REPORT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.error('[pm-growth-lab] brak konfiguracji wysyłki (zmienne środowiskowe)');
    return send(res, 503, headers, { ok: false, error: 'mail_not_configured' });
  }

  const subject = 'PM Growth Lab — odpowiedzi uzupełniające Michała Elżbieciaka — ' + stamp(data.submittedAt);

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: from,
        to: [to],
        subject: subject,
        html: buildHtml(data),
        text: buildText(data)
      })
    });

    if (!resp.ok) {
      /* logujemy wyłącznie status — nigdy treści odpowiedzi Michała */
      console.error('[pm-growth-lab] Resend odrzucił wysyłkę, status ' + resp.status);
      return send(res, 502, headers, { ok: false, error: 'mail_send_failed' });
    }

    return send(res, 200, headers, {
      ok: true,
      submissionId: plain(data.submissionId, 64) || null,
      sentAt: new Date().toISOString()
    });
  } catch (e) {
    console.error('[pm-growth-lab] błąd połączenia z usługą pocztową');
    return send(res, 502, headers, { ok: false, error: 'mail_send_failed' });
  }
};

/* eksport pomocniczy — używany przez testy, nie przez runtime Vercela */
module.exports.__test = { buildHtml, buildText, validate, esc, plain, stamp, FORM_ID, MAX_BYTES };
