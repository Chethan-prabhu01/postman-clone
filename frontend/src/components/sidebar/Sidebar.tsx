'use client'
import { FolderOpen, Clock, Globe, Plus, Search, Trash2, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { collectionsApi, historyApi, environmentsApi } from '@/lib/api'
import CollectionsPanel from './CollectionsPanel'
import HistoryPanel from './HistoryPanel'
import EnvironmentsPanel from './EnvironmentsPanel'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const { sidebarTab, setSidebarTab, setCollections, setHistory, openTab, setEnvironments } = useAppStore()

  const tabs = [
    { id: 'collections', icon: FolderOpen, label: 'Collections' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'environments', icon: Globe, label: 'Environments' },
  ] as const

  const handleNewCollection = async () => {
    try {
      const name = prompt('Collection name:')
      if (!name?.trim()) return
      await collectionsApi.create({ name: name.trim() })
      const res = await collectionsApi.list()
      setCollections(res.data)
      toast.success('Collection created')
    } catch {
      toast.error('Failed to create collection')
    }
  }

  const handleClearHistory = async () => {
    if (!confirm('Clear all history?')) return
    try {
      await historyApi.clear()
      setHistory([])
      toast.success('History cleared')
    } catch {
      toast.error('Failed to clear history')
    }
  }

  return (
    <div className="flex flex-col h-full bg-postman-sidebar border-r border-postman-border overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-postman-border shrink-0">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setSidebarTab(id)}
            title={label}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors border-b-2 ${
              sidebarTab === id
                ? 'border-postman-orange text-postman-text'
                : 'border-transparent text-postman-text-muted hover:text-postman-text'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-postman-border shrink-0">
        <div className="flex-1 flex items-center gap-1.5 bg-postman-surface rounded px-2 py-1 border border-postman-border">
          <Search className="w-3 h-3 text-postman-text-dim shrink-0" />
          <input
            className="flex-1 bg-transparent text-xs text-postman-text placeholder:text-postman-text-dim outline-none min-w-0"
            placeholder={`Search ${sidebarTab}...`}
          />
        </div>
        {sidebarTab === 'collections' && (
          <button
            onClick={handleNewCollection}
            title="New Collection"
            className="p-1.5 rounded hover:bg-postman-surface text-postman-text-muted hover:text-postman-text transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
        {sidebarTab === 'history' && (
          <button
            onClick={handleClearHistory}
            title="Clear History"
            className="p-1.5 rounded hover:bg-postman-surface text-postman-text-muted hover:text-postman-error transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        {sidebarTab === 'environments' && (
          <button
            onClick={async () => {
              const res = await environmentsApi.list()
              setEnvironments(res.data)
              toast.success('Refreshed')
            }}
            title="Refresh"
            className="p-1.5 rounded hover:bg-postman-surface text-postman-text-muted hover:text-postman-text transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {sidebarTab === 'collections' && <CollectionsPanel />}
        {sidebarTab === 'history' && <HistoryPanel />}
        {sidebarTab === 'environments' && <EnvironmentsPanel />}
      </div>
    </div>
  )
}
