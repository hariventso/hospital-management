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
import { Plus, Calendar, Clock, User, Pencil, Trash2, Loader2, Eye } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface Patient {
  id: number
  firstName: string
  lastName: string
}

interface Appointment {
  id: number
  patientId: number
  patientName: string
  doctor: string
  type: string
  date: string
  time: string
  status: string
  notes: string | null
}

const emptyForm = {
  patientId: '',
  doctor: '',
  type: 'Consultation',
  date: '',
  time: '',
  status: 'En attente',
  notes: '',
}

export default function Appointments() {
  const { addToast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewing, setViewing] = useState<Appointment | null>(null)

  const fetchData = async () => {
    try {
      const [aptRes, patRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/patients'),
      ])
      const aptData = await aptRes.json()
      const patData = await patRes.json()
      setAppointments(aptData.appointments || [])
      setPatients(patData.patients || [])
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
  const todayCount = appointments.filter((a) => a.date === today).length
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekCount = appointments.filter((a) => {
    const d = new Date(a.date)
    return d >= weekStart && d <= weekEnd
  }).length
  const pendingCount = appointments.filter((a) => a.status === 'En attente').length

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (apt: Appointment) => {
    setEditing(apt)
    setForm({
      patientId: String(apt.patientId),
      doctor: apt.doctor,
      type: apt.type,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      notes: apt.notes || '',
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
      doctor: form.doctor,
      type: form.type,
      date: form.date,
      time: form.time,
      status: form.status,
      notes: form.notes || null,
    }

    try {
      const url = editing ? `/api/appointments/${editing.id}` : '/api/appointments'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')

      setDialogOpen(false)
      addToast(editing ? 'Rendez-vous mis à jour avec succès' : 'Rendez-vous créé avec succès', 'success')
      fetchData()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement du rendez-vous', 'error')
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce rendez-vous ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== id))
        addToast('Rendez-vous supprimé avec succès', 'success')
      } else {
        addToast('Erreur lors de la suppression du rendez-vous', 'error')
      }
    } catch {
      addToast('Erreur lors de la suppression du rendez-vous', 'error')
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
          <h1 className="text-2xl font-bold">Rendez-vous</h1>
          <p className="text-muted-foreground">Gerez les rendez-vous des patients.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Nouveau RDV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aujourd'hui</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cette semaine</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
            <User className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prochains rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Aucun rendez-vous.</div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.type} - {apt.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">{apt.date}</p>
                      <p className="text-sm text-muted-foreground">{apt.time}</p>
                    </div>
                    <Badge
                      variant={
                        apt.status === 'Confirme'
                          ? 'default'
                          : apt.status === 'Annule'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {apt.status}
                    </Badge>
                    <Button variant="ghost" size="icon" title="Voir" onClick={() => setViewing(apt)}>
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Modifier" onClick={() => openEdit(apt)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                      disabled={deletingId === apt.id}
                      onClick={() => handleDelete(apt.id)}
                    >
                      {deletingId === apt.id ? (
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
            <DialogTitle>{editing ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</DialogTitle>
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
                <label className="text-sm font-medium">Type *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Consultation</option>
                  <option>Suivi</option>
                  <option>Controle</option>
                  <option>Urgence</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Heure *</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
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
                <option>En attente</option>
                <option>Confirme</option>
                <option>Annule</option>
              </select>
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
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Patient :</span> {viewing.patientName}</div>
              <div><span className="font-medium">Médecin :</span> {viewing.doctor}</div>
              <div><span className="font-medium">Type :</span> {viewing.type}</div>
              <div><span className="font-medium">Date :</span> {viewing.date}</div>
              <div><span className="font-medium">Heure :</span> {viewing.time}</div>
              <div><span className="font-medium">Statut :</span> {viewing.status}</div>
              {viewing.notes && <div><span className="font-medium">Notes :</span> {viewing.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
