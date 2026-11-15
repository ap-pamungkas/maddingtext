import type { Note, NoteFont, PaperPattern, PaperShape } from '../features/board/types'
import { isSupabaseConfigured, supabase } from './supabaseClient'

export interface NoteRow {
  id: string
  text: string
  x: number
  y: number
  z_index: number
  pinned: boolean
  paper_color: string
  text_color: string | null
  pattern: string
  font: string
  shape: string
  rotation: number
  pin_x: number | null
  pin_y: number | null
  updated_at?: string
}

export function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    text: row.text ?? '',
    x: Number(row.x) || 0,
    y: Number(row.y) || 0,
    zIndex: Number(row.z_index) || 1,
    pinned: Boolean(row.pinned),
    paperColor: row.paper_color || '#FFFFFF',
    textColor: row.text_color ?? null,
    pattern: (row.pattern as PaperPattern) || 'garis',
    font: (row.font as NoteFont) || 'sans',
    shape: (row.shape as PaperShape) || 'lipat',
    rotation: Number(row.rotation) || 0,
    pinX: row.pin_x !== null && row.pin_x !== undefined ? Number(row.pin_x) : undefined,
    pinY: row.pin_y !== null && row.pin_y !== undefined ? Number(row.pin_y) : undefined,
  }
}

export function noteToRow(note: Note): NoteRow {
  return {
    id: note.id,
    text: note.text,
    x: Math.round(note.x),
    y: Math.round(note.y),
    z_index: note.zIndex,
    pinned: note.pinned,
    paper_color: note.paperColor,
    text_color: note.textColor,
    pattern: note.pattern,
    font: note.font,
    shape: note.shape,
    rotation: note.rotation,
    pin_x: note.pinX ?? null,
    pin_y: note.pinY ?? null,
    updated_at: new Date().toISOString(),
  }
}

export async function fetchNotesFromSupabase(): Promise<Note[] | null> {
  if (!supabase || !isSupabaseConfigured) return null

  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('z_index', { ascending: true })

    if (error) {
      console.warn('[Supabase] Gagal mengambil data:', error.message)
      return null
    }

    return (data as NoteRow[]).map(rowToNote)
  } catch (err) {
    console.error('[Supabase] Error fetchNotesFromSupabase:', err)
    return null
  }
}

export async function saveNoteToSupabase(note: Note): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false

  try {
    const { error } = await supabase
      .from('notes')
      .upsert(noteToRow(note), { onConflict: 'id' })

    if (error) {
      console.warn('[Supabase] Gagal menyimpan note:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('[Supabase] Error saveNoteToSupabase:', err)
    return false
  }
}

export async function deleteNoteFromSupabase(id: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false

  try {
    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (error) {
      console.warn('[Supabase] Gagal menghapus note:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('[Supabase] Error deleteNoteFromSupabase:', err)
    return false
  }
}

export function subscribeToSupabaseNotes(handlers: {
  onInsert: (note: Note) => void
  onUpdate: (note: Note) => void
  onDelete: (id: string) => void
}): () => void {
  if (!supabase || !isSupabaseConfigured) {
    return () => {}
  }

  const client = supabase

  const channel = client
    .channel('realtime:notes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notes' },
      (payload) => {
        handlers.onInsert(rowToNote(payload.new as NoteRow))
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'notes' },
      (payload) => {
        handlers.onUpdate(rowToNote(payload.new as NoteRow))
      },
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'notes' },
      (payload) => {
        if (payload.old && payload.old.id) {
          handlers.onDelete(payload.old.id)
        }
      },
    )
    .subscribe((status) => {
      console.log('[Supabase Realtime] Status channel:', status)
    })

  return () => {
    client.removeChannel(channel)
  }
}
