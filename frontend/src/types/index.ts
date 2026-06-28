export interface KeyValuePair {
  key: string
  value: string
  enabled: boolean
  description?: string
}

export interface AuthData {
  token?: string
  username?: string
  password?: string
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
export type BodyType = 'none' | 'raw' | 'form-data' | 'urlencoded'
export type AuthType = 'none' | 'bearer' | 'basic'

export interface RequestState {
  id?: number
  name: string
  method: HttpMethod
  url: string
  headers: KeyValuePair[]
  params: KeyValuePair[]
  bodyType: BodyType
  bodyContent: string
  authType: AuthType
  authData: AuthData
  collectionId?: number
  folderId?: number
  isSaved?: boolean
  isDirty?: boolean
}

export interface ResponseState {
  status: number
  statusText: string
  timeMs: number
  sizeBytes: number
  headers: Record<string, string>
  body: string
  historyId?: number
}

export interface Collection {
  id: number
  name: string
  description?: string
  color: string
  created_at: string
}

export interface Folder {
  id: number
  name: string
  collection_id: number
  created_at: string
}

export interface SavedRequest {
  id: number
  name: string
  method: string
  url: string
  headers: string
  params: string
  body_type: string
  body_content?: string
  auth_type: string
  auth_data: string
  collection_id?: number
  folder_id?: number
  created_at: string
}

export interface CollectionTree {
  id: number
  name: string
  description?: string
  color: string
  folders: FolderTree[]
  requests: SavedRequestRaw[]
}

export interface FolderTree {
  id: number
  name: string
  requests: SavedRequestRaw[]
}

export interface SavedRequestRaw {
  id: number
  name: string
  method: string
  url: string
  headers: string
  params: string
  body_type: string
  body_content?: string
  auth_type: string
  auth_data: string
  folder_id?: number
  collection_id?: number
}

export interface Environment {
  id: number
  name: string
  is_active: boolean
  variables: EnvironmentVariable[]
  created_at: string
}

export interface EnvironmentVariable {
  id: number
  key: string
  value?: string
  is_secret: boolean
  enabled: boolean
}

export interface HistoryEntry {
  id: number
  method: string
  url: string
  headers: string
  params: string
  body_type: string
  body_content?: string
  auth_type: string
  auth_data: string
  response_status?: number
  response_time?: number
  response_size?: number
  response_headers: string
  response_body?: string
  created_at: string
}

export interface Tab {
  id: string
  label: string
  requestState: RequestState
  response?: ResponseState
  loading?: boolean
}
