import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { X, UploadSimple, DotsSixVertical } from '@phosphor-icons/react'
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { uploadMedia } from '../../lib/supabase'
import { cx } from '../../lib/utils'

/* ---------------- Toasts ---------------- */
const ToastCtx = createContext(() => {})

export function ToastProvider({ children }) {
  const [list, setList] = useState([])
  const push = useCallback((msg, type = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setList((l) => [...l, { id, msg, type }])
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {list.map((t) => (
          <div className={cx('toast', t.type === 'error' && 'error')} key={t.id}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)

/* ---------------- Fields ---------------- */
export function Field({ label, hint, children, htmlFor }) {
  return (
    <div className="field">
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

export function Input({ value, onChange, ...rest }) {
  return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
}

export function Textarea({ value, onChange, rows = 4, ...rest }) {
  return <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={rows} style={{ minHeight: 0 }} {...rest} />
}

export function Select({ value, onChange, options, ...rest }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" className={cx('toggle', checked && 'on')} onClick={() => onChange(!checked)} role="switch" aria-checked={!!checked}>
      <i />
      {label && <span>{label}</span>}
    </button>
  )
}

export function ColorField({ value, onChange }) {
  return (
    <div className="color-field">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} aria-label="Pick color" />
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function TagInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const parts = draft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))])
    setDraft('')
  }
  return (
    <div className="tag-input" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
      {value.map((t, i) => (
        <span className="tag" key={t + i}>
          {t}
          <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        placeholder={value.length ? '' : placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add()
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={add}
      />
    </div>
  )
}

/* ---------------- Image upload ---------------- */
export function ImageField({ value, onChange, folder = 'images', square = false, label = 'Image' }) {
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)
  const toast = useToast()

  const pick = async (file) => {
    if (!file) return
    setBusy(true)
    try {
      const url = await uploadMedia(file, folder)
      onChange(url)
      toast('Uploaded')
    } catch (e) {
      toast(e.message || 'Upload failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="image-field">
      <div
        className={cx('image-preview', square && 'square')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          pick(e.dataTransfer.files?.[0])
        }}
      >
        {value ? <img src={value} alt="" /> : busy ? 'Uploading…' : `Drop ${label.toLowerCase()} here or upload`}
      </div>
      <div className="image-row">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()} disabled={busy}>
          <UploadSimple size={16} /> {busy ? 'Uploading…' : 'Upload'}
        </button>
        {value && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
            Remove
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="or paste an image URL" />
    </div>
  )
}

/* ---------------- Sortable list ---------------- */
function SortableRow({ id, children, className }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className={cx(className || 'row', isDragging && 'dragging')}>
      <button type="button" className="row-handle" aria-label="Drag to reorder" {...attributes} {...listeners}>
        <DotsSixVertical size={18} />
      </button>
      {children}
    </div>
  )
}

export function SortableList({ items, getId, onReorder, render, rowClass }) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const ids = useMemo(() => items.map(getId), [items, getId])
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return
        const from = ids.indexOf(active.id)
        const to = ids.indexOf(over.id)
        onReorder(arrayMove(items, from, to))
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="list">
          {items.map((it, i) => (
            <SortableRow id={getId(it)} key={getId(it)} className={rowClass}>
              {render(it, i)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

/* ---------------- Confirm ---------------- */
export function ConfirmButton({ onConfirm, children, className = 'icon-btn danger', label = 'Delete' }) {
  const [arm, setArm] = useState(false)
  if (arm)
    return (
      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <button type="button" className="btn btn-sm btn-primary" onClick={onConfirm}>
          Confirm
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setArm(false)}>
          Cancel
        </button>
      </span>
    )
  return (
    <button type="button" className={className} onClick={() => setArm(true)} aria-label={label} title={label}>
      {children}
    </button>
  )
}
