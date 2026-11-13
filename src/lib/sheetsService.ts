import type { Note } from '../features/board/types'

const rawUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL?.trim()
const GOOGLE_SHEETS_URL = rawUrl ? rawUrl.replace(/^["']|["']$/g, '').trim() : ''

/**
 * Memeriksa apakah URL sinkronisasi Google Sheets telah dikonfigurasi di .env
 */
export function isSheetsConfigured(): boolean {
  return Boolean(GOOGLE_SHEETS_URL)
}

/**
 * Mengambil seluruh data catatan dari Google Sheets
 */
export async function fetchNotesFromSheets(): Promise<Note[] | null> {
  if (!GOOGLE_SHEETS_URL) {
    return null
  }

  try {
    const res = await fetch(GOOGLE_SHEETS_URL, {
      method: 'GET',
    })

    if (res.status === 401 || res.status === 403) {
      console.warn(
        `[Google Sheets] Akses Ditolak (HTTP ${res.status}).\n` +
          'Penyebab: Di Google Apps Script, pengaturan "Who has access" (Yang memiliki akses) ' +
          'belum diset ke "Anyone" (Siapa saja).\n' +
          'Solusi: Di Apps Script klik Deploy > Manage deployments > Edit > ganti "Who has access" ke "Anyone" lalu Deploy.',
      )
      return null
    }

    if (!res.ok) {
      console.warn(`[Google Sheets] Gagal mengambil data: HTTP ${res.status}`)
      return null
    }

    const text = await res.text()
    // Jika respons adalah HTML (misal redirect ke Google Login), bukan JSON valid
    if (text.startsWith('<!doctype') || text.startsWith('<html')) {
      console.warn(
        '[Google Sheets] Google mengalihkan ke halaman login akun Google.\n' +
          'Pastikan deployment Apps Script diset ke "Who has access: Anyone" (Siapa saja).',
      )
      return null
    }

    const json = JSON.parse(text) as { success: boolean; notes?: Note[]; error?: string }
    if (!json.success || !Array.isArray(json.notes)) {
      console.warn('[Google Sheets] Respons tidak valid:', json.error)
      return null
    }

    return json.notes
  } catch (err) {
    console.error('[Google Sheets] Terjadi kesalahan saat fetch:', err)
    return null
  }
}

/**
 * Menyimpan seluruh catatan ke Google Sheets
 */
export async function saveNotesToSheets(notes: Note[]): Promise<boolean> {
  if (!GOOGLE_SHEETS_URL) {
    return false
  }

  try {
    // Menggunakan text/plain agar browser mengirim simple CORS request
    // tanpa OPTIONS preflight yang kadang diblokir oleh Google Apps Script redirect
    const res = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify({ notes }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    })

    if (res.status === 401 || res.status === 403) {
      console.warn(
        `[Google Sheets] Gagal menyimpan (HTTP ${res.status}).\n` +
          'Penyebab: Google Apps Script memerlukan izin publik ("Who has access: Anyone").',
      )
      return false
    }

    if (!res.ok) {
      console.warn(`[Google Sheets] Gagal menyimpan data: HTTP ${res.status}`)
      return false
    }

    const text = await res.text()
    if (text.startsWith('<!doctype') || text.startsWith('<html')) {
      console.warn(
        '[Google Sheets] Google meminta login saat menyimpan data.\n' +
          'Ganti "Who has access" ke "Anyone" di Apps Script.',
      )
      return false
    }

    const json = JSON.parse(text) as { success: boolean; error?: string }
    return Boolean(json.success)
  } catch (err) {
    console.error('[Google Sheets] Terjadi kesalahan saat menyimpan:', err)
    return false
  }
}

