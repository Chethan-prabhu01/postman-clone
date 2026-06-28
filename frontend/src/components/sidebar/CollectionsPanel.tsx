'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronDown, FolderOpen, Folder, MoreHorizontal, Pencil, Trash2, FolderPlus } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { collectionsApi, requestsApi } from '@/lib/api'
import { CollectionTree, SavedRequestRaw } from '@/types'
import toast from 'react-hot-toast'

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'text-emerald-400', POST: 'text-orange-400', PUT: 'text-blue-400',
    PATCH: 'text-yellow-400', DELETE: 'text-red-400', HEAD: 'text-purple-400', OPTIONS: 'text-pink-400',
  }
  return <span className={`text-[10px] font-bold font-mono w-10 shrink-0 ${colors[method] ?? 'text-postman-text-muted'}`}>{method}</span>
}

function RequestItem({ req, collectionId, onDeleted }: { req: SavedRequestRaw; collectionId: number; onDeleted: () => void }) {
  const { openTab } = useAppStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleOpen = () => {
    let headers: Array<{ key: string; value: string; enabled: boolean }> = []
    let params: Array<{ key: string; value: string; enabled: boolean }> = []
    let authData: Record<string, string> = {}
    try { headers = JSON.parse(req.headers) } catch { /* ignore */ }
    try { params = JSON.parse(req.params) } catch { /* ignore */ }
    try { authData = JSON.parse(req.auth_data) } catch { /* ignore */ }

    openTab({
      id: req.id,
      name: req.name,
      method: req.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS',
      url: req.url,
      headers: headers.length ? headers : [{ key: '', value: '', enabled: true }],
      params: params.length ? params : [{ key: '', value: '', enabled: true }],
      bodyType: req.body_type as 'none' | 'raw' | 'form-data' | 'urlencoded',
      bodyContent: req.body_content || '',
      authType: req.auth_type as 'none' | 'bearer' | 'basic',
      authData,
      collectionId: req.collection_id,
      folderId: req.folder_id,
      isSaved: true,
    })
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${req.name}"?`)) return
    try {
      await requestsApi.delete(req.id)
      onDeleted()
      toast.success('Request deleted')
    } catch {
      toast.error('Failed to delete')
    }
    setMenuOpen(false)
  }

  return (
    <div className="group relative flex items-center gap-1 px-2 py-1.5 rounded hover:bg-postman-surface cursor-pointer" onClick={handleOpen}>
      <MethodBadge method={req.method} />
      <span className="text-xs text-postman-text-muted group-hover:text-postman-text truncate flex-1">{req.name}</span>
      <button
        onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-postman-border transition-opacity"
      >
        <MoreHorizontal className="w-3 h-3 text-postman-text-muted" />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full mt-0.5 bg-postman-panel border border-postman-border rounded shadow-xl z-50 min-w-32 py-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => { handleOpen(); setMenuOpen(false) }} className="w-full px-3 py-1.5 text-xs text-left text-postman-text-muted hover:text-postman-text hover:bg-postman-surface">Open</button>
          <button onClick={handleDelete} className="w-full px-3 py-1.5 text-xs text-left text-postman-error hover:bg-postman-surface">Delete</button>
        </div>
      )}
    </div>
  )
}

