# DESIGN.md

Visual and interaction specification for MaddingText. Before changing anything, also read `.agents`. Read this file before changing any UI. [`AGENTS.md`](./AGENTS.md) defines architecture and rules; this file defines how the product looks and feels.

## 1. Concept

MaddingText is a school *mading* (wall bulletin board) in the browser. A whole class shares one board and sees each other's notes appear live.

The screen has two parts:

- **The page** is a calm, dark, minimal surface. The toolbar sits on it and stays out of the way.
- **The mading** is a physical object on that surface: a cork board in a wooden frame, covered with paper notes held by pins.

The interface is flat and quiet. The board looks like something you could touch. All realism is concentrated in the **board, the paper, and the pin**.

**Audience:** students (many are minors) on phones, school laptops, and sometimes a classroom projector. **Primary job:** add a note in seconds and watch the board fill up.

**Scope:** two tools (add note, pin) and paper customization. No pan, zoom, select tool, hand tool, or cursors.

### Principles

1. **Realism lives in paper and pins only.** Toolbar and panels stay flat and restrained.
2. **One light source, upper left.** Every shadow, highlight, and pin glint agrees with it.
3. **Depth shows state.** A loose note is *lifted*. A pinned note is *pressed flat*. A dragged note is *held up high*.
4. **Textures are cheap.** CSS gradients and small inline SVG only, so a busy board stays smooth.
5. **The pin is the memorable moment.** Keep the rest of the motion quiet.

## 2. Layout

```text
┌──────────────────────────── Page (dark) ────────────────────────────┐
│                                         [12 online] [Terhubung]     │
│                                         [+ Tambah catatan] [📌 Pin]  │
│     ┌───────────── Frame (wood) ─────────────┐                      │
│     │ ┌────────── Cork surface ─────────┐    │                      │
│     │ │  📄 note    📄 note             │    │                      │
│     │ │        📄 note                  │    │                      │
│     │ └─────────────────────────────────┘    │                      │
│     └────────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
```

- The board has a **fixed logical size** (see `AGENTS.md`) and is **scaled to fit** the window. Everyone sees the same layout, only smaller or larger.
- If the window is below the minimum scale, the page scrolls normally. There is no custom pan or zoom.
- The toolbar stays where it is today (top right, fixed) with the same keyboard navigation. It holds exactly two tools.
- The connection status and online count sit next to the toolbar.
- Notes live only on the cork surface and are clamped to it.
- The board and notes sit inside one scaled wrapper that creates its own stacking context. Note `zIndex` values can grow without covering the toolbar.

| Layer | Contents |
|---|---|
| Page | Dark background, subtle grain |
| Board | Frame and cork surface |
| Notes | Paper, pin, author label |
| Fixed UI | Toolbar, status |
| Drag ghost | Pin following the pointer (topmost, client coordinates) |

## 3. Color tokens

Define in `src/index.css` under `:root`. Existing tokens stay and map to these values.

### Page and UI

| Token | Value | Use |
|---|---|---|
| `--canvas-bg` | `#1B1C1F` | Page background |
| `--surface` | `#26272B` | Toolbar, panels |
| `--surface-hover` | `#2F3136` | Hover |
| `--border` | `#3A3C42` | Borders |
| `--text-primary` | `#ECECEE` | UI text |
| `--text-muted` | `#A0A3AB` | Secondary text |
| `--focus-ring` | `#7AB7FF` | Focus outline |

### Board

| Token | Value | Use |
|---|---|---|
| `--cork-base` | `#B8895A` | Cork surface |
| `--cork-dark` | `#8C6239` | Shading and vignette |
| `--cork-light` | `#D2A877` | Highlights |
| `--frame-wood` | `#4E3220` | Frame |
| `--frame-wood-light` | `#6B4630` | Top and left bevel |

### Paper presets

Kuning `#FFE27A`, Putih tulang `#F5F0E3`, Biru muda `#BDE0F0`, Merah muda `#F6C4CC`, Hijau `#C6E6C0`, Oranye `#FFC999`. Custom colors stay available. Text color stays automatic when `textColor` is `null`; verify at least 4.5:1 contrast on every preset.

### Pin colors

Each student gets a color on joining: `#D62F3F`, `#2F6FD6`, `#2E9E5B`, `#E8B422`, `#8A4FD6`, `#1FA2A8`. They must stand out on cork and on every paper preset. `--pin-accent` stays as the default and as the toolbar pin-mode accent. Color is never the only identifier; the author name is always shown too.

