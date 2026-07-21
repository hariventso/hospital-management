import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  BedDouble,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Loader2,

} from 'lucide-react'

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
  createdAt: string
}

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const bom = '\uFEFF'
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(';')).join('\n')
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function daysBetween(d1: string, d2: string): number {
  const date1 = new Date(d1)
  const date2 = new Date(d2)
  return Math.round(Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24))
}

export default function ReportsHospitalizations() {
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hospitalizations')
      .then((res) => res.json())
      .then((data) => setHospitalizations(data.hospitalizations || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const thisMonth = hospitalizations.filter((h) => {
    const d = new Date(h.admissionDate)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const active = hospitalizations.filter((h) => h.status === 'En cours')
  const completed = hospitalizations.filter((h) => h.status === 'Terminee')

  const wardCount: Record<string, { active: number; total: number }> = {}
  for (const h of hospitalizations) {
    if (!wardCount[h.ward]) wardCount[h.ward] = { active: 0, total: 0 }
    wardCount[h.ward].total++
    if (h.status === 'En cours') wardCount[h.ward].active++
  }
  const wardStats = Object.entries(wardCount)
    .map(([ward, s]) => ({ ward, ...s, percentage: Math.round((s.active / s.total) * 100) }))
    .sort((a, b) => b.active - a.active)

  const durations = completed
    .filter((h) => h.dischargeDate)
    .map((h) => daysBetween(h.admissionDate, h.dischargeDate!))
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length * 10) / 10 : 0
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0

  const recentAdmissions = [...hospitalizations]
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())
    .slice(0, 8)

  const monthlyMap: Record<string, { admissions: number; discharges: number }> = {}
  for (const h of hospitalizations) {
    const d = new Date(h.admissionDate)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { admissions: 0, discharges: 0 }
    monthlyMap[key].admissions++
    if (h.dischargeDate) {
      const dd = new Date(h.dischargeDate)
      const dk = `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyMap[dk]) monthlyMap[dk] = { admissions: 0, discharges: 0 }
      monthlyMap[dk].discharges++
    }
  }
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({ month, ...data }))

  const exportCSV = useCallback(() => {
    downloadCSV(
      'hospitalisations.csv',
      ['ID', 'Patient', 'Service', 'Chambre', 'Date entree', 'Date sortie', 'Statut', 'Motif'],
      hospitalizations.map((h) => [
        String(h.id),
        h.patientName,
        h.ward,
        h.room,
        h.admissionDate,
        h.dischargeDate ?? '',
        h.status,
        h.reason ?? '',
      ]),
    )
  }, [hospitalizations])

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
          <h1 className="text-2xl font-bold">Rapport Hospitalisations</h1>
          <p className="text-muted-foreground">Taux d'occupation des lits et durees de sejour.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 size-4" />
            {now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </Button>
          <Button onClick={exportCSV}>
            <Download className="mr-2 size-4" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total hospitalisations</CardTitle>
            <BedDouble className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hospitalizations.length}</div>
            <p className="text-xs text-muted-foreground">{thisMonth.length} ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En cours</CardTitle>
            <AlertTriangle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active.length}</div>
            <p className="text-xs text-amber-600">
              {hospitalizations.length > 0 ? Math.round((active.length / hospitalizations.length) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Terminees</CardTitle>
            <CheckCircle className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed.length}</div>
            <p className="text-xs text-muted-foreground">Sorties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duree moyenne</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration} j</div>
            <p className="text-xs text-muted-foreground">
              {minDuration}j — {maxDuration}j
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Occupation par service + Monthly */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Occupation par service</CardTitle>
          </CardHeader>
          <CardContent>
            {wardStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-4">
                {wardStats.map((w) => (
                  <div key={w.ward}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{w.ward}</span>
                      <span className="text-sm text-muted-foreground">
                        {w.active}/{w.total} ({w.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          w.percentage >= 80 ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.max(w.percentage, w.active > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admissions vs Sorties mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <>
                <div className="space-y-3">
                  {monthlyData.map((data) => {
                    const label = (() => {
                      const [y, m] = data.month.split('-')
                      return `${['Jan','Fev','Mar','Avr','Mai','Jun','Jul','Aout','Sep','Oct','Nov','Dec'][parseInt(m) - 1]} ${y}`
                    })()
                    const maxVal = Math.max(data.admissions, data.discharges, 1)
                    return (
                      <div key={data.month} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-14 text-muted-foreground">{label}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 flex items-center gap-1">
                            <div
                              className="h-4 bg-primary/80 rounded"
                              style={{ width: `${(data.admissions / maxVal) * 100}%` }}
                            />
                            <span className="text-xs text-muted-foreground">{data.admissions}</span>
                          </div>
                          <div className="flex-1 flex items-center gap-1">
                            <div
                              className="h-4 bg-emerald-500/80 rounded"
                              style={{ width: `${(data.discharges / maxVal) * 100}%` }}
                            />
                            <span className="text-xs text-muted-foreground">{data.discharges}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="size-3 bg-primary/80 rounded" />
                    <span className="text-xs text-muted-foreground">Admissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 bg-emerald-500/80 rounded" />
                    <span className="text-xs text-muted-foreground">Sorties</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dernieres admissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dernieres admissions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAdmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune admission</p>
          ) : (
            <div className="space-y-2">
              {recentAdmissions.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {h.patientName?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{h.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.ward} — Ch. {h.room}
                        {h.reason ? ` · ${h.reason}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={h.status === 'En cours' ? 'default' : 'secondary'} className="text-xs">
                      {h.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-xs font-medium">{h.admissionDate}</p>
                      {h.dischargeDate && (
                        <p className="text-xs text-muted-foreground">Sortie: {h.dischargeDate}</p>
                      )}
                    </div>
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
