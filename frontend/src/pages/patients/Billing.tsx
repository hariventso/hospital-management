import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, CreditCard, Search, Pencil, Trash2, Loader2, TrendingUp, Eye } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface Patient {
  id: number
  firstName: string
  lastName: string
}

interface Invoice {
  id: number
  patientId: number
  patientName: string
  type: string
  amount: string
  paidAmount: string
  date: string
  status: string
  description: string | null
}

const emptyForm = {
  patientId: '',
  type: 'Consultation',
  amount: '',
  paidAmount: '0',
  date: '',
  status: 'En attente',
  description: '',
}

export default function Billing() {
  const { addToast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewing, setViewing] = useState<Invoice | null>(null)

  const fetchData = async () => {
    try {
      const [iRes, pRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/patients'),
      ])
      const iData = await iRes.json()
      const pData = await pRes.json()
      setInvoices(iData.invoices || [])
      setPatients(pData.patients || [])
    } catch {
      console.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    return (
      inv.patientName?.toLowerCase().includes(q) ||
      inv.type.toLowerCase().includes(q)
    )
  })

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0)
  const pendingAmount = invoices
    .filter((inv) => inv.status !== 'Paye')
    .reduce((sum, inv) => sum + (Number(inv.amount) - Number(inv.paidAmount)), 0)
  const paidInvoices = invoices.filter((inv) => inv.status === 'Paye').length
  const recoveryRate = invoices.length > 0 ? Math.round((paidInvoices / invoices.length) * 100) : 0

  const formatAmount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M AR`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K AR`
    return `${n} AR`
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (inv: Invoice) => {
    setEditing(inv)
    setForm({
      patientId: String(inv.patientId),
      type: inv.type,
      amount: inv.amount,
      paidAmount: inv.paidAmount,
      date: inv.date,
      status: inv.status,
      description: inv.description || '',
    })
    setError('')
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const body = {
      patientId: Number(form.patientId),
      type: form.type,
      amount: Number(form.amount),
      paidAmount: Number(form.paidAmount),
      date: form.date,
      status: form.status,
      description: form.description || null,
    }

    try {
      const url = editing ? `/api/invoices/${editing.id}` : '/api/invoices'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')

      setDialogOpen(false)
      addToast(editing ? 'Facture mise à jour avec succès' : 'Facture créée avec succès', 'success')
      fetchData()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de la facture', 'error')
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette facture ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id))
        addToast('Facture supprimée avec succès', 'success')
      } else {
        addToast('Erreur lors de la suppression de la facture', 'error')
      }
    } catch {
      addToast('Erreur lors de la suppression de la facture', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facturation</h1>
          <p className="text-muted-foreground">Gestion des factures et paiements.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Nouvelle facture
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total ce mois</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(pendingAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux recouvrement</CardTitle>
            <TrendingUp className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recoveryRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher par patient, type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {invoices.length === 0 ? 'Aucune facture.' : 'Aucune facture ne correspond.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{inv.patientName}</p>
                      <p className="text-sm text-muted-foreground">{inv.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-medium">{Number(inv.amount).toLocaleString()} AR</p>
                      {Number(inv.paidAmount) > 0 && (
                        <p className="text-xs text-emerald-600">
                          Paye: {Number(inv.paidAmount).toLocaleString()} AR
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{inv.date}</p>
                    <Badge
                      variant={
                        inv.status === 'Paye'
                          ? 'default'
                          : inv.status === 'Partiel'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {inv.status}
                    </Badge>
                    <Button variant="ghost" size="icon" title="Voir" onClick={() => setViewing(inv)}>
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Modifier" onClick={() => openEdit(inv)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                      disabled={deletingId === inv.id}
                      onClick={() => handleDelete(inv.id)}
                    >
                      {deletingId === inv.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Modifier la facture' : 'Nouvelle facture'}
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient *</label>
              <select
                name="patientId"
                value={form.patientId}
                onChange={handleChange}
                required
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selectionner un patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Consultation</option>
                  <option>Hospitalisation</option>
                  <option>Examen</option>
                  <option>Chirurgie</option>
                  <option>Medicament</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Montant (AR) *</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Montant paye (AR)</label>
                <input
                  type="number"
                  name="paidAmount"
                  value={form.paidAmount}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>En attente</option>
                <option>Paye</option>
                <option>Partiel</option>
                <option>Annule</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Details de la facture..."
                className="min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : editing ? (
                  'Mettre a jour'
                ) : (
                  'Creer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la facture</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Patient :</span> {viewing.patientName}</div>
              <div><span className="font-medium">Type :</span> {viewing.type}</div>
              <div><span className="font-medium">Montant :</span> {Number(viewing.amount).toLocaleString()} AR</div>
              <div><span className="font-medium">Payé :</span> {Number(viewing.paidAmount).toLocaleString()} AR</div>
              <div><span className="font-medium">Date :</span> {viewing.date}</div>
              <div><span className="font-medium">Statut :</span> {viewing.status}</div>
              {viewing.description && <div><span className="font-medium">Description :</span> {viewing.description}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
