import { useNotifications, type Notification } from '@/hooks/useNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Hospital,
  Pill,
  CreditCard,
  TestTube,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

const typeConfig = {
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', label: 'Info' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Alerte' },
  error: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Erreur' },
  success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Succes' },
}

const linkIcons: Record<string, typeof Calendar> = {
  '/dashboard/appointments': Calendar,
  '/dashboard/hospitalizations': Hospital,
  '/dashboard/prescriptions': Pill,
  '/dashboard/billing': CreditCard,
  '/dashboard/exams': TestTube,
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "A l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days}j`
  return date.toLocaleDateString('fr-FR')
}

function NotificationCard({
  notification,
  onRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification
  onRead: (id: number) => void
  onDelete: (id: number) => void
  onNavigate: (link: string) => void
}) {
  const config = typeConfig[notification.type]
  const LinkIcon = notification.link ? linkIcons[notification.link] ?? Bell : Bell

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer group',
        notification.isRead
          ? 'bg-card hover:bg-muted/50'
          : 'bg-primary/5 border-primary/20 hover:bg-primary/10',
      )}
      onClick={() => {
        if (!notification.isRead) onRead(notification.id)
        if (notification.link) onNavigate(notification.link)
      }}
    >
      <div className={cn('shrink-0 size-10 rounded-lg flex items-center justify-center', config.bg)}>
        <LinkIcon className={cn('size-5', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={cn('text-sm font-medium', !notification.isRead && 'font-semibold')}>
            {notification.title}
          </h3>
          {!notification.isRead && (
            <span className="shrink-0 size-2 rounded-full bg-primary" />
          )}
          <Badge variant="outline" className="text-[10px] ml-auto">
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation()
              onRead(notification.id)
            }}
            title="Marquer comme lu"
          >
            <CheckCheck className="size-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification.id)
          }}
          title="Supprimer"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">Consultez et gérez vos notifications.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Toutes les notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} non lues</Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="size-4 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="size-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">Aucune notification</p>
              <p className="text-sm">Vous êtes à jour !</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                  onNavigate={(link) => navigate(link)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
