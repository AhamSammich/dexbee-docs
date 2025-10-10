import { javascript } from '@codemirror/lang-javascript'
import { EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import CodeMirror, { basicSetup } from '@uiw/react-codemirror'
import { rosePineDawn } from 'thememirror'
import { cn } from '@/utils/cn'
import { useTheme } from '../../hooks/useTheme'
import { CopyButton } from './CopyButton'

interface CodeBlockProps {
  code: string
  language?: string
  height?: string
  readonly?: boolean
  className?: string
}

export function CodeBlock({
  code,
  language = 'typescript',
  height = 'auto',
  readonly = true,
  className,
}: CodeBlockProps) {
  const { isDark } = useTheme()

  const extensions = []

  // Add language support
  if (language === 'typescript' || language === 'javascript') {
    extensions.push(javascript({ jsx: true, typescript: true }))
  }

  // Disable cursor and focus for readonly mode
  if (readonly) {
    extensions.push(
      EditorView.theme({
        '&.cm-editor.cm-focused': {
          outline: 'none !important',
        },
        '.cm-cursor': {
          display: 'none !important',
        },
        '.cm-activeLine': {
          backgroundColor: 'transparent !important',
        },
      }),
      EditorView.editable.of(false),
      EditorState.readOnly.of(true),
    )
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', readonly && 'select-text', className)}>
      <CopyButton copyText={code} />
      <CodeMirror
        value={code}
        extensions={[basicSetup({
          tabSize: 2,
          lineNumbers: false,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: false,
          bracketMatching: false,
          closeBrackets: false,
          autocompletion: false,
          highlightSelectionMatches: false,
          searchKeymap: false,
        }), ...extensions]}
        theme={isDark ? oneDark : rosePineDawn}
        height={height}
        className="text-sm [&>div]:p-2"
        readOnly={readonly}
        basicSetup={false}
        tabIndex={readonly ? -1 : undefined}
      />
    </div>
  )
}
