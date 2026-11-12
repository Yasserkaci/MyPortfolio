import { useEffect, useState } from 'react'
import { Trash, EnvelopeSimpleOpen, EnvelopeSimple, ArrowBendUpLeft } from '@phosphor-icons/react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import { ConfirmButton, useToast } from '../../components/admin/ui'

export default function MessagesAdmin() {
  const [items, setItems] = useState(null)
  const toast = useToast()

  const load = () =>
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => (error ? toast(error.message, 'error') : setItems(data)))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mark = async (m, read) => {
    setItems((l) => l.map((x) => (x.id === m.id ? { ...x, read } : x)))
    await supabase.from('messages').update({ read }).eq('id', m.id)
  }

  const remove = async (id) => {
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (error) return toast(error.message, 'error')
    setItems((l) => l.filter((x) => x.id !== id))
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Messages</h1>
          <p>Sent from the contact form on your site.</p>
        </div>
      </div>
      {items === null ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : items.length === 0 ? (
        <div className="empty">No messages yet.</div>
      ) : (
        <div className="list">
          {items.map((m) => (
            <article className={`msg ${m.read ? '' : 'unread'}`} key={m.id}>
              <div className="msg-head">
                <div>
                  <b>{m.name}</b> <span className="muted">&lt;{m.email}&gt;</span>
                </div>
                <span className="muted" style={{ fontSize: '0.85rem' }}>
                  {formatDate(m.created_at)}
                </span>
              </div>
              <p className="msg-body">{m.body}</p>
              <div className="row-actions">
                <a className="btn btn-ghost btn-sm" href={`mailto:${m.email}?subject=Re: your message`}>
                  <ArrowBendUpLeft size={14} /> Reply
                </a>
                <button className="icon-btn" onClick={() => mark(m, !m.read)} title={m.read ? 'Mark unread' : 'Mark read'}>
                  {m.read ? <EnvelopeSimple size={18} /> : <EnvelopeSimpleOpen size={18} />}
                </button>
                <ConfirmButton onConfirm={() => remove(m.id)}>
                  <Trash size={18} />
                </ConfirmButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
