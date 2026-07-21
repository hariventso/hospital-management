import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pill, Search, Pencil, Trash2, Loader2, Eye } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface Patient {
  id: number
  firstName: string
  lastName: string
}

interface Prescription {
  id: number
  patientId: number
  patientName: string
  medication: string
  dosage: string
  duration: string
  doctor: string
  date: string
  status: string
  instructions: string | null
}

const emptyForm = {
  patientId: '',
  medication: '',
  dosage: '',
  duration: '',
  doctor: '',
  date: '',
  status: 'Active',
  instructions: '',
}

export default function Prescriptions() {
  const { addToast } = useToast()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Prescription | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewing, setViewing] = useState<Prescription | null>(null)

  const fetchData = async () => {
    try {
      const [rxRes, pRes] = await Promise.all([
        fetch('/api/prescriptions'),
        fetch('/api/patients'),
      ])
      const rxData = await rxRes.json()
      const pData = await pRes.json()
      setPrescriptions(rxData.prescriptions || [])
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

  const filtered = prescriptions.filter((rx) => {
    const q = search.toLowerCase()
    return (
      rx.patientName?.toLowerCase().includes(q) ||
      rx.medication.toLowerCase().includes(q) ||
      rx.doctor.toLowerCase().includes(q)
    )
  })

  const activeCount = prescriptions.filter((rx) => rx.status === 'Active').length
  const finishedCount = prescriptions.filter((rx) => rx.status === 'Terminee').length

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (rx: Prescription) => {
    setEditing(rx)
    setForm({
      patientId: String(rx.patientId),
      medication: rx.medication,
      dosage: rx.dosage,
      duration: rx.duration,
      doctor: rx.doctor,
      date: rx.date,
      status: rx.status,
      instructions: rx.instructions || '',
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
      medication: form.medication,
      dosage: form.dosage,
      duration: form.duration,
      doctor: form.doctor,
      date: form.date,
      status: form.status,
      instructions: form.instructions || null,
    }

    try {
      const url = editing ? `/api/prescriptions/${editing.id}` : '/api/prescriptions'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')

      setDialogOpen(false)
      addToast(editing ? 'Prescription mise à jour avec succès' : 'Prescription créée avec succès', 'success')
      fetchData()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de la prescription', 'error')
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette prescription ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/prescriptions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPrescriptions((prev) => prev.filter((rx) => rx.id !== id))
        addToast('Prescription supprimée avec succès', 'success')
      } else {
        addToast('Erreur lors de la suppression de la prescription', 'error')
      }
    } catch {
      addToast('Erreur lors de la suppression de la prescription', 'error')
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
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">Gerez les prescriptions medicamenteuses.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Nouvelle prescription
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actives</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
              <Pill className="size-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terminees</p>
                <p className="text-2xl font-bold">{finishedCount}</p>
              </div>
              <Pill className="size-8 text-muted-foreground" />
            </div>
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
                placeholder="Rechercher par patient, medicament, medecin..."
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
              {prescriptions.length === 0 ? 'Aucune prescription.' : 'Aucune prescription ne correspond.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((rx) => (
                <div
                  key={rx.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <Pill className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{rx.medication}</p>
                      <p className="text-sm text-muted-foreground">
                        {rx.patientName} - {rx.dosage} - {rx.duration}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rx.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{rx.date}</p>
                    <Badge variant={rx.status === 'Active' ? 'default' : 'secondary'}>
                      {rx.status}
                    </Badge>
                    <Button variant="ghost" size="icon" title="Voir" onClick={() => setViewing(rx)}>
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Modifier" onClick={() => openEdit(rx)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                      disabled={deletingId === rx.id}
                      onClick={() => handleDelete(rx.id)}
                    >
                      {deletingId === rx.id ? (
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
              {editing ? 'Modifier la prescription' : 'Nouvelle prescription'}
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Medicament *</label>
              <input
                name="medication"
                value={form.medication}
                onChange={handleChange}
                required
                placeholder="Ex: Amoxicilline 500mg"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dosage *</label>
                <input
                  name="dosage"
                  value={form.dosage}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 3x/jour"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duree *</label>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 7 jours"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Medecin *</label>
                <input
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  required
                  placeholder="Dr. ..."
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Active</option>
                <option>Terminee</option>
                <option>Annulee</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instructions</label>
              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                placeholder="Instructions speciales..."
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
            <DialogTitle>Détails de la prescription</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Patient :</span> {viewing.patientName}</div>
              <div><span className="font-medium">Médicament :</span> {viewing.medication}</div>
              <div><span className="font-medium">Dosage :</span> {viewing.dosage}</div>
              <div><span className="font-medium">Durée :</span> {viewing.duration}</div>
              <div><span className="font-medium">Médecin :</span> {viewing.doctor}</div>
              <div><span className="font-medium">Date :</span> {viewing.date}</div>
              <div><span className="font-medium">Statut :</span> {viewing.status}</div>
              {viewing.instructions && <div><span className="font-medium">Instructions :</span> {viewing.instructions}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
