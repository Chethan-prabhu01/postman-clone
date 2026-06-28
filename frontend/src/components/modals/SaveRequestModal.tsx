'use client'
import { useState, useEffect, useCallback } from 'react'
import { X, FolderOpen } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { collectionsApi, requestsApi } from '@/lib/api'
import { Tab, CollectionTree } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  tab: Tab
  onClose: () => void
}

export default function SaveRequestModal({ tab, onClose }: Props) {
  const { setCollections, updateRequest } = useAppStore()
  const [trees, setTrees] = useState<CollectionTree[]>([])
  const [name, setName] = useState(tab.requestState.name || 'Untitled Request')
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(
    tab.requestState.collectionId ?? null
  )
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(
    tab.requestState.folderId ?? null
  )
  const [saving, setSaving] = useState(false)

  const loadCollections = useCallback(async () => {
    const res = await collectionsApi.list()
    setCollections(res.data)
    const treeResults = await Promise.all(
      res.data.map((c: { id: number }) => collectionsApi.getTree(c.id))
    )
    setTrees(treeResults.map(r => r.data))
  }, [setCollections])

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  const selectedCollection = trees.find(t => t.id === selectedCollectionId)

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Request name is required'); return }
    if (!selectedCollectionId) { toast.error('Please select a collection'); return }
    setSaving(true)
    try {
      const req = tab.requestState
      const payload = {
        name: name.trim(),
        method: req.method,
        url: req.url,
        headers: req.headers.filter(h => h.key),
        params: req.params.filter(p => p.key),
        body_type: req.bodyType,
        body_content: req.bodyContent || null,
        auth_type: req.authType,
        auth_data: req.authData,
        collection_id: selectedCollectionId,
        folder_id: selectedFolderId || null,
      }
      if (req.id && req.isSaved) {
        await requestsApi.update(req.id, payload)
        toast.success('Request updated')
      } else {
        const res = await requestsApi.create(payload)
        updateRequest(tab.id, {
          id: res.data.id,
          name: name.trim(),
          isSaved: true,
          collectionId: selectedCollectionId,
          folderId: selectedFolderId ?? undefined,
        })
        toast.success('Request saved')
      }
      onClose()
    } catch {
      toast.error('Failed to save request')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-postman-panel border border-postman-border rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-postman-border">
          <h2 className="text-sm font-semibold text-postman-text">Save Request</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-postman-surface text-postman-text-muted hover:text-postman-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-postman-text-muted mb-1.5">Request Name</label>
            <input
              autoFocus
              className="w-full bg-postman-surface border border-postman-border rounded-lg px-3 py-2 text-sm text-postman-text placeholder:text-postman-text-dim outline-none focus:border-postman-orange transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="My API Request"
            />
          </div>

          <div>
            <label className="block text-xs text-postman-text-muted mb-1.5">Collection</label>
            <div className="space-y-1 max-h-40 overflow-y-auto border border-postman-border rounded-lg">
              {trees.length === 0 ? (
                <p className="px-3 py-3 text-xs text-postman-text-dim text-center">No collections. Create one first.</p>
              ) : (
                trees.map(col => (
                  <button
                    key={col.id}
                    onClick={() => { setSelectedCollectionId(col.id); setSelectedFolderId(null) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                      selectedCollectionId === col.id
                        ? 'bg-postman-orange/10 text-postman-text'
                        : 'text-postman-text-muted hover:bg-postman-surface hover:text-postman-text'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5 shrink-0" style={{ color: col.color }} />
                    {col.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedCollection && selectedCollection.folders.length > 0 && (
            <div>
              <label className="block text-xs text-postman-text-muted mb-1.5">Folder (optional)</label>
              <div className="space-y-1 max-h-32 overflow-y-auto border border-postman-border rounded-lg">
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                    selectedFolderId === null ? 'bg-postman-orange/10 text-postman-text' : 'text-postman-text-muted hover:bg-postman-surface'
                  }`}
                >
                  / (root)
                </button>
                {selectedCollection.folders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                      selectedFolderId === f.id ? 'bg-postman-orange/10 text-postman-text' : 'text-postman-text-muted hover:bg-postman-surface'
                    }`}
                  >
                    📁 {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-postman-border">
          <button onClick={onClose} className="px-4 py-2 text-xs rounded-lg border border-postman-border text-postman-text-muted hover:text-postman-text hover:border-postman-border-light transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs rounded-lg bg-postman-orange hover:bg-postman-orange-dark text-white font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Request'}
          </button>
        </div>
      </div>
    </div>
  )
}