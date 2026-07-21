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
import { Plus, TestTube, Search, Pencil, Trash2, Loader2, Eye } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface Patient {
  id: number
  firstName: string
  lastName: string
}

interface Exam {
  id: number
  patientId: number
  patientName: string
  type: string
  doctor: string
  date: string
  status: string
  result: string | null
  notes: string | null
}

const emptyForm = {
  patientId: '',
  type: '',
  doctor: '',
  date: '',
  status: 'En attente',
  result: '',
  notes: '',
}

export default function Exams() {
  const { addToast } = useToast()
  const [exams, setExams] = useState<Exam[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Exam | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewing, setViewing] = useState<Exam | null>(null)

  const fetchData = async () => {
    try {
      const [eRes, pRes] = await Promise.all([
        fetch('/api/exams'),
        fetch('/api/patients'),
      ])
      const eData = await eRes.json()
      const pData = await pRes.json()
      setExams(eData.exams || [])
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

  const filtered = exams.filter((e) => {
    const q = search.toLowerCase()
    return (
      e.patientName?.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      e.doctor.toLowerCase().includes(q)
    )
  })

  const pendingCount = exams.filter((e) => e.status === 'En attente').length
  const normalCount = exams.filter((e) => e.result === 'Normal').length
  const abnormalCount = exams.filter((e) => e.result === 'Anormal').length

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (exam: Exam) => {
    setEditing(exam)
    setForm({
      patientId: String(exam.patientId),
      type: exam.type,
      doctor: exam.doctor,
      date: exam.date,
      status: exam.status,
      result: exam.result || '',
      notes: exam.notes || '',
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
      result: form.result || null,
      notes: form.notes || null,
    }

    try {
      const url = editing ? `/api/exams/${editing.id}` : '/api/exams'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')

      setDialogOpen(false)
      addToast(editing ? 'Examen mis à jour avec succès' : 'Examen créé avec succès', 'success')
      fetchData()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de l\'examen', 'error')
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet examen ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setExams((prev) => prev.filter((e) => e.id !== id))
        addToast('Examen supprimé avec succès', 'success')
      } else {
        addToast('Erreur lors de la suppression de l\'examen', 'error')
      }
    } catch {
      addToast('Erreur lors de la suppression de l\'examen', 'error')
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
          <h1 className="text-2xl font-bold">Examens</h1>
          <p className="text-muted-foreground">Suivi des examens et analyses.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Nouvel examen
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <TestTube className="size-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Normaux</p>
                <p className="text-2xl font-bold text-emerald-600">{normalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anormaux</p>
                <p className="text-2xl font-bold text-destructive">{abnormalCount}</p>
              </div>
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
                placeholder="Rechercher par patient, type, medecin..."
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
              {exams.length === 0 ? 'Aucun examen.' : 'Aucun examen ne correspond.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <TestTube className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{exam.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.patientName} - {exam.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{exam.date}</p>
                    {exam.result && (
                      <Badge variant={exam.result === 'Normal' ? 'default' : 'destructive'}>
                        {exam.result}
                      </Badge>
                    )}
                    <Badge variant={exam.status === 'Valide' ? 'secondary' : 'outline'}>
                      {exam.status}
                    </Badge>
                    <Button variant="ghost" size="icon" title="Voir" onClick={() => setViewing(exam)}>
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Modifier" onClick={() => openEdit(exam)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                      disabled={deletingId === exam.id}
                      onClick={() => handleDelete(exam.id)}
                    >
                      {deletingId === exam.id ? (
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
              {editing ? "Modifier l'examen" : 'Nouvel examen'}
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
                  <option value="">Selectionner</option>
                  <option>Analyse sanguine</option>
                  <option>ECG</option>
                  <option>Radio thorax</option>
                  <option>IRM</option>
                  <option>Echographie</option>
                  <option>Scanner</option>
                  <option>Biopsie</option>
                  <option>Autre</option>
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
                  <option>En attente</option>
                  <option>Valide</option>
                  <option>Annule</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resultat</label>
              <select
                name="result"
                value={form.result}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">En attente</option>
                <option>Normal</option>
                <option>Anormal</option>
                <option>Inconclusif</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Observations..."
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
            <DialogTitle>Détails de l'examen</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Patient :</span> {viewing.patientName}</div>
              <div><span className="font-medium">Type :</span> {viewing.type}</div>
              <div><span className="font-medium">Médecin :</span> {viewing.doctor}</div>
              <div><span className="font-medium">Date :</span> {viewing.date}</div>
              <div><span className="font-medium">Statut :</span> {viewing.status}</div>
              {viewing.result && <div><span className="font-medium">Résultat :</span> {viewing.result}</div>}
              {viewing.notes && <div><span className="font-medium">Notes :</span> {viewing.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
