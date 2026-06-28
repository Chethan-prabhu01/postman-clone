'use client'
import { useState } from 'react'
import { Send, Save, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { runnerApi, requestsApi, collectionsApi } from '@/lib/api'
import { Tab, HttpMethod } from '@/types'
import KeyValueEditor from './KeyValueEditor'
import BodyEditor from './BodyEditor'
import AuthEditor from './AuthEditor'
import SaveRequestModal from '../modals/SaveRequestModal'
import toast from 'react-hot-toast'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const METHOD_COLORS: Record<string, string> = {
  GET: '#10B981', POST: '#FF6C37', PUT: '#3B82F6',
  PATCH: '#F59E0B', DELETE: '#EF4444', HEAD: '#A78BFA', OPTIONS: '#F472B6',
}

const REQUEST_TABS = ['Params', 'Headers', 'Body', 'Auth'] as const
type RequestTab = typeof REQUEST_TABS[number]

export default function RequestBuilder({ tab }: { tab: Tab }) {
  const { updateRequest, setTabResponse, setTabLoading, activeEnvironmentId, prependHistory } = useAppStore()
  const [activeSection, setActiveSection] = useState<RequestTab>('Params')
  const [methodOpen, setMethodOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const req = tab.requestState

  const updateField = (updates: any) => updateRequest(tab.id, updates)

  const handleSend = async () => {
    if (!req.url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setTabLoading(tab.id, true)
    try {
      const payload = {
        method: req.method,
        url: req.url,
        headers: req.headers.filter(h => h.key && h.enabled),
        params: req.params.filter(p => p.key && p.enabled),
        body_type: req.bodyType,
        body_content: req.bodyContent || null,
        auth_type: req.authType,
        auth_data: req.authData,
        environment_id: activeEnvironmentId || null,
      }

      const res = await runnerApi.send(payload)
      const data = res.data

      setTabResponse(tab.id, {
        status: data.status,
        statusText: data.status_text,
        timeMs: data.time_ms,
        sizeBytes: data.size_bytes,
        headers: data.headers,
        body: data.body,
        historyId: data.history_id,
      })

      // Refresh history
      const { historyApi } = await import('@/lib/api')
      const hist = await historyApi.list()
      useAppStore.getState().setHistory(hist.data)

    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Request failed'
      toast.error(msg)
      setTabResponse(tab.id, {
        status: err?.response?.status || 0,
        statusText: 'Error',
        timeMs: 0,
        sizeBytes: 0,
        headers: {},
        body: msg,
      })
    } finally {
      setTabLoading(tab.id, false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend()
  }

  const paramCount = req.params.filter(p => p.key && p.enabled).length
  const headerCount = req.headers.filter(h => h.key && h.enabled).length

  return (
    <div className="flex flex-col h-full bg-postman-panel overflow-hidden">
      {/* URL Bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-postman-border shrink-0">
        {/* Method selector */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMethodOpen(!methodOpen)}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded bg-postman-surface border border-postman-border text-sm font-bold font-mono hover:border-postman-border-light transition-colors"
            style={{ color: METHOD_COLORS[req.method] }}
          >
            {req.method}
            <ChevronDown className="w-3.5 h-3.5 text-postman-text-muted" />
          </button>
          {methodOpen && (
            <div className="absolute top-full left-0 mt-1 bg-postman-panel border border-postman-border rounded shadow-2xl z-50 py-1 min-w-28">
              {METHODS.map(m => (
                <button
                  key={m}
                  onClick={() => { updateField({ method: m }); setMethodOpen(false) }}
                  className="w-full px-3 py-1.5 text-left text-sm font-bold font-mono hover:bg-postman-surface transition-colors"
                  style={{ color: METHOD_COLORS[m] }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* URL input */}
        <input
          className="flex-1 bg-postman-surface border border-postman-border rounded px-3 py-2 text-sm text-postman-text placeholder:text-postman-text-dim focus:border-postman-orange outline-none transition-colors font-mono"
          placeholder="Enter request URL or paste {{variable}}"
          value={req.url}
          onChange={e => updateField({ url: e.target.value })}
          onKeyDown={handleKeyDown}
        />

        {/* Save */}
        <button
          onClick={() => setSaveOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded border border-postman-border text-xs text-postman-text-muted hover:text-postman-text hover:border-postman-border-light transition-colors shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={tab.loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-postman-orange hover:bg-postman-orange-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {tab.loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending
            </span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Send
            </>
          )}
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex items-center border-b border-postman-border shrink-0 px-4">
        {REQUEST_TABS.map(t => {
          const count = t === 'Params' ? paramCount : t === 'Headers' ? headerCount : 0
          return (
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
              {count > 0 && (
                <span className="ml-1.5 px-1 py-0.5 bg-postman-orange/20 text-postman-orange text-[9px] rounded-full">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'Params' && (
          <KeyValueEditor
            title="Query Parameters"
            pairs={req.params}
            onChange={pairs => updateField({ params: pairs })}
          />
        )}
        {activeSection === 'Headers' && (
          <KeyValueEditor
            title="Request Headers"
            pairs={req.headers}
            onChange={pairs => updateField({ headers: pairs })}
          />
        )}
        {activeSection === 'Body' && (
          <BodyEditor
            bodyType={req.bodyType}
            bodyContent={req.bodyContent}
            onBodyTypeChange={t => updateField({ bodyType: t })}
            onBodyContentChange={c => updateField({ bodyContent: c })}
          />
        )}
        {activeSection === 'Auth' && (
          <AuthEditor
            authType={req.authType}
            authData={req.authData}
            onAuthTypeChange={t => updateField({ authType: t })}
            onAuthDataChange={d => updateField({ authData: d })}
          />
        )}
      </div>

      {saveOpen && <SaveRequestModal tab={tab} onClose={() => setSaveOpen(false)} />}
    </div>
  )
}
