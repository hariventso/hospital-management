import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BedDouble,
  Activity,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  FileText,
  Download,
  Loader2,
  Stethoscope,
  TestTube,
  Pill,
  AlertTriangle,
} from 'lucide-react'

interface Patient {
  id: number
  lastName: string
  firstName: string
  dateOfBirth: string | null
  gender: string
  createdAt: string
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
}

interface Prescription {
  id: number
  patientId: number
  patientName: string
  medication: string
  dosage: string
  doctor: string
  date: string
  status: string
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
}

export default function ReportsOverview() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/patients').then((r) => r.json()),
      fetch('/api/appointments').then((r) => r.json()),
      fetch('/api/hospitalizations').then((r) => r.json()),
      fetch('/api/exams').then((r) => r.json()),
      fetch('/api/prescriptions').then((r) => r.json()),
      fetch('/api/invoices').then((r) => r.json()),
    ])
      .then(([p, a, h, e, pr, inv]) => {
        setPatients(p.patients || [])
        setAppointments(a.appointments || [])
        setHospitalizations(h.hospitalizations || [])
        setExams(e.exams || [])
        setPrescriptions(pr.prescriptions || [])
        setInvoices(inv.invoices || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const thisMonth = (items: { date: string }[]) =>
    items.filter((i) => {
      const d = new Date(i.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

  const patientThisMonth = patients.filter((p) => {
    const d = new Date(p.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.amount || '0'), 0)
  const totalPaid = invoices.reduce((s, i) => s + parseFloat(i.paidAmount || '0'), 0)
  const unpaidInvoices = invoices.filter((i) => i.status === 'En attente').length

  const activeHospitalizations = hospitalizations.filter((h) => h.status === 'En cours').length
  const todayAppointments = appointments.filter((a) => a.date === now.toISOString().split('T')[0]).length
  const pendingAppointments = appointments.filter((a) => a.status === 'En attente').length
  const urgentAppointments = appointments.filter((a) => a.type === 'Urgence').length

  const activePrescriptions = prescriptions.filter((p) => p.status === 'Active').length
  const pendingExams = exams.filter((e) => e.status === 'En attente').length
  const abnormalResults = exams.filter((e) => e.result === 'Anormal').length

  const reportCategories = [
    {
      title: 'Patients',
      description: 'Statistiques demographiques, taux de readmission et suivi des patients.',
      href: '/dashboard/rapports/patients',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600',
      stats: { value: patients.length.toString(), label: 'Patients total', trend: `+${patientThisMonth} ce mois`, positive: true },
    },
    {
      title: 'Hospitalisations',
      description: "Taux d'occupation des lits, durees moyennes et sorties.",
      href: '/dashboard/rapports/hospitalisations',
      icon: BedDouble,
      color: 'bg-amber-500/10 text-amber-600',
      stats: { value: `${activeHospitalizations}/${hospitalizations.length}`, label: 'Occupes / Total', trend: hospitalizations.length > 0 ? `${Math.round((activeHospitalizations / hospitalizations.length) * 100)}%` : '0%', positive: true },
    },
    {
      title: 'Activite medicale',
      description: 'Consultations, interventions, examens et performances médicales.',
      href: '/dashboard/rapports/activite',
      icon: Activity,
      color: 'bg-emerald-500/10 text-emerald-600',
      stats: { value: exams.length.toString(), label: 'Examens total', trend: `+${thisMonth(exams).length} ce mois`, positive: true },
    },
    {
      title: 'Finance',
      description: 'Revenus, depenses, facturation et rentabilite.',
      href: '/dashboard/rapports/finance',
      icon: CreditCard,
      color: 'bg-purple-500/10 text-purple-600',
      stats: {
        value: `${(totalRevenue / 1000000).toFixed(1)}M`,
        label: 'Revenus (AR)',
        trend: unpaidInvoices > 0 ? `${unpaidInvoices} en attente` : 'Tout paye',
        positive: unpaidInvoices === 0,
      },
    },
  ]

  const recentReports = [
    {
      id: 1,
      name: `Rapport mensuel patients - ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
      date: now.toLocaleDateString('fr-FR'),
      type: 'Patients',
      count: `${patientThisMonth} nouveaux`,
    },
    {
      id: 2,
      name: `Occupation lits - ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
      date: now.toLocaleDateString('fr-FR'),
      type: 'Hospitalisations',
      count: `${activeHospitalizations} actifs`,
    },
    {
      id: 3,
      name: `Activite medicale - ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
      date: now.toLocaleDateString('fr-FR'),
      type: 'Activite',
      count: `${exams.length + prescriptions.length} actes`,
    },
    {
      id: 4,
      name: `Bilan financier - ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
      date: now.toLocaleDateString('fr-FR'),
      type: 'Finance',
      count: `${totalPaid.toLocaleString('fr-FR')} AR payes`,
    },
  ]

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
          <h1 className="text-2xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">Apercu general des rapports et statistiques de l'hopital.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 size-4" />
            {now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </Button>
          <Button>
            <Download className="mr-2 size-4" />
            Exporter tout
          </Button>
        </div>
      </div>

      {/* KPIs rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Patients aujourd'hui</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments}</div>
            <p className="text-xs text-muted-foreground">{pendingAppointments} en attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lits occupes</CardTitle>
            <BedDouble className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeHospitalizations}</div>
            <p className="text-xs text-muted-foreground">{hospitalizations.length} hospitalisations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Examens en attente</CardTitle>
            <TestTube className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingExams}</div>
            {abnormalResults > 0 && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="size-3" />
                {abnormalResults} resultats anormaux
              </p>
            )}
            {abnormalResults === 0 && (
              <p className="text-xs text-muted-foreground">{exams.length} total</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus totaux</CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPaid.toLocaleString('fr-FR')} AR</div>
            {unpaidInvoices > 0 && (
              <p className="text-xs text-amber-600">{unpaidInvoices} factures en attente</p>
            )}
            {unpaidInvoices === 0 && (
              <p className="text-xs text-emerald-600">Toutes payees</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Categories de rapports */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportCategories.map((cat) => (
          <Link key={cat.title} to={cat.href}>
            <Card className="group cursor-pointer hover:shadow-md transition-all hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className={`flex size-10 items-center justify-center rounded-lg ${cat.color}`}>
                  <cat.icon className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <CardTitle className="text-base">{cat.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-lg font-bold">{cat.stats.value}</p>
                    <p className="text-xs text-muted-foreground">{cat.stats.label}</p>
                  </div>
                  <Badge variant={cat.stats.positive ? 'default' : 'destructive'} className="text-xs">
                    {cat.stats.positive ? <TrendingUp className="mr-1 size-3" /> : <TrendingDown className="mr-1 size-3" />}
                    {cat.stats.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Activite recente + Alertes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="size-5" />
              Activite recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{a.patientName}</p>
                      <p className="text-xs text-muted-foreground">Dr. {a.doctor} - {a.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{a.date}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune activite</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentAppointments > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
                    <AlertTriangle className="size-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{urgentAppointments} urgences</p>
                    <p className="text-xs text-muted-foreground">Rendez-vous d'urgence en attente</p>
                  </div>
                </div>
              )}
              {abnormalResults > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100">
                    <TestTube className="size-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{abnormalResults} resultats anormaux</p>
                    <p className="text-xs text-muted-foreground">Examens avec resultats inquiétants</p>
                  </div>
                </div>
              )}
              {unpaidInvoices > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-purple-100">
                    <CreditCard className="size-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{unpaidInvoices} factures impayees</p>
                    <p className="text-xs text-muted-foreground">En attente de paiement</p>
                  </div>
                </div>
              )}
              {activePrescriptions > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50">
                    <Pill className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activePrescriptions} prescriptions actives</p>
                    <p className="text-xs text-muted-foreground">Medicaments en cours</p>
                  </div>
                </div>
              )}
              {urgentAppointments === 0 && abnormalResults === 0 && unpaidInvoices === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Activity className="size-8 mb-2 opacity-50" />
                  <p className="text-sm">Aucune alerte en cours</p>
                  <p className="text-xs">Tout va bien !</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rapports recents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Rapports recents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {report.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{report.count}</span>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Download className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
