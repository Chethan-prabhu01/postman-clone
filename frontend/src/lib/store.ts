import { create } from 'zustand'
import { Tab, RequestState, ResponseState, Environment, Collection, HistoryEntry } from '@/types'

const DEFAULT_REQUEST: RequestState = {
  name: 'Untitled Request',
  method: 'GET',
  url: '',
  headers: [{ key: '', value: '', enabled: true }],
  params: [{ key: '', value: '', enabled: true }],
  bodyType: 'none',
  bodyContent: '',
  authType: 'none',
  authData: {},
}

function makeTab(overrides: Partial<RequestState> = {}): Tab {
  return {
    id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: overrides.name || 'Untitled Request',
    requestState: { ...DEFAULT_REQUEST, ...overrides },
  }
}

interface AppStore {
  // Tabs
  tabs: Tab[]
  activeTabId: string | null
  openTab: (request?: Partial<RequestState>) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTab: (id: string, updates: Partial<Tab>) => void
  updateRequest: (id: string, updates: Partial<RequestState>) => void
  setTabResponse: (id: string, response: ResponseState) => void
  setTabLoading: (id: string, loading: boolean) => void

  // Environments
  environments: Environment[]
  activeEnvironmentId: number | null
  setEnvironments: (envs: Environment[]) => void
  setActiveEnvironment: (id: number | null) => void

  // Collections
  collections: Collection[]
  setCollections: (cols: Collection[]) => void

  // History
  history: HistoryEntry[]
  setHistory: (entries: HistoryEntry[]) => void
  prependHistory: (entry: HistoryEntry) => void

  // Sidebar
  sidebarTab: 'collections' | 'history' | 'environments'
  setSidebarTab: (tab: 'collections' | 'history' | 'environments') => void
}

export const useAppStore = create<AppStore>((set, get) => {
  const initialTab = makeTab()
  return {
    // Tabs
    tabs: [initialTab],
    activeTabId: initialTab.id,

    openTab: (request = {}) => {
      const tab = makeTab(request)
      set(s => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
    },

    closeTab: (id) => {
      const { tabs, activeTabId } = get()
      const remaining = tabs.filter(t => t.id !== id)
      if (remaining.length === 0) {
        const newTab = makeTab()
        set({ tabs: [newTab], activeTabId: newTab.id })
        return
      }
      let newActive = activeTabId
      if (activeTabId === id) {
        const idx = tabs.findIndex(t => t.id === id)
        newActive = (remaining[idx] || remaining[idx - 1] || remaining[0]).id
      }
      set({ tabs: remaining, activeTabId: newActive })
    },

    setActiveTab: (id) => set({ activeTabId: id }),

    updateTab: (id, updates) => set(s => ({
      tabs: s.tabs.map(t => t.id === id ? { ...t, ...updates } : t),
    })),

    updateRequest: (id, updates) => set(s => ({
      tabs: s.tabs.map(t =>
        t.id === id
          ? {
              ...t,
              label: updates.name ?? t.label,
              requestState: { ...t.requestState, ...updates },
            }
          : t
      ),
    })),

    setTabResponse: (id, response) => set(s => ({
      tabs: s.tabs.map(t => t.id === id ? { ...t, response, loading: false } : t),
    })),

    setTabLoading: (id, loading) => set(s => ({
      tabs: s.tabs.map(t => t.id === id ? { ...t, loading } : t),
    })),

    // Environments
    environments: [],
    activeEnvironmentId: null,
    setEnvironments: (envs) => {
      const active = envs.find(e => e.is_active)
      set({ environments: envs, activeEnvironmentId: active?.id ?? null })
    },
    setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),

    // Collections
    collections: [],
    setCollections: (cols) => set({ collections: cols }),

    // History
    history: [],
    setHistory: (entries) => set({ history: entries }),
    prependHistory: (entry) => set(s => ({ history: [entry, ...s.history] })),

    // Sidebar
    sidebarTab: 'collections',
    setSidebarTab: (tab) => set({ sidebarTab: tab }),
  }
})
