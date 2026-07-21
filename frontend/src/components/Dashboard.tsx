import { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import NotificationPanel from '@/components/NotificationPanel'
import { useNotifications } from '@/hooks/useNotifications'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  Search,
  Activity,
  Stethoscope,
  BedDouble,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  List,
  UserPlus,
  CalendarDays,
  Hospital,
  FolderOpen,
  Pill,
  TestTube,
  CreditCard,
  Phone,
  BarChart3,
  Bell,
} from 'lucide-react'

const patientsMenu = {
  name: 'Patients',
  icon: Users,
  children: [
    { name: 'Liste des patients', href: '/dashboard/patients', icon: List },
    { name: 'Ajouter un patient', href: '/dashboard/patients/add', icon: UserPlus },
    { name: 'Rendez-vous', href: '/dashboard/patients/appointments', icon: CalendarDays },
    { name: 'Hospitalisations', href: '/dashboard/patients/hospitalizations', icon: Hospital },
    { name: 'Dossiers medicaux', href: '/dashboard/patients/records', icon: FolderOpen },
    { name: 'Prescriptions', href: '/dashboard/patients/prescriptions', icon: Pill },
    { name: 'Examens', href: '/dashboard/patients/exams', icon: TestTube },
    { name: 'Facturation', href: '/dashboard/patients/billing', icon: CreditCard },
    { name: "Contacts d'urgence", href: '/dashboard/patients/emergency-contacts', icon: Phone },
  ],
}

const rapportsMenu = {
  name: 'Rapports',
  icon: BarChart3,
  children: [
    { name: 'Apercu general', href: '/dashboard/rapports', icon: BarChart3 },
    { name: 'Patients', href: '/dashboard/rapports/patients', icon: Users },
    { name: 'Hospitalisations', href: '/dashboard/rapports/hospitalisations', icon: BedDouble },
    { name: 'Activite medicale', href: '/dashboard/rapports/activite', icon: Activity },
    { name: 'Finance', href: '/dashboard/rapports/finance', icon: CreditCard },
  ],
}

const otherNav = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Parametres', href: '/dashboard/settings', icon: Settings },
]

const stats = [
  { name: 'Patients total', value: '1,234', icon: Users, change: '+12%', changeType: 'positive' },
  { name: 'Rendez-vous aujourd\'hui', value: '24', icon: Calendar, change: '+3', changeType: 'positive' },
  { name: 'Lits occupes', value: '45/60', icon: BedDouble, change: '75%', changeType: 'neutral' },
  { name: 'Activite recente', value: '89', icon: Activity, change: '+5%', changeType: 'positive' },
]

interface Patient {
  id: number
  lastName: string
  firstName: string
  createdAt: string
}

function SidebarNav({ onLinkClick, onLogout, unreadCount }: { onLinkClick?: () => void; onLogout?: () => void; unreadCount?: number }) {
  const location = useLocation()
  const [patientsOpen, setPatientsOpen] = useState(
    location.pathname.startsWith('/dashboard/patients')
  )
  const [rapportsOpen, setRapportsOpen] = useState(
    location.pathname.startsWith('/dashboard/rapports')
  )

  const isPatientsActive = location.pathname.startsWith('/dashboard/patients')
  const isRapportsActive = location.pathname.startsWith('/dashboard/rapports')

  return (
    <nav className="flex flex-col gap-1 flex-1">
      {otherNav.slice(0, 1).map((item) => {
        const isActive = location.pathname === item.href
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <item.icon className="size-4" />
            {item.name}
          </Link>
        )
      })}

      <button
        onClick={() => setPatientsOpen(!patientsOpen)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
          isPatientsActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }`}
      >
        <patientsMenu.icon className="size-4" />
        <span className="flex-1 text-left">{patientsMenu.name}</span>
        {patientsOpen ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </button>

      {patientsOpen && (
        <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
          {patientsMenu.children.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onLinkClick}
                className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="size-3.5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      )}

      <button
        onClick={() => setRapportsOpen(!rapportsOpen)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
          isRapportsActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }`}
      >
        <rapportsMenu.icon className="size-4" />
        <span className="flex-1 text-left">{rapportsMenu.name}</span>
        {rapportsOpen ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </button>

      {rapportsOpen && (
        <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
          {rapportsMenu.children.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onLinkClick}
                className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="size-3.5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      )}

      {otherNav.slice(1).map((item) => {
        const isActive = location.pathname === item.href
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <item.icon className="size-4" />
            {item.name}
          </Link>
        )
      })}

      <Link
        to="/dashboard/notifications"
        onClick={onLinkClick}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          location.pathname === '/dashboard/notifications'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }`}
      >
        <Bell className="size-4" />
        <span className="flex-1">Notifications</span>
        {(unreadCount ?? 0) > 0 && (
          <span className="flex items-center justify-center size-5 rounded-full bg-destructive text-[10px] font-bold text-white">
            {unreadCount! > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      <div className="mt-auto pt-4 border-t border-border">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="size-4" />
          Deconnexion
        </button>
      </div>
    </nav>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount } = useNotifications()

  const isHomePage = location.pathname === '/dashboard'

  useEffect(() => {
    if (!isHomePage) return
    fetch('/api/patients')
      .then((res) => res.json())
      .then((data) => {
        const patients: Patient[] = data.patients || []
        patients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setRecentPatients(patients.slice(0, 4))
      })
      .catch(() => {})
  }, [isHomePage])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-border bg-sidebar px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
              <Stethoscope className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Hospital</h1>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>

          <Separator />

          <SidebarNav onLogout={handleLogout} unreadCount={unreadCount} />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger className="lg:hidden fixed top-4 left-4 z-40">
          <Button variant="ghost" size="icon">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-border px-6 py-4">
            <SheetTitle className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
                <Stethoscope className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Hospital</h1>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <SidebarNav onLinkClick={() => setSidebarOpen(false)} onLogout={handleLogout} unreadCount={unreadCount} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-8">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher..."
                className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationPanel />
            <DropdownMenu>
              <DropdownMenuTrigger className="relative size-10 rounded-full">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    TU
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Test User</p>
                    <p className="text-xs text-muted-foreground">test@example.com</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Parametres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Deconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {isHomePage ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
                <p className="text-muted-foreground">Bienvenue, voici un apercu de votre hopital.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => (
                  <Card key={stat.name}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.name}
                      </CardTitle>
                      <stat.icon className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className={stat.changeType === 'positive' ? 'text-emerald-600' : 'text-muted-foreground'}>
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
                    <CardTitle className="flex items-center gap-2">
                      <Users className="size-5" />
                      Patients recents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPatients.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucun patient</p>
                      )}
                      {recentPatients.map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback className="bg-muted text-xs font-medium">
                                {patient.firstName?.[0]}{patient.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{patient.firstName} {patient.lastName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">Nouveau</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="size-5" />
                      Actions rapides
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/dashboard/patients/add">
                        <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                          <Users className="size-5" />
                          <span className="text-xs">Nouveau patient</span>
                        </Button>
                      </Link>
                      <Link to="/dashboard/patients/appointments">
                        <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                          <Calendar className="size-5" />
                          <span className="text-xs">Prendre RDV</span>
                        </Button>
                      </Link>
                      <Link to="/dashboard/patients/records">
                        <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                          <FileText className="size-5" />
                          <span className="text-xs">Nouveau dossier</span>
                        </Button>
                      </Link>
                      <Link to="/dashboard/rapports">
                        <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
                          <Activity className="size-5" />
                          <span className="text-xs">Voir rapports</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
