import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'

const statsCards = [
  { title: 'Revenus totaux', value: '12.5M AR', change: '+8%', positive: true, icon: TrendingUp, color: 'text-emerald-600' },
  { title: 'Depenses', value: '8.2M AR', change: '+5%', positive: false, icon: TrendingDown, color: 'text-red-600' },
  { title: 'Benefice net', value: '4.3M AR', change: '+12%', positive: true, icon: DollarSign, color: 'text-primary' },
  { title: 'Factures en attente', value: '23', change: '-15%', positive: true, icon: CreditCard, color: 'text-amber-600' },
]

const revenueByService = [
  { name: 'Consultations', amount: 4200000, percentage: 34 },
  { name: 'Hospitalisations', amount: 3500000, percentage: 28 },
  { name: 'Examens & Labo', amount: 2800000, percentage: 22 },
  { name: 'Pharmacie', amount: 1500000, percentage: 12 },
  { name: 'Autres', amount: 500000, percentage: 4 },
]

const monthlyFinance = [
  { month: 'Jan', revenue: 10200000, expenses: 7800000 },
  { month: 'Fev', revenue: 11000000, expenses: 7900000 },
  { month: 'Mar', revenue: 11800000, expenses: 8100000 },
  { month: 'Avr', revenue: 10800000, expenses: 7700000 },
  { month: 'Mai', revenue: 12000000, expenses: 8000000 },
  { month: 'Jun', revenue: 12500000, expenses: 8200000 },
]

const recentInvoices = [
  { id: 'INV-2026-089', patient: 'Marie Rakoto', amount: '450 000 AR', status: 'Paye' },
  { id: 'INV-2026-088', patient: 'Jean Rabe', amount: '320 000 AR', status: 'En attente' },
  { id: 'INV-2026-087', patient: 'Sophie Andry', amount: '180 000 AR', status: 'Paye' },
  { id: 'INV-2026-086', patient: 'Paul Rasoamanarivo', amount: '560 000 AR', status: 'En retard' },
  { id: 'INV-2026-085', patient: 'Hélène Razafy', amount: '275 000 AR', status: 'Paye' },
]

export default function ReportsFinance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapport Finance</h1>
          <p className="text-muted-foreground">Revenus, depenses et rentabilite de l'hopital.</p>
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
            <CardTitle className="text-base">Revenus par service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByService.map((service) => (
                <div key={service.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{service.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{(service.amount / 1000000).toFixed(1)}M</span>
                      <span className="text-xs text-muted-foreground">{service.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${service.percentage * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenus vs Depenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyFinance.map((data) => {
                const maxVal = 13000000
                return (
                  <div key={data.month} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-8 text-muted-foreground">{data.month}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1">
                        <div className="h-4 bg-emerald-500/80 rounded" style={{ width: `${(data.revenue / maxVal) * 100}%` }} />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-red-400/80 rounded" style={{ width: `${(data.expenses / maxVal) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 w-20 justify-end">
                      {data.revenue > data.expenses ? (
                        <ArrowUpRight className="size-3 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="size-3 text-red-600" />
                      )}
                      <span className="text-xs font-medium">
                        {((data.revenue - data.expenses) / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-emerald-500/80 rounded" />
                <span className="text-xs text-muted-foreground">Revenus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 bg-red-400/80 rounded" />
                <span className="text-xs text-muted-foreground">Depenses</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Factures recentes</CardTitle>
          <Button variant="ghost" size="sm">Voir tout</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <CreditCard className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{invoice.id}</p>
                    <p className="text-xs text-muted-foreground">{invoice.patient}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{invoice.amount}</span>
                  <Badge
                    variant={
                      invoice.status === 'Paye'
                        ? 'default'
                        : invoice.status === 'En attente'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-xs"
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
