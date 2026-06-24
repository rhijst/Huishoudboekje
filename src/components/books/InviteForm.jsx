import { useState } from 'react'
import { findUserByEmail } from '../../services/userService'
import { addMember, removeMember } from '../../services/bookService'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

export function InviteForm({ book }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleInvite(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const invitedUser = await findUserByEmail(email)
      if (!invitedUser) {
        setError('Geen gebruiker gevonden met dit e-mailadres')
        return
      }
      if (book.memberIds.includes(invitedUser.id)) {
        setError('Deze gebruiker is al lid')
        return
      }
      await addMember(book.id, invitedUser.id)
      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(memberId) {
    if (memberId === book.ownerId) return
    if (window.confirm('Deelnemer verwijderen?')) {
      await removeMember(book.id, memberId)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleInvite} className="flex gap-2">
        <Input
          placeholder="E-mailadres uitnodigen"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="flex-1"
          error={error}
        />
        <Button type="submit" disabled={loading} className="shrink-0">
          Uitnodigen
        </Button>
      </form>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deelnemers ({book.memberIds.length})</p>
        {book.memberIds.map((id) => (
          <div key={id} className="flex items-center justify-between py-1">
            <span className="text-sm text-slate-700 font-mono">{id.slice(0, 12)}…</span>
            <div className="flex items-center gap-2">
              {id === book.ownerId && <Badge color="indigo">Eigenaar</Badge>}
              {id !== book.ownerId && (
                <Button
                  variant="ghost"
                  className="text-red-500 text-xs px-2 py-1"
                  onClick={() => handleRemove(id)}
                >
                  Verwijderen
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}