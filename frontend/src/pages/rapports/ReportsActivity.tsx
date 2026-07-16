import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  Download,
  Stethoscope,
  TestTube,
  Calendar,
  Clock,
} from 'lucide-react'

const statsCards = [
  { title: 'Consultations', value: '342', change: '+8%', positive: true, icon: Stethoscope },
  { title: 'Examens realisees', value: '198', change: '+12%', positive: true, icon: TestTube },
  { title: 'Interventions', value: '56', change: '+3%', positive: true, icon: Activity },
  { title: 'Temps moyen consultation', value: '18 min', change: '-2 min', positive: true, icon: Clock },
]

const consultationsByService = [
  { name: 'Medecine generale', count: 120, percentage: 35 },
  { name: 'Cardiologie', count: 68, percentage: 20 },
  { name: 'Pediatrie', count: 55, percentage: 16 },
  { name: 'Gynecologie', count: 48, percentage: 14 },
  { name: 'Chirurgie', count: 35, percentage: 10 },
  { name: 'Autres', count: 16, percentage: 5 },
]

const weeklyActivity = [
  { day: 'Lun', consultations: 62, exams: 35, interventions: 10 },
  { day: 'Mar', consultations: 58, exams: 32, interventions: 8 },
  { day: 'Mer', consultations: 65, exams: 38, interventions: 12 },
  { day: 'Jeu', consultations: 55, exams: 30, interventions: 9 },
  { day: 'Ven', consultations: 60, exams: 33, interventions: 11 },
  { day: 'Sam', consultations: 42, exams: 20, interventions: 6 },
]

const topDoctors = [
  { name: 'Dr. Rakoto', consultations: 78, specialty: 'Cardiologie' },
  { name: 'Dr. Andry', consultations: 65, specialty: 'Pediatrie' },
  { name: 'Dr. Rabe', consultations: 58, specialty: 'Medecine generale' },
  { name: 'Dr. Soa', consultations: 52, specialty: 'Gynecologie' },
]

export default function ReportsActivity() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activite medicale</h1>
          <p className="text-muted-foreground">Consultations, interventions et performances.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 size-4" />
            Juin 2026
          </Button>
          <Button>
            <Download className="mr-2 size-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.positive ? 'text-emerald-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                {' '}vs mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consultations par service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultationsByService.map((service) => (
                <div key={service.name} className="flex items-center gap-3">
                  <span className="text-sm w-36 truncate">{service.name}</span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${service.percentage * 2.5}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{service.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activite hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyActivity.map((day) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-8 text-muted-foreground">{day.day}</span>
                  <div className="flex-1 flex gap-1">
                    <div className="h-5 bg-primary/80 rounded flex items-center justify-center" style={{ width: `${day.consultations}px` }}>
                      <span className="text-[10px] text-primary-foreground font-medium">{day.consultations}</span>
                    </div>
                    <div className="h-5 bg-emerald-500/80 rounded flex items-center justify-center" style={{ width: `${day.exams}px` }}>
                      <span className="text-[10px] text-white font-medium">{day.exams}</span>
                    </div>
                    <div className="h-5 bg-amber-500/80 rounded flex items-center justify-center" style={{ width: `${day.interventions * 3}px` }}>
                      <span className="text-[10px] text-white font-medium">{day.interventions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-primary/80 rounded" />
                <span className="text-xs text-muted-foreground">Consultations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 bg-emerald-500/80 rounded" />
                <span className="text-xs text-muted-foreground">Examens</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 bg-amber-500/80 rounded" />
                <span className="text-xs text-muted-foreground">Interventions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top medecins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {topDoctors.map((doc, i) => (
              <div key={doc.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Badge variant={i === 0 ? 'default' : 'secondary'} className="size-8 flex items-center justify-center">
                  {i + 1}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                  <p className="text-xs text-primary font-medium">{doc.consultations} consultations</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
