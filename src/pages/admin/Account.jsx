import { useState } from 'react'
import { useAuth } from '../../lib/auth'
import { Field, Input, useToast } from '../../components/admin/ui'

export default function Account() {
  const { user, updatePassword, signOut } = useAuth()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const submit = async (e) => {
    e.preventDefault()
    if (pw.length < 8) return toast('Use at least 8 characters', 'error')
    if (pw !== pw2) return toast('Passwords do not match', 'error')
    setBusy(true)
    const { error } = await updatePassword(pw)
    setBusy(false)
    if (error) return toast(error.message, 'error')
    toast('Password updated')
    setPw('')
    setPw2('')
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Account</h1>
          <p>Signed in as {user?.email}</p>
        </div>
      </div>
      <form className="panel" onSubmit={submit} style={{ maxWidth: 520 }}>
        <h2>Change password</h2>
        <div className="form">
          <Field label="New password" htmlFor="pw">
            <Input id="pw" type="password" value={pw} onChange={setPw} autoComplete="new-password" />
          </Field>
          <Field label="Repeat new password" htmlFor="pw2">
            <Input id="pw2" type="password" value={pw2} onChange={setPw2} autoComplete="new-password" />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Update password'}
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
