'use client'
import { AuthType, AuthData } from '@/types'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const AUTH_TYPES: { id: AuthType; label: string }[] = [
  { id: 'none', label: 'No Auth' },
  { id: 'bearer', label: 'Bearer Token' },
  { id: 'basic', label: 'Basic Auth' },
]

interface Props {
  authType: AuthType
  authData: AuthData
  onAuthTypeChange: (t: AuthType) => void
  onAuthDataChange: (d: AuthData) => void
}

function InputField({ label, value, onChange, secret = false, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; secret?: boolean; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-postman-text-muted">{label}</label>
      <div className="flex items-center gap-2 bg-postman-surface border border-postman-border rounded px-3 py-2 focus-within:border-postman-orange transition-colors">
        <input
          type={secret && !show ? 'password' : 'text'}
          className="flex-1 bg-transparent text-sm text-postman-text placeholder:text-postman-text-dim outline-none font-mono"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {secret && (
          <button type="button" onClick={() => setShow(!show)} className="text-postman-text-dim hover:text-postman-text">
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function AuthEditor({ authType, authData, onAuthTypeChange, onAuthDataChange }: Props) {
  return (
    <div className="flex h-full">
      {/* Auth type list */}
      <div className="w-44 shrink-0 border-r border-postman-border py-2">
        <p className="px-4 py-1 text-[10px] text-postman-text-dim uppercase tracking-wider">Auth Type</p>
        {AUTH_TYPES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onAuthTypeChange(id)}
            className={`w-full px-4 py-2 text-left text-xs transition-colors ${
              authType === id
                ? 'text-postman-orange bg-postman-orange/10'
                : 'text-postman-text-muted hover:text-postman-text hover:bg-postman-surface'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Auth form */}
      <div className="flex-1 p-6">
        {authType === 'none' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xs text-postman-text-muted">This request does not use any authorization.</p>
              <p className="text-xs text-postman-text-dim mt-1">Select an auth type to configure credentials.</p>
            </div>
          </div>
        )}

        {authType === 'bearer' && (
          <div className="max-w-md space-y-4">
            <div>
              <h3 className="text-sm font-medium text-postman-text mb-1">Bearer Token</h3>
              <p className="text-xs text-postman-text-dim mb-4">
                The authorization token will be sent as <code className="bg-postman-surface px-1 rounded text-postman-orange">Authorization: Bearer &lt;token&gt;</code>
              </p>
            </div>
            <InputField
              label="Token"
              value={authData.token || ''}
              onChange={v => onAuthDataChange({ ...authData, token: v })}
              secret
              placeholder="Enter token or {{env_variable}}"
            />
          </div>
        )}

        {authType === 'basic' && (
          <div className="max-w-md space-y-4">
            <div>
              <h3 className="text-sm font-medium text-postman-text mb-1">Basic Authentication</h3>
              <p className="text-xs text-postman-text-dim mb-4">
                Credentials will be Base64 encoded and sent as the <code className="bg-postman-surface px-1 rounded text-postman-orange">Authorization</code> header.
              </p>
            </div>
            <InputField
              label="Username"
              value={authData.username || ''}
              onChange={v => onAuthDataChange({ ...authData, username: v })}
              placeholder="Enter username"
            />
            <InputField
              label="Password"
              value={authData.password || ''}
              onChange={v => onAuthDataChange({ ...authData, password: v })}
              secret
              placeholder="Enter password"
            />
          </div>
        )}
      </div>
    </div>
  )
}
