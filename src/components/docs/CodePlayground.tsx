import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodePlaygroundProps {
  initialCode: string;
  title?: string;
  description?: string;
  runnable?: boolean;
  height?: string;
}

export default function CodePlayground({ 
  initialCode, 
  title, 
  description, 
  runnable = false,
  height = '300px'
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    if (!runnable) return;
    
    setIsRunning(true);
    setOutput('Running...');
    
    try {
      // Create a safe execution environment
      const asyncFunc = new Function('console', `
        return (async () => {
          ${code}
        })();
      `);
      
      // Capture console output
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: any[]) => logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')),
        error: (...args: any[]) => logs.push('ERROR: ' + args.map(arg => String(arg)).join(' ')),
        warn: (...args: any[]) => logs.push('WARN: ' + args.map(arg => String(arg)).join(' '))
      };
      
      await asyncFunc(mockConsole);
      setOutput(logs.join('\n') || 'Code executed successfully (no output)');
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
      {(title || description) && (
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          {title && <h4 className="font-medium text-sm mb-1">{title}</h4>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      
      <div className="relative">
        <CodeMirror
          value={code}
          onChange={(value) => setCode(value)}
          extensions={[javascript({ jsx: true, typescript: true })]}
          theme={oneDark}
          height={height}
          className="text-sm"
        />
        
        {runnable && (
          <button
            onClick={runCode}
            disabled={isRunning}
            className="absolute top-2 right-2 px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
        )}
      </div>
      
      {runnable && output && (
        <div className="border-t border-border bg-muted/50">
          <div className="px-4 py-2 text-xs font-medium text-muted-foreground">Output:</div>
          <pre className="px-4 pb-4 text-sm text-foreground font-mono whitespace-pre-wrap overflow-x-auto">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}