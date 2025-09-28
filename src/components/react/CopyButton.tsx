import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'

export function CopyButton({ children, copyText }: { children?: React.ReactNode, copyText?: string }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText || children?.toString() || '')
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <div className="relative w-full h-full">
      {children}
      {isCopied
        ? <div className="absolute top-0 right-0 p-3 z-10"><Check className="w-4 h-4 text-green-500" /></div>
        : (
            <Button variant="ghost" size="icon" className="absolute top-0 right-0 z-10 hover:bg-transparent bg-trans" onClick={handleCopy}>
              <Copy className="w-4 h-4 text-gray-500" />
            </Button>
          )}
    </div>
  )
}
