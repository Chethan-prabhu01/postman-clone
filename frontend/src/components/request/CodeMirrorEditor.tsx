'use client'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'

interface Props {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  height?: string
}

const customTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent' },
  '.cm-content': { padding: '12px 16px' },
  '.cm-gutters': { backgroundColor: '#1E1E2E', borderRight: '1px solid #3A3A4D', color: '#6A6A80' },
  '.cm-activeLineGutter': { backgroundColor: '#252535' },
  '.cm-activeLine': { backgroundColor: '#252535' },
  '.cm-selectionBackground': { backgroundColor: '#FF6C3730 !important' },
  '.cm-focused .cm-selectionBackground': { backgroundColor: '#FF6C3730 !important' },
})

export default function CodeMirrorEditor({ value, onChange, readOnly = false, height = '100%' }: Props) {
  return (
    <div className="h-full overflow-auto bg-postman-darker">
      <CodeMirror
        value={value}
        height={height}
        theme={[oneDark, customTheme]}
        extensions={[json()]}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          autocompletion: true,
          bracketMatching: true,
          closeBrackets: true,
        }}
      />
    </div>
  )
}
