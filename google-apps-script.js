/**
 * Google Apps Script untuk sinkronisasi MaddingText dengan Google Sheets.
 * 
 * CARA SETUP:
 * 1. Buat Google Spreadsheet baru di Google Drive (https://sheets.new).
 * 2. Di spreadsheet tersebut, buka menu: Extensions (Ekstensi) > Apps Script.
 * 3. Hapus semua kode default, lalu salin dan tempelkan semua kode di bawah ini.
 * 4. Klik tombol "Deploy" (Terapkan) di kanan atas > "New deployment" (Penerapan baru).
 * 5. Pilih jenis (ikon roda gigi): "Web app" (Aplikasi Web).
 * 6. Set "Execute as": "Me" (Saya).
 * 7. Set "Who has access": "Anyone" (Siapa saja).
 * 8. Klik "Deploy" dan berikan izin akses (Authorize access).
 * 9. Salin "Web app URL" (akhiran /exec) dan simpan di file .env.local:
 *    VITE_GOOGLE_SHEETS_URL="https://script.google.com/macros/s/.../exec"
 */

const SHEET_NAME = 'Notes';
const HEADERS = [
  'id',
  'text',
  'x',
  'y',
  'zIndex',
  'pinned',
  'paperColor',
  'textColor',
  'pattern',
  'font',
  'shape',
  'rotation',
  'pinX',
  'pinY',
  'updatedAt'
];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function doGet() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse({ success: true, notes: [] });
    }

    const notes = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;

      const note = {
        id: String(row[0]),
        text: String(row[1] || ''),
        x: Number(row[2]) || 0,
        y: Number(row[3]) || 0,
        zIndex: Number(row[4]) || 1,
        pinned: row[5] === true || String(row[5]).toLowerCase() === 'true',
        paperColor: String(row[6] || '#FFE27A'),
        textColor: row[7] && row[7] !== '' && row[7] !== 'null' ? String(row[7]) : null,
        pattern: String(row[8] || 'polos'),
        font: String(row[9] || 'sans'),
        shape: String(row[10] || 'standar'),
        rotation: Number(row[11]) || 0,
        pinX: row[12] !== '' && row[12] !== undefined ? Number(row[12]) : undefined,
        pinY: row[13] !== '' && row[13] !== undefined ? Number(row[13]) : undefined,
      };
      notes.push(note);
    }

    return jsonResponse({ success: true, notes: notes });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'Tidak ada data POST' });
    }

    const contents = JSON.parse(e.postData.contents);
    const notes = contents.notes;

    if (!Array.isArray(notes)) {
      return jsonResponse({ success: false, error: 'Data notes harus berupa array' });
    }

    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clearContent();
    }

    if (notes.length > 0) {
      const now = new Date().toISOString();
      const rows = notes.map(function(note) {
        return [
          note.id,
          note.text || '',
          note.x || 0,
          note.y || 0,
          note.zIndex || 1,
          Boolean(note.pinned),
          note.paperColor || '#FFE27A',
          note.textColor || '',
          note.pattern || 'polos',
          note.font || 'sans',
          note.shape || 'standar',
          note.rotation || 0,
          note.pinX !== undefined ? note.pinX : '',
          note.pinY !== undefined ? note.pinY : '',
          now
        ];
      });

      sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
    }

    return jsonResponse({ success: true, count: notes.length });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

