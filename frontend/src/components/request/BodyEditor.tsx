'use client'
import dynamic from 'next/dynamic'
import { BodyType, KeyValuePair } from '@/types'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const CodeMirrorEditor = dynamic(() => import('./CodeMirrorEditor'), { ssr: false })

const BODY_TYPES: { id: BodyType; label: string }[] = [
  { id: 'none', label: 'none' },
  { id: 'raw', label: 'raw' },
  { id: 'form-data', label: 'form-data' },
  { id: 'urlencoded', label: 'x-www-form-urlencoded' },
]

interface Props {
  bodyType: BodyType
  bodyContent: string
  onBodyTypeChange: (t: BodyType) => void
  onBodyContentChange: (c: string) => void
}

function FormDataEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  let rows: KeyValuePair[] = []
  try { rows = JSON.parse(value) } catch {}
  if (!rows.length) rows = [{ key: '', value: '', enabled: true }]

  const update = (i: number, updates: Partial<KeyValuePair>) => {
    const next = rows.map((r, ri) => ri === i ? { ...r, ...updates } : r)
    if (i === rows.length - 1 && (updates.key || updates.value)) {
      next.push({ key: '', value: '', enabled: true })
    }
    onChange(JSON.stringify(next))
  }

  const remove = (i: number) => {
    const next = rows.filter((_, ri) => ri !== i)
    if (!next.length) next.push({ key: '', value: '', enabled: true })
    onChange(JSON.stringify(next))
  }

  return (
    <div>
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-postman-border text-[10px] text-postman-text-dim uppercase tracking-wider">
        <span className="w-5" /><span className="flex-1">Key</span><span className="flex-1">Value</span><span className="w-6" />
      </div>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-1 px-4 border-b border-postman-border/50 group hover:bg-postman-surface/50">
          <input type="checkbox" checked={row.enabled} onChange={e => update(i, { enabled: e.target.checked })} className="w-3.5 h-3.5 accent-postman-orange" />
          <input className="flex-1 kv-input" placeholder="Key" value={row.key} onChange={e => update(i, { key: e.target.value })} />
          <div className="w-px h-4 bg-postman-border" />
          <input className="flex-1 kv-input" placeholder="Value" value={row.value} onChange={e => update(i, { value: e.target.value })} />
          <button onClick={() => remove(i)} className="w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 text-postman-text-dim hover:text-postman-error">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function BodyEditor({ bodyType, bodyContent, onBodyTypeChange, onBodyContentChange }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Body type selector */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-postman-border shrink-0">
        {BODY_TYPES.map(({ id, label }) => (
          <label key={id} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="bodyType"
              value={id}
              checked={bodyType === id}
              onChange={() => onBodyTypeChange(id)}
              className="accent-postman-orange"
            />
            <span className={`text-xs ${bodyType === id ? 'text-postman-text' : 'text-postman-text-muted'}`}>{label}</span>
          </label>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {bodyType === 'none' && (
          <div className="flex items-center justify-center h-full text-xs text-postman-text-dim">
            This request does not have a body
          </div>
        )}
        {bodyType === 'raw' && (
          <CodeMirrorEditor value={bodyContent} onChange={onBodyContentChange} />
        )}
        {bodyType === 'form-data' && (
          <FormDataEditor value={bodyContent} onChange={onBodyContentChange} />
        )}
        {bodyType === 'urlencoded' && (
          <div>
            <p className="px-4 py-2 text-xs text-postman-text-dim border-b border-postman-border">
              URL-encoded body — format: key=value&key2=value2
            </p>
            <textarea
              className="w-full h-40 bg-transparent text-xs font-mono text-postman-text px-4 py-3 outline-none resize-none placeholder:text-postman-text-dim"
              placeholder="key1=value1&key2=value2"
              value={bodyContent}
              onChange={e => onBodyContentChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
