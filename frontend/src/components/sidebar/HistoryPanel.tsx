'use client'
import { useAppStore } from '@/lib/store'
import { Clock, Trash2 } from 'lucide-react'
import { historyApi } from '@/lib/api'
import { setHistory } from '@/lib/store'
import toast from 'react-hot-toast'

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'text-emerald-400', POST: 'text-orange-400', PUT: 'text-blue-400',
    PATCH: 'text-yellow-400', DELETE: 'text-red-400',
  }
  return <span className={`text-[10px] font-bold font-mono w-10 shrink-0 ${colors[method] ?? 'text-gray-400'}`}>{method}</span>
}

function StatusBadge({ status }: { status?: number }) {
  if (!status) return null
  const cls = status < 300 ? 'text-emerald-400' : status < 400 ? 'text-yellow-400' : 'text-red-400'
  return <span className={`text-[10px] font-mono ${cls}`}>{status}</span>
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

export default function HistoryPanel() {
  const { history, setHistory, openTab } = useAppStore()

  const handleOpen = (entry: typeof history[0]) => {
    let headers = [], params = [], authData = {}
    try { headers = JSON.parse(entry.headers) } catch {}
    try { params = JSON.parse(entry.params) } catch {}
    try { authData = JSON.parse(entry.auth_data) } catch {}

    openTab({
      name: new URL(entry.url.startsWith('http') ? entry.url : `https://${entry.url}`).pathname || entry.url,
      method: entry.method as any,
      url: entry.url,
      headers: headers.length ? headers : [{ key: '', value: '', enabled: true }],
      params: params.length ? params : [{ key: '', value: '', enabled: true }],
      bodyType: entry.body_type as any,
      bodyContent: entry.body_content || '',
      authType: entry.auth_type as any,
      authData,
    })
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await historyApi.delete(id)
      setHistory(history.filter(h => h.id !== id))
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-postman-text-dim text-xs px-4 text-center">
        <Clock className="w-8 h-8 opacity-30" />
        <p>No request history yet.<br />Send a request to see it here.</p>
      </div>
    )
  }

  // Group by date
  const grouped: Record<string, typeof history> = {}
  history.forEach(entry => {
    const d = new Date(entry.created_at)
    const key = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(entry)
  })

  return (
    <div className="py-1">
      {Object.entries(grouped).map(([date, entries]) => (
        <div key={date}>
          <div className="px-3 py-1.5 text-[10px] text-postman-text-dim uppercase tracking-wider font-semibold">
            {date}
          </div>
          {entries.map(entry => (
            <div
              key={entry.id}
              onClick={() => handleOpen(entry)}
              className="group flex items-center gap-2 px-3 py-2 hover:bg-postman-surface cursor-pointer"
            >
              <MethodBadge method={entry.method} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-postman-text-muted truncate">{entry.url}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={entry.response_status} />
                  {entry.response_time && (
                    <span className="text-[10px] text-postman-text-dim">{entry.response_time}ms</span>
                  )}
                  <span className="text-[10px] text-postman-text-dim ml-auto">{timeAgo(entry.created_at)}</span>
                </div>
              </div>
              <button
                onClick={e => handleDelete(entry.id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-postman-border"
              >
                <Trash2 className="w-3 h-3 text-postman-text-dim" />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
