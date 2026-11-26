import { useMemo } from 'react'
import 'katex/dist/katex.min.css'
import { blocks, inline, markdown, tex } from '../../lib/markup'

type Mode = 'inline' | 'blocks' | 'markdown' | 'tex'

/** Text with $math$ rendered by KaTeX. All input is escaped first. */
export function Rich({ text, mode = 'inline', as: Tag = 'span', className }: {
  text: string; mode?: Mode; as?: 'span' | 'div' | 'p'; className?: string
}) {
  const html = useMemo(() => {
    switch (mode) {
      case 'inline': return inline(text)
      case 'blocks': return blocks(text)
      case 'markdown': return markdown(text)
      case 'tex': return tex(text, true)
    }
  }, [text, mode])
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
