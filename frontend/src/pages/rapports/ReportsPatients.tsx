import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Download,
  Calendar,
  UserPlus,
  UserMinus,
  RefreshCw,
} from 'lucide-react'

const statsCards = [
  { title: 'Total patients', value: '1 234', change: '+12%', positive: true, icon: Users },
  { title: 'Nouveaux ce mois', value: '87', change: '+18%', positive: true, icon: UserPlus },
  { title: 'Patients actifs', value: '892', change: '+3%', positive: true, icon: RefreshCw },
  { title: 'Perdus de vue', value: '45', change: '-8%', positive: false, icon: UserMinus },
]

const ageDistribution = [
  { range: '0-10', count: 120, percentage: 10 },
  { range: '11-20', count: 95, percentage: 8 },
  { range: '21-30', count: 185, percentage: 15 },
  { range: '31-40', count: 210, percentage: 17 },
  { range: '41-50', count: 198, percentage: 16 },
  { range: '51-60', count: 175, percentage: 14 },
  { range: '61-70', count: 140, percentage: 11 },
  { range: '70+', count: 111, percentage: 9 },
]

const topDiagnoses = [
  { name: 'Paludisme', count: 234, percentage: 19 },
  { name: 'Infections respiratoires', count: 189, percentage: 15 },
  { name: 'Diabete', count: 156, percentage: 13 },
  { name: 'Hypertension', count: 143, percentage: 12 },
  { name: 'Gastro-enterite', count: 112, percentage: 9 },
]

export default function ReportsPatients() {
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
            <CardTitle className="text-base">Repartition par age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ageDistribution.map((item) => (
                <div key={item.range} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-14 text-muted-foreground">{item.range}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage * 2}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">{item.count}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDiagnoses.map((diag, i) => (
                <div key={diag.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="size-6 flex items-center justify-center text-xs">
                        {i + 1}
                      </Badge>
                      <span className="text-sm font-medium">{diag.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{diag.count}</span>
                      <span className="text-xs text-muted-foreground">{diag.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${diag.percentage * 2}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolution mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4 text-center">
            {['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun'].map((month, i) => {
              const values = [95, 102, 110, 98, 115, 127]
              return (
                <div key={month} className="space-y-2">
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-muted rounded-full overflow-hidden" style={{ height: '120px' }}>
                      <div
                        className="w-full bg-primary rounded-full mt-auto transition-all"
                        style={{ height: `${values[i]}%`, marginTop: `${120 - values[i] * 1.2}px` }}
                      />
                    </div>
                    <p className="text-xs font-bold mt-2">{values[i]}</p>
                    <p className="text-xs text-muted-foreground">{month}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
