import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import CodeMirror, { basicSetup } from '@uiw/react-codemirror'
import { useTheme } from '../../hooks/useTheme'
import { CopyButton } from './CopyButton'

interface CodeBlockProps {
  code: string
  language?: string
  height?: string
  readonly?: boolean
}

export function CodeBlock({
  code,
  language = 'typescript',
  height = 'auto',
  readonly = true,
}: CodeBlockProps) {
  const { isDark } = useTheme()

  const extensions = []

  // Add language support
  if (language === 'typescript' || language === 'javascript') {
    extensions.push(javascript({ jsx: true, typescript: true }))
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <CopyButton copyText={code} />
      <CodeMirror
        value={code}
        extensions={[basicSetup({
          tabSize: 2,
          lineNumbers: false,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: false,
          autocompletion: false,
          highlightSelectionMatches: false,
          searchKeymap: false,
        }), ...extensions]}
        theme={isDark ? oneDark : 'light'}
        height={height}
        className="text-sm [&>div]:p-2"
        readOnly={readonly}
        basicSetup={false}
      />
    </div>
  )
}
