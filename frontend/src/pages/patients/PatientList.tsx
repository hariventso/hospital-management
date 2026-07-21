import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Search, Pencil, Trash2, Loader2, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ToastProvider'

interface Patient {
  id: number
  lastName: string
  firstName: string
  dateOfBirth: string | null
  gender: string
  phone: string | null
  email: string | null
  address: string | null
  recordNumber: string | null
  insuranceProvider: string | null
  createdAt: string
}

export default function PatientList() {
  const { addToast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewing, setViewing] = useState<Patient | null>(null)

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      const data = await res.json()
      setPatients(data.patients || [])
    } catch {
      console.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Supprimer le patient "${name}" ?`)) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPatients((prev) => prev.filter((p) => p.id !== id))
        addToast('Patient supprimé avec succès', 'success')
      } else {
        addToast('Erreur lors de la suppression du patient', 'error')
      }
    } catch {
      addToast('Erreur lors de la suppression du patient', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    )
  })

  const getAge = (dob: string | null) => {
    if (!dob) return null
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Liste des patients</h1>
          <p className="text-muted-foreground">{patients.length} patient(s) enregistre(s)</p>
        </div>
        <Link to="/dashboard/patients/add">
          <Button>
            <Plus className="mr-2 size-4" />
            Nouveau patient
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher par nom, email, telephone..."
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
              {patients.length === 0
                ? 'Aucun patient enregistre.'
                : 'Aucun patient ne correspond a la recherche.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {patient.firstName[0]}
                        {patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getAge(patient.dateOfBirth) !== null
                          ? `${getAge(patient.dateOfBirth)} ans`
                          : 'Age inconnu'}
                        {patient.phone ? ` - ${patient.phone}` : ''}
                        {patient.email ? ` - ${patient.email}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={patient.gender === 'M' ? 'default' : 'secondary'}>
                      {patient.gender === 'M' ? 'Homme' : 'Femme'}
                    </Badge>
                    <Button variant="ghost" size="icon" title="Voir" onClick={() => setViewing(patient)}>
                      <Eye className="size-4" />
                    </Button>
                    <Link to={`/dashboard/patients/edit/${patient.id}`}>
                      <Button variant="ghost" size="icon" title="Modifier">
                        <Pencil className="size-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                      disabled={deletingId === patient.id}
                      onClick={() => handleDelete(patient.id, `${patient.firstName} ${patient.lastName}`)}
                    >
                      {deletingId === patient.id ? (
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

      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du patient</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Nom :</span> {viewing.lastName}</div>
              <div><span className="font-medium">Prénom :</span> {viewing.firstName}</div>
              <div><span className="font-medium">Email :</span> {viewing.email}</div>
              <div><span className="font-medium">Téléphone :</span> {viewing.phone}</div>
              <div><span className="font-medium">Date de naissance :</span> {viewing.dateOfBirth}</div>
              <div><span className="font-medium">Genre :</span> {viewing.gender === 'M' ? 'Homme' : 'Femme'}</div>
              <div><span className="font-medium">Adresse :</span> {viewing.address}</div>
              <div><span className="font-medium">N° dossier :</span> {viewing.recordNumber}</div>
              <div><span className="font-medium">Mutuelle :</span> {viewing.insuranceProvider}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
