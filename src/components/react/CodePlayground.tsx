import type { DatabaseSchema } from 'dexbee-js'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import CodeMirror, { basicSetup } from '@uiw/react-codemirror'
import { and, DexBee, eq, gt, or } from 'dexbee-js'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/Resizable'

interface CodePlaygroundProps {
  initialCode: string
  title?: string
  description?: string
  runnable?: boolean
  height?: string
}

export default function CodePlayground({
  initialCode,
  title,
  description,
  runnable = false,
  height = '300px',
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [db, setDb] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    
    // Initialize theme state
    const checkTheme = () => {
      const isDarkTheme = document.documentElement.classList.contains('dark')
      setIsDark(isDarkTheme)
    }
    
    // Set initial theme
    checkTheme()
    
    // Listen for theme changes
    const handleThemeChange = () => {
      checkTheme()
    }
    
    window.addEventListener('themeChange', handleThemeChange)
    
    // Also listen for class changes on document element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme()
        }
      })
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange)
      observer.disconnect()
    }
  }, [])

  // Helper function to clear sample data
  const clearSampleData = async (dexbee: any) => {
    try {
      const orders = dexbee.table('orders')
      const users = dexbee.table('users')
      const products = dexbee.table('products')

      // Clear all tables
      const allOrders = await orders.all()
      for (const order of allOrders) {
        await orders.delete(order.id)
      }

      const allUsers = await users.all()
      for (const user of allUsers) {
        await users.delete(user.id)
      }

      const allProducts = await products.all()
      for (const product of allProducts) {
        await products.delete(product.id)
      }
    }
    catch (error) {
      console.warn('Error clearing data:', error)
    }
  }

  // Helper function to insert sample data
  const insertSampleData = async (dexbee: any) => {
    const orders = dexbee.table('orders')
    await orders.insertMany([
      { customer_name: 'Alice Johnson', status: 'completed', total: 150.50, created_at: new Date('2024-01-15') },
      { customer_name: 'Bob Smith', status: 'completed', total: 89.99, created_at: new Date('2024-01-16') },
      { customer_name: 'Charlie Brown', status: 'pending', total: 245.75, created_at: new Date('2024-01-17') },
      { customer_name: 'Diana Wilson', status: 'completed', total: 67.25, created_at: new Date('2024-01-18') },
      { customer_name: 'Edward Davis', status: 'completed', total: 312.40, created_at: new Date('2024-01-19') },
      { customer_name: 'Fiona Miller', status: 'cancelled', total: 45.00, created_at: new Date('2024-01-20') },
    ])

    const users = dexbee.table('users')
    await users.insertMany([
      { name: 'Alice Johnson', email: 'alice@company.com', age: 28, created_at: new Date('2023-12-01') },
      { name: 'Bob Smith', email: 'bob@company.com', age: 35, created_at: new Date('2023-12-02') },
      { name: 'Charlie Brown', email: 'charlie@other.com', age: 22, created_at: new Date('2023-12-03') },
    ])

    const products = dexbee.table('products')
    await products.insertMany([
      { name: 'Laptop Pro', price: 1299.99, category: 'Electronics' },
      { name: 'Wireless Mouse', price: 29.99, category: 'Electronics' },
      { name: 'Coffee Mug', price: 12.50, category: 'Office' },
    ])
  }

  // Define schema constant
  const getSchema = (): DatabaseSchema => ({
    version: 1,
    tables: {
      orders: {
        schema: {
          id: { type: 'number', required: true },
          customer_name: { type: 'string', required: true },
          status: { type: 'string', required: true },
          total: { type: 'number', required: true },
          created_at: { type: 'date', required: true },
        },
        primaryKey: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'status_idx', keyPath: 'status' },
          { name: 'total_idx', keyPath: 'total' },
          { name: 'created_at_idx', keyPath: 'created_at' },
        ],
      },
      users: {
        schema: {
          id: { type: 'number', required: true },
          name: { type: 'string', required: true },
          email: { type: 'string', required: true },
          age: { type: 'number', required: true },
          created_at: { type: 'date', required: true },
        },
        primaryKey: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'email_idx', keyPath: 'email', unique: true },
          { name: 'age_idx', keyPath: 'age' },
        ],
      },
      products: {
        schema: {
          id: { type: 'number', required: true },
          name: { type: 'string', required: true },
          price: { type: 'number', required: true },
          category: { type: 'string', required: true },
        },
        primaryKey: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'category_idx', keyPath: 'category' },
          { name: 'price_idx', keyPath: 'price' },
        ],
      },
    },
  })

  // Manual initialization function
  const initializePlayground = async () => {
    if (isInitializing || db)
      return

    setIsInitializing(true)
    setOutput('🚀 Initializing playground database...')

    try {
      // Create DexBee instance with proper API
      const schema = getSchema()
      const dexbee = await DexBee.connect('playground-demo', schema)

      // Clear existing data to avoid conflicts
      await clearSampleData(dexbee)

      // Insert fresh sample data
      await insertSampleData(dexbee)

      setDb(dexbee)
      setIsInitialized(true)
      setOutput('✅ Playground ready! Sample data loaded. Try running the query above.')
    }
    catch (error) {
      console.error('Failed to initialize DexBee:', error)
      setOutput(`❌ Failed to initialize database: ${error instanceof Error ? error.message : String(error)}`)
    }
    finally {
      setIsInitializing(false)
    }
  }

  // Reset playground database
  const resetPlayground = async () => {
    if (!db || isResetting || !isInitialized)
      return

    setIsResetting(true)
    setOutput('🔄 Resetting playground database...')

    try {
      await clearSampleData(db)
      await insertSampleData(db)
      setOutput('✅ Playground database reset successfully! Fresh sample data loaded.')
    }
    catch (error) {
      setOutput(`❌ Error resetting playground: ${error instanceof Error ? error.message : String(error)}`)
    }
    finally {
      setIsResetting(false)
    }
  }

  const runCode = async () => {
    if (!runnable || !db || !isInitialized)
      return

    setIsRunning(true)
    setOutput('Running...')

    try {
      // Create a safe execution environment with access to the DexBee instance
      // eslint-disable-next-line no-new-func
      const asyncFunc = new Function('console', 'db', 'eq', 'gt', 'and', 'or', `
        return (async () => {
          ${code}
        })();
      `)

      // Capture console output
      const logs: string[] = []
      const mockConsole = {
        log: (...args: any[]) => logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
        ).join(' ')),
        error: (...args: any[]) => logs.push(`ERROR: ${args.map(arg => String(arg)).join(' ')}`),
        warn: (...args: any[]) => logs.push(`WARN: ${args.map(arg => String(arg)).join(' ')}`),
      }

      await asyncFunc(mockConsole, db, eq, gt, and, or)
      setOutput(logs.join('\n') || 'Code executed successfully (no output)')
    }
    catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
    finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
      <div className="flex justify-between border-b border-border bg-muted/50">
        {(title || description) && (
          <div className="px-4 py-3">
            {title && <h4 className="font-medium text-sm mb-1">{title}</h4>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}

        {runnable && isInitialized && (
          <div className="py-3 px-4 flex gap-2">
            <Button
              size="sm"
              type="button"
              onClick={resetPlayground}
              disabled={isResetting || isRunning}
              title="Reset playground database with fresh sample data"
            >
              {isResetting ? 'Resetting...' : 'Reset DB'}
            </Button>
            <Button
              variant="secondary"
              type="button"
              size="sm"
              onClick={runCode}
              disabled={isRunning || isResetting}
            >
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          </div>
        )}
      </div>

      <div className="relative" style={{ height }}>
        {/* Overlay for uninitialized state */}
        {!isInitialized && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center space-y-4 p-8">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">Interactive DexBee Playground</h3>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  Initialize a demo database with sample data to try out DexBee's SQL-like queries in your browser
                </p>
              </div>
              <Button
                size="lg"
                type="button"
                onClick={initializePlayground}
                disabled={isInitializing}
                className="shadow-lg"
              >
                {isInitializing
                  ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Initializing playground...
                      </span>
                    )
                  : (
                      'Try it now'
                    )}
              </Button>
            </div>
          </div>
        )}
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70}>
            <CodeMirror
              value={code}
              onChange={value => setCode(value)}
              extensions={[basicSetup({ tabSize: 2 }), javascript({ jsx: true, typescript: true })]}
              theme={mounted.current && isDark ? oneDark : 'light'}
              height={height}
              className="text-sm whitespace-pre-wrap"
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>

            {runnable && (output || !isInitialized) && (
              <div className="border-t border-border bg-muted/50">
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground">Output:</div>
                <pre className="px-4 pb-4 text-sm text-foreground font-mono whitespace-pre-wrap overflow-x-auto">
                  {output || (!isInitialized ? '📋 Click "Try it now" to initialize the playground database with sample data.' : '')}
                </pre>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

    </div>
  )
}
