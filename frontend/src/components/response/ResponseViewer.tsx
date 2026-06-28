'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Tab } from '@/types'
import { Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const CodeMirrorEditor = dynamic(() => import('../request/CodeMirrorEditor'), { ssr: false })

const RESPONSE_TABS = ['Body', 'Headers'] as const
type ResponseTab = typeof RESPONSE_TABS[number]

function StatusBadge({ status }: { status: number }) {
  const cls = status === 0 ? 'text-postman-text-dim bg-postman-surface' :
    status < 300 ? 'text-emerald-400 bg-emerald-400/10' :
    status < 400 ? 'text-yellow-400 bg-yellow-400/10' :
    'text-red-400 bg-red-400/10'
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${cls}`}>
      {status || '—'}
    </span>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isJson(str: string): boolean {
  try { JSON.parse(str); return true } catch { return false }
}

function prettyJson(str: string): string {
  try { return JSON.stringify(JSON.parse(str), null, 2) } catch { return str }
}

export default function ResponseViewer({ tab }: { tab: Tab }) {
  const [activeSection, setActiveSection] = useState<ResponseTab>('Body')
  const [view, setView] = useState<'pretty' | 'raw'>('pretty')
  const [copied, setCopied] = useState(false)
  const { response, loading } = tab

  const handleCopy = () => {
    if (!response?.body) return
    navigator.clipboard.writeText(response.body)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-postman-darker items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-postman-orange/30 border-t-postman-orange rounded-full animate-spin" />
        <p className="text-xs text-postman-text-muted">Sending request...</p>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex flex-col h-full bg-postman-darker items-center justify-center gap-2">
        <div className="text-4xl opacity-20">→</div>
        <p className="text-xs text-postman-text-dim text-center">
          Hit <kbd className="px-1.5 py-0.5 bg-postman-surface rounded text-[10px] font-mono">Send</kbd> to get a response
        </p>
      </div>
    )
  }

  const bodyContent = view === 'pretty' && isJson(response.body) ? prettyJson(response.body) : response.body

  return (
    <div className="flex flex-col h-full bg-postman-darker overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-postman-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-postman-text-muted">Status</span>
          <StatusBadge status={response.status} />
          <span className="text-xs text-postman-text-muted">{response.statusText}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-postman-text-muted">Time</span>
          <span className="text-xs font-mono text-postman-success">{response.timeMs}ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-postman-text-muted">Size</span>
          <span className="text-xs font-mono text-postman-info">{formatSize(response.sizeBytes)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-postman-border shrink-0 px-4">
        {RESPONSE_TABS.map(t => (
          <button
            key={t}
            onClick={() => setActiveSection(t)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
              activeSection === t
                ? 'border-postman-orange text-postman-text'
                : 'border-transparent text-postman-text-muted hover:text-postman-text'
            }`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {activeSection === 'Body' && (
            <div className="flex items-center gap-0.5 bg-postman-surface rounded border border-postman-border p-0.5">
              {(['pretty', 'raw'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-2.5 py-1 rounded text-[10px] transition-colors ${
                    view === v ? 'bg-postman-panel text-postman-text' : 'text-postman-text-muted hover:text-postman-text'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-postman-text-muted hover:text-postman-text hover:bg-postman-surface rounded transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-postman-success" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeSection === 'Body' && (
          response.body ? (
            <CodeMirrorEditor value={bodyContent} onChange={() => {}} readOnly height="100%" />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-postman-text-dim">
              No response body
            </div>
          )
        )}
        {activeSection === 'Headers' && (
          <div className="overflow-y-auto h-full">
            <div className="flex items-center gap-4 px-4 py-1.5 border-b border-postman-border text-[10px] text-postman-text-dim uppercase tracking-wider">
              <span className="flex-1">Header</span>
              <span className="flex-1">Value</span>
            </div>
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex items-start gap-4 px-4 py-2 border-b border-postman-border/50 hover:bg-postman-surface/50">
                <span className="flex-1 text-xs text-postman-text font-mono break-all">{key}</span>
                <span className="flex-1 text-xs text-postman-text-muted font-mono break-all">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
