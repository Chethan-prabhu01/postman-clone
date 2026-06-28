'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, Check, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { environmentsApi } from '@/lib/api'
import { Environment, EnvironmentVariable } from '@/types'
import toast from 'react-hot-toast'

function VariableRow({
  variable,
  onUpdate,
}: {
  variable: EnvironmentVariable
  onUpdate: (v: EnvironmentVariable) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex items-center gap-1 px-2 py-1 hover:bg-postman-surface group">
      <input
        type="checkbox"
        checked={variable.enabled}
        onChange={e => onUpdate({ ...variable, enabled: e.target.checked })}
        className="w-3 h-3 accent-postman-orange shrink-0"
      />
      <input
        className="flex-1 bg-transparent text-xs text-postman-text-muted font-mono px-1 py-0.5 outline-none border-b border-transparent focus:border-postman-orange"
        value={variable.key}
        onChange={e => onUpdate({ ...variable, key: e.target.value })}
        placeholder="Variable"
      />
      <div className="flex-1 flex items-center gap-1">
        <input
          className="flex-1 bg-transparent text-xs text-postman-text-muted font-mono px-1 py-0.5 outline-none border-b border-transparent focus:border-postman-orange"
          type={variable.is_secret && !show ? 'password' : 'text'}
          value={variable.value || ''}
          onChange={e => onUpdate({ ...variable, value: e.target.value })}
          placeholder="Value"
        />
        {variable.is_secret && (
          <button onClick={() => setShow(!show)} className="opacity-0 group-hover:opacity-100 p-0.5">
            {show ? <EyeOff className="w-3 h-3 text-postman-text-dim" /> : <Eye className="w-3 h-3 text-postman-text-dim" />}
          </button>
        )}
      </div>
    </div>
  )
}

function EnvironmentItem({ env, onRefresh }: { env: Environment; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [vars, setVars] = useState<EnvironmentVariable[]>(env.variables)
  const { activeEnvironmentId, setActiveEnvironment, setEnvironments } = useAppStore()
  const isActive = activeEnvironmentId === env.id

  const handleActivate = async () => {
    try {
      await environmentsApi.activate(env.id)
      const res = await environmentsApi.list()
      setEnvironments(res.data)
      setActiveEnvironment(env.id)
      toast.success(`${env.name} activated`)
    } catch {
      toast.error('Failed to activate')
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete environment "${env.name}"?`)) return
    try {
      await environmentsApi.delete(env.id)
      onRefresh()
      toast.success('Environment deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleSave = async () => {
    try {
      await environmentsApi.update(env.id, {
        variables: vars.map(v => ({ key: v.key, value: v.value, is_secret: v.is_secret, enabled: v.enabled })),
      })
      onRefresh()
      setEditing(false)
      toast.success('Environment saved')
    } catch {
      toast.error('Failed to save')
    }
  }

  const addVar = () => setVars(v => [...v, { id: -Date.now(), key: '', value: '', is_secret: false, enabled: true }])

  return (
    <div className="border-b border-postman-border">
      <div className="flex items-center gap-2 px-3 py-2">
        <button onClick={() => setExpanded(!expanded)} className="text-postman-text-dim">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        <span className="text-xs text-postman-text flex-1 truncate">{env.name}</span>
        {isActive && <span className="text-[10px] text-postman-success font-semibold">ACTIVE</span>}
        <div className="flex items-center gap-1">
          <button onClick={handleActivate} title="Set Active" className="p-0.5 rounded hover:bg-postman-surface text-postman-text-dim hover:text-postman-success"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => { setExpanded(true); setEditing(!editing) }} title="Edit" className="p-0.5 rounded hover:bg-postman-surface text-postman-text-dim hover:text-postman-text"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={handleDelete} title="Delete" className="p-0.5 rounded hover:bg-postman-surface text-postman-text-dim hover:text-postman-error"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-postman-border bg-postman-darker">
          {/* Header */}
          <div className="flex items-center gap-1 px-2 py-1 text-[10px] text-postman-text-dim border-b border-postman-border">
            <span className="w-3.5" />
            <span className="flex-1 ml-1">Variable</span>
            <span className="flex-1">Value</span>
          </div>
          {vars.map((v, i) => (
            <VariableRow
              key={v.id}
              variable={v}
              onUpdate={updated => setVars(prev => prev.map((x, xi) => xi === i ? updated : x))}
            />
          ))}
          {editing && (
            <div className="flex items-center gap-2 px-3 py-2">
              <button onClick={addVar} className="text-[10px] text-postman-orange hover:text-postman-orange-dark flex items-center gap-1">
                <Plus className="w-3 h-3" />Add Variable
              </button>
              <div className="ml-auto flex gap-1">
                <button onClick={handleSave} className="px-2 py-1 bg-postman-orange text-white text-[10px] rounded hover:bg-postman-orange-dark">Save</button>
                <button onClick={() => { setEditing(false); setVars(env.variables) }} className="px-2 py-1 bg-postman-surface text-postman-text-muted text-[10px] rounded hover:bg-postman-border">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function EnvironmentsPanel() {
  const { environments, setEnvironments } = useAppStore()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const refresh = async () => {
    const res = await environmentsApi.list()
    setEnvironments(res.data)
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await environmentsApi.create({ name: newName.trim(), variables: [] })
      await refresh()
      setNewName('')
      setCreating(false)
      toast.success('Environment created')
    } catch {
      toast.error('Failed to create')
    }
  }

  return (
    <div>
      {environments.map(env => <EnvironmentItem key={env.id} env={env} onRefresh={refresh} />)}

      {creating ? (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-postman-border">
          <input
            autoFocus
            className="flex-1 bg-postman-surface text-xs text-postman-text px-2 py-1 rounded border border-postman-border outline-none focus:border-postman-orange"
            placeholder="Environment name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
          />
          <button onClick={handleCreate} className="p-1 text-postman-success hover:bg-postman-surface rounded"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setCreating(false)} className="p-1 text-postman-text-dim hover:bg-postman-surface rounded"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-postman-orange hover:bg-postman-surface transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Environment
        </button>
      )}
    </div>
  )
}
