import { describe, it, expect } from 'vitest'
import { inline, markdown, sanitizeSvg } from './markup'

describe('markup', () => {
  it('escapes HTML and renders math', () => {
    const html = inline('<img src=x onerror=alert(1)> $a^2$')
    expect(html).not.toContain('<img')
    expect(html).toContain('katex')
  })
  it('renders chemistry with mhchem', () => {
    expect(inline('$\\ce{H2O}$')).toContain('katex')
    expect(inline('$\\ce{H2O}$')).not.toContain('katex-error')
  })
  it('renders headings and lists', () => {
    const html = markdown('# Title\n\n## Steps\n1. one\n2. two\n- a\n\npara $x$')
    expect(html).toContain('<h2>Title</h2>')
    expect(html).toContain('<ol><li>one</li><li>two</li></ol><ul><li>a</li></ul>')
    expect(html).toContain('<p>para')
  })
  it('strips scripts and handlers from SVG', () => {
    const out = sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script><rect width="5" onclick="x()"/><a href="javascript:x"><text>t</text></a></svg>')
    expect(out).not.toMatch(/onload|onclick|script|javascript|<a/)
    expect(out).toContain('<rect')
  })
})
