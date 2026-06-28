'use client'
import { Plus, Trash2 } from 'lucide-react'
import { KeyValuePair } from '@/types'

interface Props {
  title: string
  pairs: KeyValuePair[]
  onChange: (pairs: KeyValuePair[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
}

export default function KeyValueEditor({
  title,
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: Props) {
  const addRow = () => onChange([...pairs, { key: '', value: '', enabled: true }])

  const updateRow = (i: number, updates: Partial<KeyValuePair>) => {
    const next = pairs.map((p, idx) => idx === i ? { ...p, ...updates } : p)
    // Auto-add row when typing in last row
    if (i === pairs.length - 1 && (updates.key || updates.value)) {
      if (!next[next.length - 1].key && !next[next.length - 1].value) {
        // don't add
      } else {
        next.push({ key: '', value: '', enabled: true })
      }
    }
    onChange(next)
  }

  const removeRow = (i: number) => {
    const next = pairs.filter((_, idx) => idx !== i)
    if (next.length === 0) next.push({ key: '', value: '', enabled: true })
    onChange(next)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Column headers */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-postman-border text-[10px] text-postman-text-dim uppercase tracking-wider shrink-0">
        <span className="w-5" />
        <span className="flex-1">Key</span>
        <span className="flex-1">Value</span>
        <span className="flex-1">Description</span>
        <span className="w-6" />
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {pairs.map((pair, i) => (
          <div key={i} className="flex items-center gap-1 px-4 border-b border-postman-border/50 group hover:bg-postman-surface/50">
            <input
              type="checkbox"
              checked={pair.enabled}
              onChange={e => updateRow(i, { enabled: e.target.checked })}
              className="w-3.5 h-3.5 accent-postman-orange shrink-0"
            />
            <input
              className="flex-1 kv-input"
              placeholder={keyPlaceholder}
              value={pair.key}
              onChange={e => updateRow(i, { key: e.target.value })}
            />
            <div className="w-px h-4 bg-postman-border shrink-0" />
            <input
              className="flex-1 kv-input"
              placeholder={valuePlaceholder}
              value={pair.value}
              onChange={e => updateRow(i, { value: e.target.value })}
            />
            <div className="w-px h-4 bg-postman-border shrink-0" />
            <input
              className="flex-1 kv-input text-postman-text-dim"
              placeholder="Description"
              value={pair.description || ''}
              onChange={e => updateRow(i, { description: e.target.value })}
            />
            <button
              onClick={() => removeRow(i)}
              className="w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 text-postman-text-dim hover:text-postman-error transition-opacity shrink-0"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="flex items-center gap-2 px-4 py-2 text-xs text-postman-orange hover:text-postman-orange-dark hover:bg-postman-surface transition-colors shrink-0 border-t border-postman-border"
      >
        <Plus className="w-3.5 h-3.5" />
        Add {title.split(' ')[0] === 'Query' ? 'Parameter' : 'Header'}
      </button>
    </div>
  )
}
