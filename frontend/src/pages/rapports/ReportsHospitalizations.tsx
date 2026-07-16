import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BedDouble,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from 'lucide-react'

const statsCards = [
  { title: 'Lits total', value: '60', icon: BedDouble, color: 'text-blue-600' },
  { title: 'Occupes', value: '45', icon: AlertTriangle, color: 'text-amber-600' },
  { title: 'Disponibles', value: '15', icon: CheckCircle, color: 'text-emerald-600' },
  { title: 'Duree moyenne', value: '4.2 j', icon: Clock, color: 'text-purple-600' },
]

const serviceOccupation = [
  { name: 'Cardiologie', occupied: 12, total: 15, percentage: 80 },
  { name: 'Pediatrie', occupied: 10, total: 12, percentage: 83 },
  { name: 'Chirurgie', occupied: 8, total: 12, percentage: 67 },
  { name: 'Maternite', occupied: 7, total: 10, percentage: 70 },
  { name: 'Orthopedie', occupied: 5, total: 6, percentage: 83 },
  { name: 'Neurologie', occupied: 3, total: 5, percentage: 60 },
]

const monthlyData = [
  { month: 'Jan', admissions: 78, discharges: 72, averageStay: 4.5 },
  { month: 'Fev', admissions: 85, discharges: 80, averageStay: 4.3 },
  { month: 'Mar', admissions: 92, discharges: 88, averageStay: 4.1 },
  { month: 'Avr', admissions: 80, discharges: 82, averageStay: 4.4 },
  { month: 'Mai', admissions: 88, discharges: 85, averageStay: 4.2 },
  { month: 'Jun', admissions: 95, discharges: 90, averageStay: 4.2 },
]

export default function ReportsHospitalizations() {
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
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Occupation par service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceOccupation.map((service) => (
                <div key={service.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{service.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {service.occupied}/{service.total} ({service.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        service.percentage >= 80 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admissions vs Sorties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-8 text-muted-foreground">{data.month}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-4 bg-primary/80 rounded" style={{ width: `${data.admissions * 2}px` }} />
                      <span className="text-xs text-muted-foreground">{data.admissions}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-4 bg-emerald-500/80 rounded" style={{ width: `${data.discharges * 2}px` }} />
                      <span className="text-xs text-muted-foreground">{data.discharges}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {data.averageStay}j
                  </Badge>
                </div>
              ))}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
