'use client'
import { X, Plus } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const METHOD_COLORS: Record<string, string> = {
  GET: '#10B981', POST: '#FF6C37', PUT: '#3B82F6',
  PATCH: '#F59E0B', DELETE: '#EF4444', HEAD: '#A78BFA', OPTIONS: '#F472B6',
}

export default function RequestTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, openTab } = useAppStore()

  return (
    <div className="flex items-center bg-postman-darker border-b border-postman-border overflow-x-auto shrink-0" style={{ minHeight: '36px' }}>
      <div className="flex items-center flex-1 overflow-x-auto">
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId
          const method = tab.requestState.method
          const color = METHOD_COLORS[method] || '#9090AA'

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-2 px-3 py-2 border-r border-postman-border cursor-pointer whitespace-nowrap select-none transition-colors relative shrink-0 max-w-48 ${
                isActive ? 'bg-postman-panel text-postman-text' : 'text-postman-text-muted hover:text-postman-text hover:bg-postman-surface'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-postman-orange" />
              )}
              <span className="text-[10px] font-bold font-mono" style={{ color }}>{method}</span>
              <span className="text-xs truncate max-w-28">{tab.label}</span>
              {tab.loading && (
                <span className="w-1.5 h-1.5 rounded-full bg-postman-orange animate-pulse shrink-0" />
              )}
              <button
                onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
                className="ml-1 opacity-0 group-hover:opacity-100 hover:text-postman-text shrink-0 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
      <button
        onClick={() => openTab()}
        className="px-3 py-2 text-postman-text-muted hover:text-postman-text hover:bg-postman-surface transition-colors shrink-0"
        title="New Tab"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
