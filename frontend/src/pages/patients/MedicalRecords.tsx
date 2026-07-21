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
import { Plus, FileText, Search, Pencil, Trash2, Loader2, Eye } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface Patient {
  id: number
  firstName: string
  lastName: string
}

interface MedicalRecord {
  id: number
  patientId: number
  patientName: string
  type: string
  doctor: string
  date: string
  status: string
  diagnosis: string | null
  treatment: string | null
  notes: string | null
}

const emptyForm = {
  patientId: '',
  type: 'Consultation',
  doctor: '',
  date: '',
  status: 'Valide',
  diagnosis: '',
  treatment: '',
  notes: '',
}

export default function MedicalRecords() {
  const { addToast } = useToast()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MedicalRecord | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewing, setViewing] = useState<MedicalRecord | null>(null)

  const fetchData = async () => {
    try {
      const [rRes, pRes] = await Promise.all([
        fetch('/api/medical-records'),
        fetch('/api/patients'),
      ])
      const rData = await rRes.json()
      const pData = await pRes.json()
      setRecords(rData.records || [])
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

  const filtered = records.filter((r) => {
    const q = search.toLowerCase()
    return (
      r.patientName?.toLowerCase().includes(q) ||
      r.doctor.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q)
    )
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (r: MedicalRecord) => {
    setEditing(r)
    setForm({
      patientId: String(r.patientId),
      type: r.type,
      doctor: r.doctor,
      date: r.date,
      status: r.status,
      diagnosis: r.diagnosis || '',
      treatment: r.treatment || '',
      notes: r.notes || '',
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
      doctor: form.doctor,
      date: form.date,
      status: form.status,
      diagnosis: form.diagnosis || null,
      treatment: form.treatment || null,
      notes: form.notes || null,
    }

    try {
      const url = editing ? `/api/medical-records/${editing.id}` : '/api/medical-records'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')

      setDialogOpen(false)
      addToast(editing ? 'Dossier médical mis à jour avec succès' : 'Dossier médical créé avec succès', 'success')
      fetchData()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement du dossier médical', 'error')
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce dossier medical ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/medical-records/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id))
        addToast('Dossier médical supprimé avec succès', 'success')
      } else {
        addToast('Erreur lors de la suppression du dossier médical', 'error')
      }
    } catch {
      addToast('Erreur lors de la suppression du dossier médical', 'error')
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
          <h1 className="text-2xl font-bold">Dossiers medicaux</h1>
          <p className="text-muted-foreground">Consultez les dossiers medicaux des patients.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Nouveau dossier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher par patient, medecin, type..."
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
              {records.length === 0 ? 'Aucun dossier medical.' : 'Aucun dossier ne correspond.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{record.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.type} - {record.doctor}
                      </p>
                      {record.diagnosis && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Diagnostic: {record.diagnosis}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{record.date}</p>
                    <Badge
                      variant={
                        record.status === 'Valide'
                          ? 'default'
                          : record.status === 'En cours'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {record.status}
                    </Badge>
                    <Button variant="ghost" size="icon" title="Voir" onClick={() => setViewing(record)}>
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Modifier" onClick={() => openEdit(record)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                      disabled={deletingId === record.id}
                      onClick={() => handleDelete(record.id)}
                    >
                      {deletingId === record.id ? (
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
              {editing ? 'Modifier le dossier' : 'Nouveau dossier medical'}
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
                  <option>Urgence</option>
                  <option>Suivi</option>
                  <option>Controle</option>
                </select>
              </div>
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
                <label className="text-sm font-medium">Statut</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Valide</option>
                  <option>En cours</option>
                  <option>Brouillon</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Diagnostic</label>
              <textarea
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="Description du diagnostic"
                className="min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Traitement</label>
              <textarea
                name="treatment"
                value={form.treatment}
                onChange={handleChange}
                placeholder="Traitement prescrit"
                className="min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
            <DialogTitle>Détails du dossier médical</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Patient :</span> {viewing.patientName}</div>
              <div><span className="font-medium">Type :</span> {viewing.type}</div>
              <div><span className="font-medium">Médecin :</span> {viewing.doctor}</div>
              <div><span className="font-medium">Date :</span> {viewing.date}</div>
              <div><span className="font-medium">Statut :</span> {viewing.status}</div>
              {viewing.diagnosis && <div><span className="font-medium">Diagnostic :</span> {viewing.diagnosis}</div>}
              {viewing.treatment && <div><span className="font-medium">Traitement :</span> {viewing.treatment}</div>}
              {viewing.notes && <div><span className="font-medium">Notes :</span> {viewing.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
