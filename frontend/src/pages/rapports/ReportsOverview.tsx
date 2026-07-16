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
} from 'lucide-react'

const reportCategories = [
  {
    title: 'Patients',
    description: 'Statistiques demographiques, taux de readmission et suivi des patients.',
    href: '/dashboard/rapports/patients',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600',
    stats: { value: '1 234', label: 'Patients total', trend: '+12%', positive: true },
  },
  {
    title: 'Hospitalisations',
    description: "Taux d'occupation des lits, durees moyennes et sorties.",
    href: '/dashboard/rapports/hospitalisations',
    icon: BedDouble,
    color: 'bg-amber-500/10 text-amber-600',
    stats: { value: '45/60', label: 'Lits occupes', trend: '75%', positive: true },
  },
  {
    title: 'Activite medicale',
    description: 'Consultations, interventions, examens et performances médicales.',
    href: '/dashboard/rapports/activite',
    icon: Activity,
    color: 'bg-emerald-500/10 text-emerald-600',
    stats: { value: '89', label: 'Actes ce mois', trend: '+5%', positive: true },
  },
  {
    title: 'Finance',
    description: 'Revenus, depenses, facturation et rentabilite.',
    href: '/dashboard/rapports/finance',
    icon: CreditCard,
    color: 'bg-purple-500/10 text-purple-600',
    stats: { value: '12.5M', label: 'Revenus (AR)', trend: '+8%', positive: true },
  },
]

const recentReports = [
  { id: 1, name: 'Rapport mensuel patients - Juin 2026', date: '01/07/2026', type: 'Patients' },
  { id: 2, name: 'Taux occupation lits - Q2 2026', date: '30/06/2026', type: 'Hospitalisations' },
  { id: 3, name: 'Activite medicale - Juin 2026', date: '30/06/2026', type: 'Activite' },
  { id: 4, name: 'Bilan financier - Juin 2026', date: '01/07/2026', type: 'Finance' },
]

export default function ReportsOverview() {
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
            Periode
          </Button>
          <Button>
            <Download className="mr-2 size-4" />
            Exporter tout
          </Button>
        </div>
      </div>

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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Rapports recents
          </CardTitle>
          <Button variant="ghost" size="sm">
            Voir tout
            <ArrowRight className="ml-2 size-4" />
          </Button>
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
