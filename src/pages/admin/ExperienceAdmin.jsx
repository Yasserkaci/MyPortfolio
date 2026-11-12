import { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash, Eye, EyeSlash } from '@phosphor-icons/react'
import { supabase } from '../../lib/supabase'
import { fetchExperience } from '../../lib/data'
import { SortableList, ConfirmButton, Field, Input, Textarea, TagInput, Toggle, useToast } from '../../components/admin/ui'

const EMPTY = { company: '', role: '', location: '', period_start: '', period_end: '', description: '', highlights: [], url: '', published: true }

export default function ExperienceAdmin() {
  const [items, setItems] = useState(null)
  const [edit, setEdit] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const load = () => fetchExperience({ all: true }).then(setItems).catch((e) => toast(e.message, 'error'))
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async (e) => {
    e.preventDefault()
    if (!edit.company.trim() || !edit.role.trim()) return toast('Company and role are required', 'error')
    setBusy(true)
    const payload = { ...edit }
    delete payload.id
    delete payload.created_at
    const res = edit.id
      ? await supabase.from('experience').update(payload).eq('id', edit.id)
      : await supabase.from('experience').insert({ ...payload, sort_order: items.length })
    setBusy(false)
    if (res.error) return toast(res.error.message, 'error')
    toast('Saved')
    setEdit(null)
    load()
  }

  const remove = async (id) => {
    const { error } = await supabase.from('experience').delete().eq('id', id)
    if (error) return toast(error.message, 'error')
    setItems((l) => l.filter((x) => x.id !== id))
  }

  const reorder = async (next) => {
    setItems(next)
    await Promise.all(next.map((x, i) => supabase.from('experience').update({ sort_order: i }).eq('id', x.id)))
    toast('Order saved')
  }

  const toggle = async (x) => {
    setItems((l) => l.map((i) => (i.id === x.id ? { ...i, published: !x.published } : i)))
    await supabase.from('experience').update({ published: !x.published }).eq('id', x.id)
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Experience</h1>
          <p>Jobs, freelance work, education. Drag to reorder the timeline.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setEdit({ ...EMPTY })}>
          <Plus size={16} weight="bold" /> Add entry
        </button>
      </div>

      {edit && (
        <form className="panel" onSubmit={save} style={{ marginBottom: 24 }}>
          <h2>{edit.id ? 'Edit entry' : 'New entry'}</h2>
          <div className="form">
            <div className="grid-2">
              <Field label="Role" htmlFor="x-role">
                <Input id="x-role" value={edit.role} onChange={(v) => setEdit({ ...edit, role: v })} placeholder="Full-stack developer" />
              </Field>
              <Field label="Company" htmlFor="x-company">
                <Input id="x-company" value={edit.company} onChange={(v) => setEdit({ ...edit, company: v })} />
              </Field>
            </div>
            <div className="grid-3">
              <Field label="From" htmlFor="x-from">
                <Input id="x-from" value={edit.period_start} onChange={(v) => setEdit({ ...edit, period_start: v })} placeholder="2024" />
              </Field>
              <Field label="To" htmlFor="x-to">
                <Input id="x-to" value={edit.period_end} onChange={(v) => setEdit({ ...edit, period_end: v })} placeholder="Present" />
              </Field>
              <Field label="Location" htmlFor="x-loc">
                <Input id="x-loc" value={edit.location} onChange={(v) => setEdit({ ...edit, location: v })} placeholder="Remote" />
              </Field>
            </div>
            <Field label="Description" htmlFor="x-desc">
              <Textarea id="x-desc" value={edit.description} onChange={(v) => setEdit({ ...edit, description: v })} rows={3} />
            </Field>
            <Field label="Highlights" hint="Short wins, shown as chips.">
              <TagInput value={edit.highlights || []} onChange={(v) => setEdit({ ...edit, highlights: v })} />
            </Field>
            <Field label="Company URL" htmlFor="x-url">
              <Input id="x-url" value={edit.url} onChange={(v) => setEdit({ ...edit, url: v })} placeholder="https://" />
            </Field>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <Toggle checked={edit.published} onChange={(v) => setEdit({ ...edit, published: v })} label="Visible" />
              <span style={{ flex: 1 }} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      )}

      {items === null ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : items.length === 0 ? (
        <div className="empty">No entries yet.</div>
      ) : (
        <SortableList
          items={items}
          getId={(x) => x.id}
          onReorder={reorder}
          render={(x) => (
            <>
              <div className="row-main">
                <b>
                  {x.role} at {x.company}
                </b>
                <span>
                  {x.period_start}
                  {x.period_end ? ` to ${x.period_end}` : ''} {x.location ? ` (${x.location})` : ''}
                </span>
              </div>
              <div className="row-actions">
                <button className="icon-btn" onClick={() => toggle(x)} title={x.published ? 'Hide' : 'Show'}>
                  {x.published ? <Eye size={18} /> : <EyeSlash size={18} />}
                </button>
                <button className="icon-btn" onClick={() => setEdit({ ...EMPTY, ...x })} title="Edit">
                  <PencilSimple size={18} />
                </button>
                <ConfirmButton onConfirm={() => remove(x.id)}>
                  <Trash size={18} />
                </ConfirmButton>
              </div>
            </>
          )}
        />
      )}
    </>
  )
}
