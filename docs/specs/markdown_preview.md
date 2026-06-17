# Feature: Markdown Preview

## Description
Add a rendered markdown preview to the existing side panel using `react-markdown`. The user can toggle between raw markdown and a rendered preview.

## Acceptance Criteria
- [ ] Toggle button "Raw / Preview" visible when markdown is generated
- [ ] Preview renders headings, bold, horizontal rules as HTML
- [ ] Raw view remains unchanged (current `<pre>` block)
- [ ] Default view is Raw (no breaking change for existing users)
- [ ] `react-markdown` installed as a dependency

## Technical Notes

### Files likely affected
- `UI/src/components/tickets/SelectedPanel.tsx` — add toggle state + conditional render
- `UI/package.json` — add `react-markdown` and `@tailwindcss/typography` dependencies
- `UI/src/app/globals.css` — enable `@plugin "@tailwindcss/typography"` (Tailwind v4 CSS-based config)

### Implementation notes
- Use `useState` for the `raw | preview` toggle — local UI state, no Zustand needed
- Render `<ReactMarkdown>{markdown}</ReactMarkdown>` inside a styled container matching the existing `<pre>` dimensions
- `react-markdown` renders safe HTML by default (no need for `dangerouslySetInnerHTML`)
- Wrap the preview with `prose prose-sm prose-invert` classes from `@tailwindcss/typography` for automatic heading, bold, and hr styling
