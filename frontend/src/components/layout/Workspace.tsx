'use client'
import { useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import TopBar from './TopBar'
import Sidebar from '../sidebar/Sidebar'
import RequestTabs from '../request/RequestTabs'
import RequestBuilder from '../request/RequestBuilder'
import ResponseViewer from '../response/ResponseViewer'
import { useAppStore } from '@/lib/store'
import { collectionsApi, environmentsApi, historyApi } from '@/lib/api'

export default function Workspace() {
  const { setCollections, setEnvironments, setHistory, tabs, activeTabId } = useAppStore()

  useEffect(() => {
    const load = async () => {
      try {
        const [cols, envs, hist] = await Promise.all([
          collectionsApi.list(),
          environmentsApi.list(),
          historyApi.list(),
        ])
        setCollections(cols.data)
        setEnvironments(envs.data)
        setHistory(hist.data)
      } catch (e) {
        console.error('Failed to load initial data', e)
      }
    }
    load()
  }, [])

  const activeTab = tabs.find(t => t.id === activeTabId)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Sidebar */}
          <Panel defaultSize={20} minSize={15} maxSize={35}>
            <Sidebar />
          </Panel>

          <PanelResizeHandle className="w-px bg-postman-border hover:bg-postman-orange transition-colors duration-150 cursor-col-resize" />

          {/* Main area */}
          <Panel defaultSize={80}>
            <div className="flex flex-col h-full overflow-hidden">
              {/* Tabs */}
              <RequestTabs />

              {activeTab ? (
                <PanelGroup direction="vertical" className="flex-1 overflow-hidden">
                  {/* Request builder */}
                  <Panel defaultSize={55} minSize={25}>
                    <RequestBuilder tab={activeTab} />
                  </Panel>

                  <PanelResizeHandle className="h-px bg-postman-border hover:bg-postman-orange transition-colors duration-150 cursor-row-resize" />

                  {/* Response viewer */}
                  <Panel defaultSize={45} minSize={20}>
                    <ResponseViewer tab={activeTab} />
                  </Panel>
                </PanelGroup>
              ) : (
                <div className="flex-1 flex items-center justify-center text-postman-text-dim text-sm">
                  No request open
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