function CollectionItem({ col, onRefresh }: { col: CollectionTree; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(true)
  const [folderExpanded, setFolderExpanded] = useState<Record<number, boolean>>({})
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleFolder = (id: number) => setFolderExpanded(p => ({ ...p, [id]: !p[id] }))

  const handleDelete = async () => {
    if (!confirm(`Delete collection "${col.name}" and all its requests?`)) return
    try {
      await collectionsApi.delete(col.id)
      onRefresh()
      toast.success('Collection deleted')
    } catch {
      toast.error('Failed to delete')
    }
    setMenuOpen(false)
  }

  const handleRename = async () => {
    const name = prompt('New name:', col.name)
    if (!name?.trim() || name === col.name) return
    try {
      await collectionsApi.update(col.id, { name: name.trim() })
      onRefresh()
      toast.success('Renamed')
    } catch {
      toast.error('Failed to rename')
    }
    setMenuOpen(false)
  }

  const handleAddFolder = async () => {
    const name = prompt('Folder name:')
    if (!name?.trim()) return
    try {
      await collectionsApi.createFolder(col.id, { name: name.trim(), collection_id: col.id })
      onRefresh()
      toast.success('Folder created')
    } catch {
      toast.error('Failed to create folder')
    }
    setMenuOpen(false)
  }

  return (
    <div className="select-none relative">
      <div className="group flex items-center gap-1 px-2 py-2 rounded hover:bg-postman-surface cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <span style={{ color: col.color }} className="shrink-0">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </span>
        <FolderOpen className="w-3.5 h-3.5 shrink-0" style={{ color: col.color }} />
        <span className="text-xs font-medium text-postman-text truncate flex-1">{col.name}</span>
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-postman-border"
        >
          <MoreHorizontal className="w-3.5 h-3.5 text-postman-text-muted" />
        </button>
        {menuOpen && (
          <div className="absolute right-2 top-8 bg-postman-panel border border-postman-border rounded shadow-xl z-50 min-w-40 py-1" onClick={e => e.stopPropagation()}>
            <button onClick={handleAddFolder} className="w-full px-3 py-1.5 text-xs text-left text-postman-text-muted hover:text-postman-text hover:bg-postman-surface flex items-center gap-2"><FolderPlus className="w-3 h-3" />Add Folder</button>
            <button onClick={handleRename} className="w-full px-3 py-1.5 text-xs text-left text-postman-text-muted hover:text-postman-text hover:bg-postman-surface flex items-center gap-2"><Pencil className="w-3 h-3" />Rename</button>
            <div className="border-t border-postman-border my-1" />
            <button onClick={handleDelete} className="w-full px-3 py-1.5 text-xs text-left text-postman-error hover:bg-postman-surface flex items-center gap-2"><Trash2 className="w-3 h-3" />Delete</button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="ml-3 border-l border-postman-border pl-2 space-y-0.5">
          {col.requests.map(req => (
            <RequestItem key={req.id} req={req} collectionId={col.id} onDeleted={onRefresh} />
          ))}
          {col.folders.map(folder => (
            <div key={folder.id}>
              <div
                className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-postman-surface cursor-pointer"
                onClick={() => toggleFolder(folder.id)}
              >
                {folderExpanded[folder.id]
                  ? <ChevronDown className="w-3 h-3 text-postman-text-dim" />
                  : <ChevronRight className="w-3 h-3 text-postman-text-dim" />}
                <Folder className="w-3.5 h-3.5 text-postman-text-muted" />
                <span className="text-xs text-postman-text-muted truncate">{folder.name}</span>
              </div>
              {folderExpanded[folder.id] && (
                <div className="ml-3 border-l border-postman-border pl-2 space-y-0.5">
                  {folder.requests.map(req => (
                    <RequestItem key={req.id} req={req} collectionId={col.id} onDeleted={onRefresh} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CollectionsPanel() {
  const { setCollections } = useAppStore()
  const [trees, setTrees] = useState<CollectionTree[]>([])

  const loadTrees = useCallback(async () => {
    try {
      const res = await collectionsApi.list()
      setCollections(res.data)
      const treeResults = await Promise.all(
        res.data.map((c: { id: number }) => collectionsApi.getTree(c.id))
      )
      setTrees(treeResults.map(r => r.data))
    } catch (e) {
      console.error(e)
    }
  }, [setCollections])

  useEffect(() => {
    loadTrees()
  }, [loadTrees])

  if (trees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-postman-text-dim text-xs px-4 text-center">
        <FolderOpen className="w-8 h-8 opacity-30" />
        <p>No collections yet.<br />Click + to create one.</p>
      </div>
    )
  }

  return (
    <div className="p-2 space-y-1">
      {trees.map(col => <CollectionItem key={col.id} col={col} onRefresh={loadTrees} />)}
    </div>
  )
}