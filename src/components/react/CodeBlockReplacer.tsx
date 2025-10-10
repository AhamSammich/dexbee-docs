import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { CodeBlock } from './CodeBlock'

interface CodeBlockReplacerProps {
  containerId: string
}

export function CodeBlockReplacer({ containerId }: CodeBlockReplacerProps) {
  useEffect(() => {
    const container = document.getElementById(containerId)
    if (!container) return

    // Array to collect created roots for cleanup
    const roots: any[] = []

    // Find all Shiki code blocks (pre.astro-code elements)
    const codeBlocks = container.querySelectorAll('pre.astro-code')
    
    codeBlocks.forEach((pre) => {
      // Extract the code content
      const codeElement = pre.querySelector('code')
      if (!codeElement) return

      // Get the language from the class name
      const classNames = pre.className.split(' ')
      const langClass = classNames.find(cls => cls.startsWith('language-'))
      const language = langClass ? langClass.replace('language-', '') : 'typescript'

      // Extract text content, preserving line breaks
      let code = ''
      const walkTextNodes = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          code += node.textContent
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element
          if (element.tagName === 'BR') {
            code += '\n'
          } else {
            Array.from(element.childNodes).forEach(walkTextNodes)
          }
        }
      }
      
      Array.from(codeElement.childNodes).forEach(walkTextNodes)

      // Create a new div to replace the pre element
      const replacement = document.createElement('div')
      replacement.className = 'codemirror-replacement'
      
      // Replace the pre element
      pre.parentNode?.replaceChild(replacement, pre)
      
      // Create React root and render CodeBlock
      const root = createRoot(replacement)
      root.render(<CodeBlock code={code.trim()} language={language} />)
      
      // Collect root for cleanup
      roots.push(root)
    })

    // Return cleanup function to unmount all roots
    return () => {
      roots.forEach(root => {
        try {
          root.unmount()
        } catch (error) {
          console.warn('Error unmounting root:', error)
        }
      })
      roots.length = 0 // Clear the array
    }
  }, [containerId])

  return null
}