import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  Download,
  Calendar,
  UserPlus,
  UserMinus,
  RefreshCw,
  Loader2,
} from 'lucide-react'

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

function calculateAge(dob: string | null): number | null {
  if (!dob) return null
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function getAgeRange(age: number | null): string {
  if (age === null) return 'Inconnu'
  if (age <= 10) return '0-10'
  if (age <= 20) return '11-20'
  if (age <= 30) return '21-30'
  if (age <= 40) return '31-40'
  if (age <= 50) return '41-50'
  if (age <= 60) return '51-60'
  if (age <= 70) return '61-70'
  return '70+'
}

export default function ReportsPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/patients')
      .then((res) => res.json())
      .then((data) => setPatients(data.patients || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total = patients.length

  const now = new Date()
  const thisMonth = patients.filter((p) => {
    const d = new Date(p.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const ages = patients.map((p) => calculateAge(p.dateOfBirth))
  const withAge = ages.filter((a): a is number => a !== null)
  const avgAge = withAge.length > 0 ? Math.round(withAge.reduce((s, a) => s + a, 0) / withAge.length) : 0

  const genderCount = {
    male: patients.filter((p) => p.gender === 'M').length,
    female: patients.filter((p) => p.gender === 'F').length,
    other: patients.filter((p) => p.gender !== 'M' && p.gender !== 'F').length,
  }

  const ageRanges = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '70+']
  const ageDistribution = ageRanges.map((range) => {
    const count = patients.filter((p) => getAgeRange(calculateAge(p.dateOfBirth)) === range).length
    return { range, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }
  })

  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapport Patients</h1>
          <p className="text-muted-foreground">Statistiques demographiques et suivi des patients.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 size-4" />
            {now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </Button>
          <Button>
            <Download className="mr-2 size-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total patients</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">En base</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nouveaux ce mois</CardTitle>
            <UserPlus className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonth}</div>
            <p className="text-xs text-emerald-600">Inscrits ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Age moyen</CardTitle>
            <RefreshCw className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAge} ans</div>
            <p className="text-xs text-muted-foreground">Sur {withAge.length} patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hommes / Femmes</CardTitle>
            <UserMinus className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{genderCount.male} / {genderCount.female}</div>
            <p className="text-xs text-muted-foreground">H / F</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repartition par age</CardTitle>
          </CardHeader>
          <CardContent>
            {total === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-3">
                {ageDistribution.map((item) => (
                  <div key={item.range} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-14 text-muted-foreground">{item.range}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.max(item.percentage * 2, item.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">{item.count}</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repartition par sexe</CardTitle>
          </CardHeader>
          <CardContent>
            {total === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Hommes</span>
                    <span className="text-sm font-bold">{genderCount.male} ({total > 0 ? Math.round((genderCount.male / total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${total > 0 ? (genderCount.male / total) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Femmes</span>
                    <span className="text-sm font-bold">{genderCount.female} ({total > 0 ? Math.round((genderCount.female / total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: `${total > 0 ? (genderCount.female / total) * 100 : 0}%` }} />
                  </div>
                </div>
                {genderCount.other > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Autre</span>
                      <span className="text-sm font-bold">{genderCount.other}</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: `${(genderCount.other / total) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Derniers patients inscrits</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPatients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun patient</p>
          ) : (
            <div className="space-y-2">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {patient.firstName?.[0]}{patient.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{patient.firstName} {patient.lastName}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.gender === 'M' ? 'Homme' : patient.gender === 'F' ? 'Femme' : patient.gender}
                        {patient.phone ? ` · ${patient.phone}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {patient.dateOfBirth && (
                      <Badge variant="secondary" className="text-xs">
                        {calculateAge(patient.dateOfBirth)} ans
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