## 4. Typography

- **UI:** system UI stack, 15 px controls, 12–13 px status. Sentence case. No all-caps labels.
- **Notes:** `sans`, `serif`, `mono` through `--note-font`, 15 px, line-height 1.5 (24 px on `garis` paper so text sits on the lines).
- **Author label:** 12 px, `--note-muted`, name only.
- A handwriting font is an optional later addition. It would need to be self-hosted and added to the shared `font` enum in one change.

## 5. Cork board and frame

Build the surface from a few cheap layers, not an image file.

1. Base `--cork-base`.
2. **Blotches:** inline SVG `feTurbulence` (`fractalNoise`, `baseFrequency` about 0.03–0.05, 3–4 octaves), tinted between `--cork-dark` and `--cork-light`.
3. **Grain:** a second turbulence at high frequency (about 0.8–1.0), low opacity, `mix-blend-mode: multiply`.
4. **Light:** a soft highlight toward the upper left, a darker falloff toward the lower right.
5. **Inner edge:** an inset shadow where cork meets the frame, so the surface looks recessed.

The **frame** is a wooden border about 14 px wide: `--frame-wood`, lighter bevel on the top and left, darker on the bottom and right. The board casts a large soft shadow onto the page.

Rules: generate each texture once as a `data:` URI (a few KB) and reuse it; textures belong to the board only, never per note; under `forced-colors: active`, use a solid `Canvas` surface with a `CanvasText` border.

## 6. Paper

### Layers (bottom to top)

1. `--note-bg` paper color.
2. **Fibre:** very subtle SVG turbulence, `mix-blend-mode: multiply`, about 3–5% opacity.
3. **Light falloff:** lighter at the top left, slightly darker at the bottom right.
4. **Pattern** (`garis`, `titik`, `kotak`): on the textarea as today via `--note-line`. `polos` has none.
5. **Content:** textarea and author label.

### Shape and tilt

- Corner radius **2 px** (replaces the current 8 px). Paper has near-square corners.
- Each note has a stored `rotation` (about −4° to +4°) set once at creation, so everyone sees the same tilt.
- Controls stay usable on a tilted note. If tilt hurts hit-testing or readability, counter-rotate the controls instead of removing the tilt.

### Elevation (shadows fall down and to the right)

| State | Shadow | Meaning |
|---|---|---|
| Pinned | Tight and short, for example `1px 1px 1px` plus `2px 3px 5px`, low opacity | Pressed flat against the cork |
| Loose | Medium and soft, for example `2px 4px 6px` plus `6px 12px 18px` | Slightly lifted off the board |
| Dragging | Large and diffuse, for example `10px 18px 28px`, with a tiny scale-up | Held in the air |

Shadows are static `box-shadow` values switched by state classes. Do not animate blur or spread across many notes at once.

### States

- Existing modifiers stay: `note-card--pinned`, `note-card--dragging`, `note-card--pin-target`, `note-card--just-pinned`, `note-card--just-unpinned`.
- Add `note-card--remote-editing` for a note someone else is editing: read-only textarea, a small label "{nama} sedang menulis", and an outline in that person's pin color.
- A note dragged by someone else shows the lifted shadow and follows the incoming positions.
- A remote new note appears with a quick fade and tiny settle. Under reduced motion it simply appears.

### Customization panel

Keep the existing style panel (pattern, font, paper color, text color). Add nothing new for now. Preset swatches use the paper presets above. Everything in the panel keeps its `aria-pressed` states and accessible names.

## 7. Pin

### Anatomy (one reusable inline SVG component)

- **Head:** a dome with a radial gradient: small bright highlight at the upper left, body in the pin color, darker rim.
- **Neck:** a short darker ring under the head.
- **Cast shadow:** a soft ellipse offset down and to the right on the paper. This sells the pin.
- **Needle hint:** a tiny dark sliver at the base when at rest.
- **Hole:** a very small dark dot on the paper, visible when the pin is lifted.

### Color

The pin takes the color of the student who pinned the note, so the pin and the author label tell who pinned it.

### States and motion

| State | Look |
|---|---|
| Toolbar tool | Flat icon with the existing pressed state |
| Dragging toward a note | Ghost pin follows the pointer, slightly larger with a bigger shadow (in the air) |
| Over a valid note | `note-card--pin-target` and the dashed target ring |
| Pressed in | Drops about 12 px with slight overshoot (`pin-press`), paper settles (`card-pin-settle`), shadow tightens |
| Pinned at rest | Static |
| Unpinning | Pin lifts away, paper settles (`card-unpin-settle`), shadow widens |

