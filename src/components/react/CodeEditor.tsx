import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import CodeMirror from '@uiw/react-codemirror'
import { Play, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  onExecute: (code: string) => void
  onSave: (code: string) => void
  height?: string
}

export function CodeEditor({
  value,
  onChange,
  onExecute,
  onSave,
  height = '300px',
}: CodeEditorProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isDark, setIsDark] = useState(false)

  // Sync local value with external value when it changes
  // Use a ref to track the previous value to avoid unnecessary updates
  const prevValue = useRef(value)

  if (prevValue.current !== value) {
    prevValue.current = value
    setLocalValue(value)
  }

  // Detect theme on mount and listen for changes
  useEffect(() => {
    const checkTheme = () => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark')
      // Use requestAnimationFrame to defer state update
      requestAnimationFrame(() => setIsDark(isCurrentlyDark))
    }

    // Initial check
    checkTheme()

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  const handleChange = (val: string) => {
    setLocalValue(val)
    onChange(val)
  }

  const handleExecute = () => {
    onExecute(localValue)
  }

  const handleSave = () => {
    onSave(localValue)
  }

  const extensions = [
    javascript({ typescript: true }),
    EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily: '"Geist Mono", "Fira Code", monospace',
      },
      '.cm-focused': {
        outline: 'none',
      },
      '.cm-editor': {
        borderRadius: '0.5rem',
      },
      '.cm-content': {
        padding: '16px',
        minHeight: height,
      },
    }),
  ]

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        <h2 className="text-lg font-semibold text-foreground">Code Editor</h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExecute}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <Play className="w-4 h-4" />
            Execute
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <CodeMirror
          value={localValue}
          height={height}
          theme={isDark ? oneDark : 'light'}
          extensions={extensions}
          onChange={handleChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
            searchKeymap: true,
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-muted/50 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>TypeScript</span>
          <span>
            {`Ln ${localValue.split('\n').length}, Col ${localValue.length}`}
          </span>
        </div>
      </div>
    </div>
  )
}
