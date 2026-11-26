import katex from 'katex'
import 'katex/contrib/mhchem' // \ce{...} for chemical equations

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function tex(src: string, display = false): string {
  return katex.renderToString(src, { displayMode: display, throwOnError: false, strict: 'ignore', trust: false, output: 'htmlAndMathml' })
}

/** Inline text: escapes HTML, renders $...$ (and $$...$$) with KaTeX, **bold**. */
export function inline(src: string): string {
  let out = ''
  const re = /\$\$([^$]+)\$\$|\$([^$]+)\$/g
  let last = 0
  for (let m = re.exec(src); m; m = re.exec(src)) {
    out += plain(src.slice(last, m.index))
    out += m[1] !== undefined ? tex(m[1], true) : tex(m[2])
    last = m.index + m[0].length
  }
  return out + plain(src.slice(last))
}
const plain = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

/** Rich block text: paragraphs separated by blank lines, single newlines kept. */
export function blocks(src: string): string {
  return src.split(/\n{2,}/).map((p) => `<p>${p.split('\n').map(inline).join('<br>')}</p>`).join('')
}

/** Minimal Markdown for method sheets: #/##/### headings, - and 1. lists, paragraphs. */
export function markdown(src: string): string {
  const lines = src.split('\n')
  let html = ''
  let list: 'ul' | 'ol' | null = null
  let para: string[] = []
  const flushPara = () => { if (para.length) { html += `<p>${para.map(inline).join(' ')}</p>`; para = [] } }
  const closeList = () => { if (list) { html += `</${list}>`; list = null } }
  for (const raw of lines) {
    const line = raw.trimEnd()
    const h = /^(#{1,3})\s+(.*)$/.exec(line)
    const ul = /^[-*]\s+(.*)$/.exec(line)
    const ol = /^\d+\.\s+(.*)$/.exec(line)
    if (h) { flushPara(); closeList(); const lvl = h[1].length + 1; html += `<h${lvl}>${inline(h[2])}</h${lvl}>`; continue }
    if (ul || ol) {
      flushPara()
      const want = ul ? 'ul' : 'ol'
      if (list !== want) { closeList(); html += `<${want}>`; list = want }
      html += `<li>${inline((ul ?? ol)![1])}</li>`
      continue
    }
    if (!line.trim()) { flushPara(); closeList(); continue }
    closeList()
    para.push(line)
  }
  flushPara(); closeList()
  return html
}

// ---------------------------------------------------------------- SVG
const SVG_TAGS = new Set(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'marker', 'title', 'desc'])
const SVG_ATTRS = /^(viewBox|xmlns|width|height|x|y|x1|x2|y1|y2|cx|cy|r|rx|ry|d|points|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-dasharray|opacity|fill-opacity|transform|text-anchor|font-size|font-family|font-weight|dominant-baseline|role|aria-label|id|marker-end|marker-start|markerWidth|markerHeight|refX|refY|orient)$/

/** Allow-list sanitiser for admin-authored diagrams: shapes and text only, no scripts, links or events. */
export function sanitizeSvg(src: string): string {
  const doc = new DOMParser().parseFromString(src, 'image/svg+xml')
  const root = doc.documentElement
  if (root.nodeName !== 'svg' || doc.querySelector('parsererror')) return ''
  const walk = (el: Element) => {
    for (const child of [...el.children]) {
      if (!SVG_TAGS.has(child.nodeName)) { child.remove(); continue }
      walk(child)
    }
    for (const a of [...el.attributes]) {
      if (!SVG_ATTRS.test(a.name) || /url\s*\(\s*['"]?\s*(?!#)/i.test(a.value) || /javascript:/i.test(a.value)) el.removeAttribute(a.name)
    }
  }
  walk(root)
  root.setAttribute('width', '100%')
  root.removeAttribute('height')
  return new XMLSerializer().serializeToString(root)
}
