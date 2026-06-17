# Plan: Markdown Preview Toggle

## Context
The side panel currently displays generated markdown only as raw text inside a `<pre>` block. This plan adds a Raw / Preview toggle so users can switch to a rendered HTML view of the same markdown, making it easier to visually verify the output before copying it to Claude Code.

## Files to Modify

| File | Change |
|---|---|
| `UI/package.json` | Add `react-markdown` + `@tailwindcss/typography` |
| `UI/src/app/globals.css` | Enable typography plugin |
| `UI/src/types/index.ts` | Add `ViewMode` type |
| `UI/src/components/tickets/SelectedPanel.tsx` | Add toggle state + conditional render |

No backend changes required — this is purely a frontend UI enhancement.

---

## Step-by-Step Implementation

### Step 1 — Install dependencies
```bash
cd UI && npm install react-markdown @tailwindcss/typography
```
- `react-markdown` → runtime dep (renders markdown)
- `@tailwindcss/typography` → devDep in spirit; move to `devDependencies` in `package.json` manually, consistent with other Tailwind packages there.

### Step 2 — Enable typography plugin (`UI/src/app/globals.css`)
Add one line after the existing `@import 'tailwindcss';`:
```css
@plugin "@tailwindcss/typography";
```
This is the Tailwind v4 CSS-based config pattern already used in this project.

### Step 3 — Add `ViewMode` type (`UI/src/types/index.ts`)
Per project standards, all types live in this file:
```ts
export type ViewMode = 'raw' | 'preview';
```

### Step 4 — Update `SelectedPanel.tsx`

**Imports to add:**
```tsx
import ReactMarkdown from 'react-markdown';
import type { ViewMode } from '@/types';
```

**State to add** (alongside existing `copied` state):
```tsx
const [viewMode, setViewMode] = useState<ViewMode>('raw');
```

**Toggle buttons** — render inside the `{markdown && !loading && (…)}` block, above the content:
```tsx
<div className="flex gap-1 self-end">
  <button
    onClick={() => setViewMode('raw')}
    className={`rounded px-2 py-1 text-xs transition-colors ${
      viewMode === 'raw'
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Raw
  </button>
  <button
    onClick={() => setViewMode('preview')}
    className={`rounded px-2 py-1 text-xs transition-colors ${
      viewMode === 'preview'
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Preview
  </button>
</div>
```

**Conditional render** — replace the single `<pre>` with:
```tsx
{viewMode === 'raw' ? (
  <pre className="border-border bg-background text-foreground max-h-[50vh] overflow-auto rounded-md border p-3 text-xs leading-relaxed whitespace-pre-wrap">
    {markdown}
  </pre>
) : (
  <div className="prose prose-sm prose-invert border-border bg-background max-h-[50vh] overflow-auto rounded-md border p-3">
    <ReactMarkdown>{markdown}</ReactMarkdown>
  </div>
)}
```

Default `viewMode` is `'raw'` — no breaking change for existing users.

---

## After Each File

Per project standards, after saving each `.ts`/`.tsx` file:
```bash
cd UI && npm run lint && npm run prettier:fix
```

---

## Verification

1. Run `cd UI && npm run dev`
2. Log in and select one or more tickets — markdown is generated automatically
3. Confirm the toggle buttons "Raw" / "Preview" appear above the markdown block
4. **Raw view**: markdown text displays exactly as before (no regression)
5. **Preview view**: headings render as `<h1>`–`<h3>`, bold as `<strong>`, horizontal rules as `<hr>` — styled via `prose-invert`
6. Toggle back and forth — the active button highlights with `bg-primary`
7. Copy and Clear buttons remain functional in both modes
8. Run `npm run test:coverage` — coverage should remain above 70%
