import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Download,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'

interface Invoice {
  id: number
  patientId: number
  patientName: string
  type: string
  amount: string
  paidAmount: string
  date: string
  status: string
  description: string | null
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

const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ReportsFinance() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/invoices')
      .then((res) => res.json())
      .then((data) => setInvoices(data.invoices || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const thisMonth = invoices.filter((i) => {
    const d = new Date(i.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const totalAmount = invoices.reduce((s, i) => s + parseFloat(i.amount || '0'), 0)
  const totalPaid = invoices.reduce((s, i) => s + parseFloat(i.paidAmount || '0'), 0)
  const totalUnpaid = totalAmount - totalPaid
  const paidCount = invoices.filter((i) => i.status === 'Paye').length
  const pendingCount = invoices.filter((i) => i.status === 'En attente').length
  const overdueCount = invoices.filter((i) => i.status === 'En retard').length

  const thisMonthAmount = thisMonth.reduce((s, i) => s + parseFloat(i.amount || '0'), 0)

  const typeStats: Record<string, { amount: number; paid: number; count: number }> = {}
  for (const i of invoices) {
    if (!typeStats[i.type]) typeStats[i.type] = { amount: 0, paid: 0, count: 0 }
    typeStats[i.type].amount += parseFloat(i.amount || '0')
    typeStats[i.type].paid += parseFloat(i.paidAmount || '0')
    typeStats[i.type].count++
  }
  const typeData = Object.entries(typeStats)
    .map(([name, s]) => ({
      name,
      amount: s.amount,
      paid: s.paid,
      count: s.count,
      percentage: totalAmount > 0 ? Math.round((s.amount / totalAmount) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const monthlyMap: Record<string, { amount: number; paid: number; count: number }> = {}
  for (const i of invoices) {
    const d = new Date(i.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { amount: 0, paid: 0, count: 0 }
    monthlyMap[key].amount += parseFloat(i.amount || '0')
    monthlyMap[key].paid += parseFloat(i.paidAmount || '0')
    monthlyMap[key].count++
  }
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({ month, ...data }))

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  const paymentRate = invoices.length > 0 ? Math.round((paidCount / invoices.length) * 100) : 0

  const exportCSV = useCallback(() => {
    downloadCSV(
      'finance.csv',
      ['ID', 'Patient', 'Type', 'Montant (AR)', 'Paye (AR)', 'Reste (AR)', 'Date', 'Statut'],
      invoices.map((i) => {
        const amt = parseFloat(i.amount || '0')
        const paid = parseFloat(i.paidAmount || '0')
        return [String(i.id), i.patientName, i.type, String(amt), String(paid), String(amt - paid), i.date, i.status]
      }),
    )
  }, [invoices])

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
          <h1 className="text-2xl font-bold">Rapport Finance</h1>
          <p className="text-muted-foreground">Revenus, depenses et rentabilite de l'hopital.</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total facture</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString('fr-FR')} AR</div>
            <p className="text-xs text-muted-foreground">
              {thisMonthAmount.toLocaleString('fr-FR')} AR ce mois
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total paye</CardTitle>
            <CheckCircle className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalPaid.toLocaleString('fr-FR')} AR</div>
            <p className="text-xs text-muted-foreground">{paymentRate}% recouvrement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Impayes</CardTitle>
            <AlertTriangle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalUnpaid.toLocaleString('fr-FR')} AR</div>
            <p className="text-xs text-muted-foreground">
              {pendingCount} en attente · {overdueCount} en retard
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Factures total</CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {thisMonth.length} ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenus par type + Evolution mensuelle */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenus par type</CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-4">
                {typeData.map((t) => (
                  <div key={t.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{t.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{t.amount.toLocaleString('fr-FR')} AR</span>
                        <span className="text-xs text-muted-foreground">{t.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.max(t.percentage, t.amount > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.count} factures · Paye: {t.paid.toLocaleString('fr-FR')} AR
                    </p>
                  </div>
                ))}
              </div>
            )}
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
              <>
                <div className="space-y-3">
                  {monthlyData.map((data) => {
                    const label = `${monthNames[parseInt(data.month.split('-')[1]) - 1]} ${data.month.split('-')[0]}`
                    const maxVal = Math.max(data.amount, data.paid, 1)
                    const profit = data.amount - data.paid
                    return (
                      <div key={data.month} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-14 text-muted-foreground">{label}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1">
                            <div
                              className="h-4 bg-primary/80 rounded min-w-[2px]"
                              style={{ width: `${(data.amount / maxVal) * 100}%` }}
                            />
                          </div>
                          <div className="flex-1">
                            <div
                              className="h-4 bg-emerald-500/80 rounded min-w-[2px]"
                              style={{ width: `${(data.paid / maxVal) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 w-20 justify-end">
                          {profit >= 0 ? (
                            <ArrowUpRight className="size-3 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="size-3 text-red-600" />
                          )}
                          <span className="text-xs font-medium">
                            {profit >= 0 ? '+' : ''}{(profit / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="size-3 bg-primary/80 rounded" />
                    <span className="text-xs text-muted-foreground">Facture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 bg-emerald-500/80 rounded" />
                    <span className="text-xs text-muted-foreground">Paye</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recouvrement + Statut */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taux de recouvrement</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Paye ({paidCount})</span>
                    <span className="text-sm font-bold text-emerald-600">{totalPaid.toLocaleString('fr-FR')} AR</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${invoices.length > 0 ? (paidCount / invoices.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">En attente ({pendingCount})</span>
                    <span className="text-sm font-bold text-amber-600">
                      {invoices.filter((i) => i.status === 'En attente').reduce((s, i) => s + parseFloat(i.amount || '0'), 0).toLocaleString('fr-FR')} AR
                    </span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${invoices.length > 0 ? (pendingCount / invoices.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">En retard ({overdueCount})</span>
                    <span className="text-sm font-bold text-red-600">
                      {invoices.filter((i) => i.status === 'En retard').reduce((s, i) => s + parseFloat(i.amount || '0'), 0).toLocaleString('fr-FR')} AR
                    </span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${invoices.length > 0 ? (overdueCount / invoices.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Montant par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee</p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Total facture', value: totalAmount, color: 'text-foreground' },
                  { label: 'Paye', value: totalPaid, color: 'text-emerald-600' },
                  { label: 'Impayes', value: totalUnpaid, color: 'text-amber-600' },
                  { label: 'Moyenne / facture', value: invoices.length > 0 ? totalAmount / invoices.length : 0, color: 'text-muted-foreground' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>
                      {item.value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} AR
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Factures recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Factures recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune facture</p>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((inv) => {
                const amt = parseFloat(inv.amount || '0')
                const paid = parseFloat(inv.paidAmount || '0')
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <CreditCard className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">#{inv.id} — {inv.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.type}
                          {inv.description ? ` · ${inv.description}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold">{amt.toLocaleString('fr-FR')} AR</p>
                        {paid > 0 && paid < amt && (
                          <p className="text-xs text-emerald-600">
                            Paye: {paid.toLocaleString('fr-FR')} AR
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          inv.status === 'Paye'
                            ? 'default'
                            : inv.status === 'En retard'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {inv.status === 'Paye' && <CheckCircle className="mr-1 size-3" />}
                        {inv.status === 'En retard' && <Clock className="mr-1 size-3" />}
                        {inv.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{inv.date}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
