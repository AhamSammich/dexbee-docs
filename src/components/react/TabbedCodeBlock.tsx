import * as React from 'react'
import { cn } from '@/utils/cn'
import { CodeBlock } from './CodeBlock'

interface Tab {
  id: string
  label: string
  code: string
  language?: string
}

interface TabbedCodeBlockProps {
  tabs: Tab[]
  initialTabId?: string
  className?: string
  height?: string
}

export function TabbedCodeBlock({
  tabs,
  initialTabId,
  className,
  height = 'auto',
}: TabbedCodeBlockProps) {
  const [activeId, setActiveId] = React.useState(
    () => initialTabId ?? tabs[0]?.id,
  )
  const active = tabs.find(t => t.id === activeId) ?? tabs[0]

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      <div role="tablist" className="flex items-center gap-1 border-b border-border bg-muted/60 px-2 py-1">
        {tabs.map(t => (
          <button
            type="button"
            key={t.id}
            role="tab"
            aria-selected={activeId === t.id}
            onClick={() => setActiveId(t.id)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeId === t.id
                ? 'bg-background text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-background">
        <CodeBlock
          code={active.code}
          language={active.language ?? 'bash'}
          height={height}
          className="rounded-none border-none"
          readonly
        />
      </div>
    </div>
  )
}
