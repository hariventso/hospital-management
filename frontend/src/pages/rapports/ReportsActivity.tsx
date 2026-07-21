import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Download,
  Stethoscope,
  TestTube,
  Calendar,
  Loader2,
  CalendarCheck,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

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
  createdAt: string
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

const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ReportsActivity() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/appointments').then((r) => r.json()),
      fetch('/api/exams').then((r) => r.json()),
    ])
      .then(([a, e]) => {
        setAppointments(a.appointments || [])
        setExams(e.exams || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const thisMonth = (items: { date: string }[]) =>
    items.filter((i) => {
      const d = new Date(i.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

  const monthlyAppointments = thisMonth(appointments)
  const monthlyExams = thisMonth(exams)
  const completedAppointments = appointments.filter((a) => a.status === 'Termine')
  const todayAppts = appointments.filter((a) => a.date === today)
  const normalResults = exams.filter((e) => e.result === 'Normal')
  const abnormalResults = exams.filter((e) => e.result === 'Anormal')

  const doctorStats: Record<string, { appointments: number; exams: number }> = {}
  for (const a of appointments) {
    if (!doctorStats[a.doctor]) doctorStats[a.doctor] = { appointments: 0, exams: 0 }
    doctorStats[a.doctor].appointments++
  }
  for (const e of exams) {
    if (!doctorStats[e.doctor]) doctorStats[e.doctor] = { appointments: 0, exams: 0 }
    doctorStats[e.doctor].exams++
  }
  const topDoctors = Object.entries(doctorStats)
    .map(([name, s]) => ({ name, ...s, total: s.appointments + s.exams }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  const examTypeStats: Record<string, number> = {}
  for (const e of exams) {
    examTypeStats[e.type] = (examTypeStats[e.type] || 0) + 1
  }
  const examTypes = Object.entries(examTypeStats)
    .map(([name, count]) => ({ name, count, percentage: exams.length > 0 ? Math.round((count / exams.length) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)

  const appointmentTypeStats: Record<string, number> = {}
  for (const a of appointments) {
    appointmentTypeStats[a.type] = (appointmentTypeStats[a.type] || 0) + 1
  }
  const appointmentTypes = Object.entries(appointmentTypeStats)
    .map(([name, count]) => ({ name, count, percentage: appointments.length > 0 ? Math.round((count / appointments.length) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)

  const dayOfWeekMap: Record<string, { appointments: number; exams: number }> = {}
  for (const name of dayNames) dayOfWeekMap[name] = { appointments: 0, exams: 0 }
  for (const a of appointments) {
    const d = new Date(a.date).getDay()
    dayOfWeekMap[dayNames[d]].appointments++
  }
  for (const e of exams) {
    const d = new Date(e.date).getDay()
    dayOfWeekMap[dayNames[d]].exams++
  }
  const weekData = dayNames.filter((d) => dayOfWeekMap[d].appointments > 0 || dayOfWeekMap[d].exams > 0)
    .map((d) => ({ day: d, ...dayOfWeekMap[d] }))

  const monthlyMap: Record<string, { appointments: number; exams: number }> = {}
  for (const a of appointments) {
    const d = new Date(a.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { appointments: 0, exams: 0 }
    monthlyMap[key].appointments++
  }
  for (const e of exams) {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { appointments: 0, exams: 0 }
    monthlyMap[key].exams++
  }
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({ month, ...data }))

  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const recentExams = [...exams]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const exportCSV = useCallback(() => {
    downloadCSV(
      'activite-medicale.csv',
      ['Type', 'ID', 'Patient', 'Detail', 'Medecin', 'Date', 'Statut', 'Resultat'],
      [
        ...appointments.map((a) => ['Rendez-vous', String(a.id), a.patientName, a.type, a.doctor, a.date, a.status, '']),
        ...exams.map((e) => ['Examen', String(e.id), e.patientName, e.type, e.doctor, e.date, e.status, e.result ?? '']),
      ],
    )
  }, [appointments, exams])

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
          <h1 className="text-2xl font-bold">Activite medicale</h1>
          <p className="text-muted-foreground">Consultations, examens et performances.</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Rendez-vous</CardTitle>
            <CalendarCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyAppointments.length} ce mois · {todayAppts.length} aujourd'hui
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Examens</CardTitle>
            <TestTube className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyExams.length} ce mois · {exams.filter((e) => e.status === 'En attente').length} en attente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux de realisation</CardTitle>
            <CheckCircle className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.length > 0 ? Math.round((completedAppointments.length / appointments.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedAppointments.length}/{appointments.length} termines
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resultats anormaux</CardTitle>
            <AlertTriangle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abnormalResults.length}</div>
            <p className="text-xs text-muted-foreground">
              {normalResults.length} normaux · {exams.filter((e) => !e.result).length} en attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity by day of week + Monthly */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activite par jour</CardTitle>
          </CardHeader>
          <CardContent>
            {weekData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-3">
                {weekData.map((day) => {
                  const maxVal = Math.max(day.appointments, day.exams, 1)
                  return (
                    <div key={day.day} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-8 text-muted-foreground">{day.day}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-1">
                          <div
                            className="h-5 bg-primary/80 rounded flex items-center justify-center min-w-[2px]"
                            style={{ width: `${(day.appointments / maxVal) * 100}%` }}
                          >
                            {day.appointments > 0 && (
                              <span className="text-[10px] text-primary-foreground font-medium">{day.appointments}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          <div
                            className="h-5 bg-emerald-500/80 rounded flex items-center justify-center min-w-[2px]"
                            style={{ width: `${(day.exams / maxVal) * 100}%` }}
                          >
                            {day.exams > 0 && (
                              <span className="text-[10px] text-white font-medium">{day.exams}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-primary/80 rounded" />
                <span className="text-xs text-muted-foreground">Rendez-vous</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 bg-emerald-500/80 rounded" />
                <span className="text-xs text-muted-foreground">Examens</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-3">
                {monthlyData.map((data) => {
                  const label = `${monthNames[parseInt(data.month.split('-')[1]) - 1]} ${data.month.split('-')[0]}`
                  const maxVal = Math.max(data.appointments, data.exams, 1)
                  return (
                    <div key={data.month} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-14 text-muted-foreground">{label}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-1">
                          <div
                            className="h-4 bg-primary/80 rounded min-w-[2px]"
                            style={{ width: `${(data.appointments / maxVal) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{data.appointments}</span>
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          <div
                            className="h-4 bg-emerald-500/80 rounded min-w-[2px]"
                            style={{ width: `${(data.exams / maxVal) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{data.exams}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-primary/80 rounded" />
                <span className="text-xs text-muted-foreground">Rendez-vous</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 bg-emerald-500/80 rounded" />
                <span className="text-xs text-muted-foreground">Examens</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Types de RDV + Types d'examens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Types de rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-3">
                {appointmentTypes.map((t) => (
                  <div key={t.name} className="flex items-center gap-3">
                    <span className="text-sm w-36 truncate">{t.name}</span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.max(t.percentage, t.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Types d'examens</CardTitle>
          </CardHeader>
          <CardContent>
            {examTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-3">
                {examTypes.map((t) => (
                  <div key={t.name} className="flex items-center gap-3">
                    <span className="text-sm w-36 truncate">{t.name}</span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.max(t.percentage, t.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top medecins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medecins les plus actifs</CardTitle>
        </CardHeader>
        <CardContent>
          {topDoctors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {topDoctors.map((doc, i) => (
                <div key={doc.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Badge variant={i === 0 ? 'default' : 'secondary'} className="size-8 flex items-center justify-center">
                    {i + 1}
                  </Badge>
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-muted text-xs font-medium">
                      {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.appointments} RDV · {doc.exams} examens
                    </p>
                    <p className="text-xs text-primary font-medium">{doc.total} total</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Derniers RDV + Examens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Derniers rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun rendez-vous</p>
            ) : (
              <div className="space-y-2">
                {recentAppointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                        <Stethoscope className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{a.patientName}</p>
                        <p className="text-xs text-muted-foreground">Dr. {a.doctor} — {a.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.status === 'Termine' ? 'default' : a.status === 'Annule' ? 'destructive' : 'secondary'} className="text-xs">
                        {a.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xs font-medium">{a.date}</p>
                        <p className="text-xs text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Derniers examens</CardTitle>
          </CardHeader>
          <CardContent>
            {recentExams.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun examen</p>
            ) : (
              <div className="space-y-2">
                {recentExams.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50">
                        <TestTube className="size-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{e.patientName}</p>
                        <p className="text-xs text-muted-foreground">Dr. {e.doctor} — {e.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {e.result && (
                        <Badge variant={e.result === 'Normal' ? 'default' : 'destructive'} className="text-xs">
                          {e.result}
                        </Badge>
                      )}
                      <Badge variant={e.status === 'Termine' ? 'default' : 'secondary'} className="text-xs">
                        {e.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{e.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
