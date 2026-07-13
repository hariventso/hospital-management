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
import { Plus, BedDouble, Clock, CheckCircle, Pencil, Trash2, Loader2, Eye } from 'lucide-react'

interface Patient {
  id: number
  firstName: string
  lastName: string
}

interface Hospitalization {
  id: number
  patientId: number
  patientName: string
  ward: string
  room: string
  admissionDate: string
  dischargeDate: string | null
  status: string
  reason: string | null
  notes: string | null
}

const emptyForm = {
  patientId: '',
  ward: '',
  room: '',
  admissionDate: '',
  dischargeDate: '',
  status: 'En cours',
  reason: '',
  notes: '',
}

export default function Hospitalizations() {
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Hospitalization | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewing, setViewing] = useState<Hospitalization | null>(null)

  const fetchData = async () => {
    try {
      const [hRes, pRes] = await Promise.all([
        fetch('/api/hospitalizations'),
        fetch('/api/patients'),
      ])
      const hData = await hRes.json()
      const pData = await pRes.json()
      setHospitalizations(hData.hospitalizations || [])
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

  const today = new Date().toISOString().split('T')[0]
  const activeCount = hospitalizations.filter((h) => h.status === 'En cours').length
  const todayAdmissions = hospitalizations.filter((h) => h.admissionDate === today).length
  const todayDischarges = hospitalizations.filter((h) => h.dischargeDate === today).length

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (h: Hospitalization) => {
    setEditing(h)
    setForm({
      patientId: String(h.patientId),
      ward: h.ward,
      room: h.room,
      admissionDate: h.admissionDate,
      dischargeDate: h.dischargeDate || '',
      status: h.status,
      reason: h.reason || '',
      notes: h.notes || '',
    })
    setError('')
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const body: Record<string, unknown> = {
      patientId: Number(form.patientId),
      ward: form.ward,
      room: form.room,
      admissionDate: form.admissionDate,
      status: form.status,
      reason: form.reason || null,
      notes: form.notes || null,
    }
    if (form.dischargeDate) {
      body.dischargeDate = form.dischargeDate
    }

    try {
      const url = editing ? `/api/hospitalizations/${editing.id}` : '/api/hospitalizations'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')

      setDialogOpen(false)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette hospitalisation ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/hospitalizations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setHospitalizations((prev) => prev.filter((h) => h.id !== id))
      }
    } catch {
      console.error('Erreur')
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
          <h1 className="text-2xl font-bold">Hospitalisations</h1>
          <p className="text-muted-foreground">Suivi des hospitalisations en cours.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Nouvelle hospitalisation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En cours</CardTitle>
            <BedDouble className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admissions aujourd'hui</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAdmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sorties aujourd'hui</CardTitle>
            <CheckCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayDischarges}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hospitalisations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : hospitalizations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Aucune hospitalisation.</div>
          ) : (
            <div className="space-y-3">
              {hospitalizations.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <BedDouble className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{h.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        Service {h.ward} - Chambre {h.room}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">Admission: {h.admissionDate}</p>
                      {h.dischargeDate && (
                        <p className="text-sm text-muted-foreground">Sortie: {h.dischargeDate}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        h.status === 'En cours'
                          ? 'default'
                          : h.status === 'Sorti'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {h.status}
                    </Badge>
                    <Button variant="ghost" size="icon" title="Voir" onClick={() => setViewing(h)}>
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Modifier" onClick={() => openEdit(h)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                      disabled={deletingId === h.id}
                      onClick={() => handleDelete(h.id)}
                    >
                      {deletingId === h.id ? (
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
              {editing ? "Modifier l'hospitalisation" : 'Nouvelle hospitalisation'}
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
                <label className="text-sm font-medium">Service *</label>
                <select
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selectionner</option>
                  <option>Cardiologie</option>
                  <option>Pediatrie</option>
                  <option>Orthopedie</option>
                  <option>Neurologie</option>
                  <option>Oncologie</option>
                  <option>Chirurgie</option>
                  <option>Urgence</option>
                  <option>Reanimation</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chambre *</label>
                <input
                  name="room"
                  value={form.room}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 201"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date d'admission *</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={form.admissionDate}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de sortie</label>
                <input
                  type="date"
                  name="dischargeDate"
                  value={form.dischargeDate}
                  onChange={handleChange}
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
                <option>En cours</option>
                <option>Sorti</option>
                <option>Transfere</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Motif</label>
              <input
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Motif de l'hospitalisation"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
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
            <DialogTitle>Détails de l'hospitalisation</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Patient :</span> {viewing.patientName}</div>
              <div><span className="font-medium">Service :</span> {viewing.ward}</div>
              <div><span className="font-medium">Chambre :</span> {viewing.room}</div>
              <div><span className="font-medium">Admission :</span> {viewing.admissionDate}</div>
              {viewing.dischargeDate && <div><span className="font-medium">Sortie :</span> {viewing.dischargeDate}</div>}
              <div><span className="font-medium">Statut :</span> {viewing.status}</div>
              {viewing.reason && <div><span className="font-medium">Motif :</span> {viewing.reason}</div>}
              {viewing.notes && <div><span className="font-medium">Notes :</span> {viewing.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