- All pin and paper animation is inside `prefers-reduced-motion: no-preference`. Without motion the change is instant, and depth, icon shape, and the accessible name still show the state.
- The pin stays a real button with an accessible name such as "Lepas sematan catatan".
- Under `forced-colors: active`, draw the pin with `ButtonText` and a `Highlight` outline.

## 8. Realtime feedback

### Connection status (always visible)

| State | Indicator | Text |
|---|---|---|
| Connected | Solid dot | Terhubung |
| Reconnecting | Pulsing dot | Menyambung ulang… |
| Offline | Warning icon | Offline. Perubahan belum tersimpan. |

- Never use color alone; always show text or an icon.
- When offline, never claim anything is saved. When the connection returns, resync and confirm briefly.
- Next to the status, show how many students are online ("12 online").

### Errors and limits

Say what happened and what to do, in plain language, without apologizing:

- "Catatan terlalu panjang. Maksimal 500 karakter."
- "Kamu sudah mencapai batas 10 catatan. Hapus satu untuk menambah yang baru."
- "Kamu tidak bisa mengubah catatan orang lain."

## 9. Entering a name

On first visit, show one small prompt on the page background: field **Nama kamu**, button **Masuk ke mading**. No email, no password, no board code. The name is remembered on the device and can be changed. If the field is empty, say so next to it and say what to do.

## 10. Copy

Interface text is **Indonesian**, sentence case, plain verbs. One action keeps one name everywhere (button, confirmation, live announcement). Code, identifiers, and enum values stay in English except the existing pattern values `polos | garis | titik | kotak`.

| Place | Text |
|---|---|
| Add note | Tambah catatan |
| Pin tool | Sematkan |
| Unpin | Lepas sematan |
| Delete | Hapus catatan |
| Customize | Ubah tampilan |
| Empty board | Mading masih kosong. Tambahkan catatan pertamamu. |
| Placeholder | Tulis sesuatu… |
| Writing indicator | {nama} sedang menulis |
| Announce, new note | {nama} menambahkan catatan |
| Announce, deleted | Catatan dihapus oleh {nama} |

## 11. Accessibility

- Everything doable by pointer is doable from the keyboard: add, edit, move (arrows, Shift = faster), pin and unpin, delete, restyle.
- Visible `:focus-visible` outlines on everything interactive.
- At least 4.5:1 text contrast on every paper preset and on UI surfaces.
- No state by color alone: pinned shows a pin shape and depth, connection shows text.
- `prefers-reduced-motion`: remove non-essential animation.
- `forced-colors: active`: drop textures and gradients, keep borders and outlines in system colors, keep shape differences.
- The polite live region announces important local and remote actions, rate-limited and batched so a class joining at once does not flood screen readers.
- Touch targets of at least 44 px.
- The tilt limit stays small so note text stays readable.

## 12. Responsive and touch

- Phones: the toolbar stays icon-only if needed, with 44 px targets. The scaled board is small on a phone, so the minimum scale decides when the page starts scrolling. Choose a minimum at which note text is still comfortable to read.
- Dragging works with touch through Pointer Events. `touch-action: none` only on the drag handle and pin, as today.
- Projector: the board must be readable on a 1280 × 720 display.

## 13. Performance budget

- 200 notes and 30 connected students stay smooth on a mid-range school laptop.
- A remote update re-renders only the affected note (`React.memo` on `NoteCard`, stable props).
- Live drag updates from others are throttled and applied with direct style updates where possible.
- Each texture is one reused `data:` URI. No per-note textures, no remote images, no large rasters.
- Avoid `filter: blur` and animated `box-shadow` across many notes.

## 14. Implementation order

1. Tokens, cork board, frame, and the scaled wrapper with board-space coordinates.
2. Paper: radius, fibre, light, elevation states, rotation.
3. Pin: SVG component, shadow, press-in and lift, per-student color.
4. Connection status, online count, name prompt.
5. Remote-editing and remote-dragging states.
6. Polish: forced-colors, reduced-motion, performance check with 200 notes.

## 15. Open design questions

1. Cork with a wooden frame is the default. Would the school prefer another surface? The tokens make this a small change.
2. Should the school name or logo appear on the frame?
3. Is a handwriting font wanted for notes?
4. Should unpinned notes remain possible, or should every note be pinned on creation?
5. Is a light page theme needed, or dark only?