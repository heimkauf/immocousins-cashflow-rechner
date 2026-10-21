/**
 * SMTP-Versand über eine bestehende Mailbox.
 * Auf Cloudflare Pages Functions läuft das über cloudflare:sockets
 * (TCP + TLS, Port 465). Kein Passwort steht im Code.
 */

const transporte = new Map();

export function registriereTransport(id, fabrik) {
  transporte.set(id, fabrik);
}

export function entferneTransport(id) {
  transporte.delete(id);
}

function b64Bytes(bytes) {
  const roh = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (const byte of roh) bin += String.fromCharCode(byte);
  return btoa(bin);
}

function b64Text(text) {
  return b64Bytes(new TextEncoder().encode(String(text)));
}

export function headerWert(text) {
  if (/^[\x20-\x7E]*$/.test(text)) return text;
  return '=?UTF-8?B?' + b64Text(text) + '?=';
}

function punktStopfen(text) {
  return String(text).replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');
}

export function baueNachricht({ von, an, replyTo, subject, text, anhang }) {
  const grenze = 'ic-' + Math.random().toString(36).slice(2, 12);
  const kopf = [
    'From: ' + von,
    'To: ' + (Array.isArray(an) ? an.join(', ') : an),
    replyTo ? 'Reply-To: ' + replyTo : '',
    'Subject: ' + headerWert(subject),
    'MIME-Version: 1.0',
    'Date: ' + new Date().toUTCString(),
  ].filter(Boolean);

  if (!anhang) {
    kopf.push('Content-Type: text/plain; charset=utf-8');
    kopf.push('Content-Transfer-Encoding: base64');
    kopf.push('');
    kopf.push(b64Text(text));
    return kopf.join('\r\n');
  }

  kopf.push('Content-Type: multipart/mixed; boundary="' + grenze + '"');
  kopf.push('');
  const teile = [
    '--' + grenze,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64Text(text),
    '--' + grenze,
    'Content-Type: application/pdf',
    'Content-Transfer-Encoding: base64',
    'Content-Disposition: attachment; filename="' + (anhang.name || 'auswertung.pdf') + '"',
    '',
    b64Bytes(anhang.bytes instanceof Uint8Array ? anhang.bytes : new Uint8Array(anhang.bytes)),
    '--' + grenze + '--',
    '',
  ];
  return kopf.join('\r\n') + '\r\n' + teile.join('\r\n');
}

async function leseAntwort(transport) {
  let letzte = '';
  for (let i = 0; i < 40; i++) {
    const zeile = await transport.leseZeile();
    if (!zeile) break;
    letzte = zeile;
    if (zeile.length < 4 || zeile[3] !== '-') break;
  }
  return letzte;
}

function code(zeile) {
  return Number(String(zeile).slice(0, 3));
}

async function erwarte(transport, erwartet) {
  const zeile = await leseAntwort(transport);
  const status = code(zeile);
  if (!erwartet.includes(status)) {
    throw new Error('SMTP ' + status);
  }
  return zeile;
}

export async function smtpSenden(transport, brief) {
  await erwarte(transport, [220]);
  await transport.schreibe('EHLO immocousins.de\r\n');
  await erwarte(transport, [250]);
  await transport.schreibe('AUTH LOGIN\r\n');
  await erwarte(transport, [334]);
  await transport.schreibe(b64Text(brief.user) + '\r\n');
  await erwarte(transport, [334]);
  await transport.schreibe(b64Text(brief.pass) + '\r\n');
  await erwarte(transport, [235]);
  const von = brief.absender || brief.user;
  await transport.schreibe('MAIL FROM:<' + von + '>\r\n');
  await erwarte(transport, [250]);
  const empfaenger = Array.isArray(brief.an) ? brief.an : [brief.an];
  for (const adresse of empfaenger) {
    await transport.schreibe('RCPT TO:<' + adresse + '>\r\n');
    await erwarte(transport, [250, 251]);
  }
  await transport.schreibe('DATA\r\n');
  await erwarte(transport, [354]);
  const nachricht = punktStopfen(brief.nachricht);
  await transport.schreibe(nachricht + '\r\n.\r\n');
  await erwarte(transport, [250]);
  await transport.schreibe('QUIT\r\n');
  if (transport.schliesse) await transport.schliesse();
  return { ok: true };
}

export async function socketTransport(socket) {
  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const decoder = new TextDecoder();
  let puff = '';
  return {
    async leseZeile() {
      while (!puff.includes('\n')) {
        const gelesen = await reader.read();
        if (gelesen.done) break;
        puff += decoder.decode(gelesen.value, { stream: true });
      }
      const index = puff.indexOf('\n');
      if (index < 0) {
        const rest = puff;
        puff = '';
        return rest.replace(/\r$/, '');
      }
      const zeile = puff.slice(0, index).replace(/\r$/, '');
      puff = puff.slice(index + 1);
      return zeile;
    },
    async schreibe(text) {
      await writer.write(new TextEncoder().encode(text));
    },
    async schliesse() {
      try {
        await writer.close();
      } catch (e) {
        /* Verbindung kann schon zu sein */
      }
    },
    freigeben() {
      try { reader.releaseLock(); } catch (e) { /* schon frei */ }
      try { writer.releaseLock(); } catch (e) { /* schon frei */ }
    },
  };
}

export async function verbindeCloudflare(host, port, tls) {
  const { connect } = await import('cloudflare:sockets');
  if (tls !== 'starttls') {
    const socket = connect({ hostname: host, port: Number(port) || 465 }, { secureTransport: 'on' });
    return socketTransport(socket);
  }
  const socket = connect({ hostname: host, port: Number(port) || 587 }, { secureTransport: 'starttls' });
  const klar = await socketTransport(socket);
  await erwarte(klar, [220]);
  await klar.schreibe('EHLO immocousins.de\r\n');
  await erwarte(klar, [250]);
  await klar.schreibe('STARTTLS\r\n');
  await erwarte(klar, [220]);
  if (klar.freigeben) klar.freigeben();
  if (typeof socket.startTls !== 'function') throw new Error('STARTTLS nicht verfügbar');
  return socketTransport(socket.startTls());
}

export async function oeffneTransport(env) {
  if (env && env.SMTP_TRANSPORT_ID && transporte.has(env.SMTP_TRANSPORT_ID)) {
    return transporte.get(env.SMTP_TRANSPORT_ID)();
  }
  const host = (env && env.SMTP_HOST) || 'smtp.strato.de';
  const port = Number((env && env.SMTP_PORT) || 465);
  const tls = ((env && env.SMTP_TLS) || 'on').toLowerCase();
  return verbindeCloudflare(host, port, tls);
}

export function versandArt(env) {
  const quelle = env || {};
  const wahl = String(quelle.MAIL_VERSAND || '').toLowerCase();
  if (wahl === 'smtp' || wahl === 'resend' || wahl === 'aus') return wahl;
  if (quelle.SMTP_PASS) return 'smtp';
  return 'aus';
}
