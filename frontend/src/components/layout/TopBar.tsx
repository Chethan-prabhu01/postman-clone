'use client'
import { useState } from 'react'
import { Plus, Settings, ChevronDown, Globe, Users, BookOpen, Activity } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { environmentsApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function TopBar() {
  const { environments, activeEnvironmentId, setActiveEnvironment, setEnvironments, openTab, setSidebarTab } = useAppStore()
  const [envOpen, setEnvOpen] = useState(false)

  const activeEnv = environments.find(e => e.id === activeEnvironmentId)

  const handleEnvSelect = async (id: number | null) => {
    try {
      if (id !== null) {
        await environmentsApi.activate(id)
      }
      setActiveEnvironment(id)
      const res = await environmentsApi.list()
      setEnvironments(res.data)
      setEnvOpen(false)
    } catch {
      toast.error('Failed to switch environment')
    }
  }

  return (
    <header className="h-12 bg-postman-darker border-b border-postman-border flex items-center justify-between px-4 shrink-0 z-50">
      {/* Left: Logo + Workspaces */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-postman-orange flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="text-sm font-semibold text-postman-text hidden md:block">API Client</span>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {[
            { icon: Globe, label: 'Home' },
            { icon: BookOpen, label: 'Workspaces' },
            { icon: Activity, label: 'API Network' },
            { icon: Users, label: 'Explore' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-postman-text-muted hover:text-postman-text hover:bg-postman-surface transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Center: New button */}
      <button
        onClick={() => openTab()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-postman-surface border border-postman-border text-xs text-postman-text-muted hover:text-postman-text hover:border-postman-border-light transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>New</span>
      </button>

      {/* Right: Environment selector + Settings */}
      <div className="flex items-center gap-2">
        {/* Environment selector */}
        <div className="relative">
          <button
            onClick={() => setEnvOpen(!envOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-postman-surface border border-postman-border text-xs text-postman-text hover:border-postman-border-light transition-colors min-w-32"
          >
            <div className={`w-2 h-2 rounded-full ${activeEnv ? 'bg-postman-success' : 'bg-postman-text-dim'}`} />
            <span className="truncate max-w-24">{activeEnv?.name ?? 'No Environment'}</span>
            <ChevronDown className={`w-3 h-3 ml-auto shrink-0 transition-transform ${envOpen ? 'rotate-180' : ''}`} />
          </button>

          {envOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-postman-panel border border-postman-border rounded-lg shadow-2xl z-50 overflow-hidden">
              <div className="p-2 border-b border-postman-border">
                <p className="text-xs text-postman-text-muted px-2">Environments</p>
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                <button
                  onClick={() => handleEnvSelect(null)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-postman-surface transition-colors ${!activeEnv ? 'text-postman-text' : 'text-postman-text-muted'}`}
                >
                  <div className="w-2 h-2 rounded-full bg-postman-text-dim" />
                  No Environment
                </button>
                {environments.map(env => (
                  <button
                    key={env.id}
                    onClick={() => handleEnvSelect(env.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-postman-surface transition-colors ${activeEnvironmentId === env.id ? 'text-postman-text' : 'text-postman-text-muted'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${activeEnvironmentId === env.id ? 'bg-postman-success' : 'bg-postman-text-dim'}`} />
                    {env.name}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-postman-border">
                <button
                  onClick={() => { setSidebarTab('environments'); setEnvOpen(false) }}
                  className="w-full text-xs text-postman-orange hover:text-postman-orange-dark text-center py-1"
                >
                  Manage Environments
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="p-1.5 rounded hover:bg-postman-surface text-postman-text-muted hover:text-postman-text transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
