import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2, User, Lock, Building2, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '@/components/ToastProvider'

function getUserId(): number | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  const match = token.match(/mock_token_(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

function getHospitalInfo() {
  try {
    const raw = localStorage.getItem('hospital_info')
    return raw ? JSON.parse(raw) : { name: '', address: '', phone: '', email: '' }
  } catch {
    return { name: '', address: '', phone: '', email: '' }
  }
}

function getNotificationPrefs() {
  try {
    const raw = localStorage.getItem('notification_prefs')
    return raw ? JSON.parse(raw) : {
      appointments: true,
      hospitalizations: true,
      prescriptions: true,
      billing: true,
      exams: true,
    }
  } catch {
    return { appointments: true, hospitalizations: true, prescriptions: true, billing: true, exams: true }
  }
}

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

export default function SettingsPage() {
  const { addToast } = useToast()
  const userId = getUserId()

  const [profile, setProfile] = useState({ name: '', email: '' })
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [hospital, setHospital] = useState(getHospitalInfo())
  const [hospitalSaving, setHospitalSaving] = useState(false)

  const [notifs, setNotifs] = useState(getNotificationPrefs())

  useEffect(() => {
    if (!userId) {
      setProfileLoading(false)
      return
    }
    fetch(`/api/settings/me?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile({ name: data.user.name || '', email: data.user.email || '' })
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false))
  }, [userId])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: profile.name, email: profile.email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      addToast('Profil mis a jour', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erreur lors de la mise a jour', 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast('Les mots de passe ne correspondent pas', 'error')
      return
    }
    setPasswordSaving(true)
    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      addToast('Mot de passe mis a jour', 'success')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erreur lors de la mise a jour', 'error')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHospitalSaving(true)
    localStorage.setItem('hospital_info', JSON.stringify(hospital))
    setTimeout(() => {
      addToast('Informations de l\'hopital sauvegardees', 'success')
      setHospitalSaving(false)
    }, 300)
  }

  const handleNotifToggle = (key: keyof typeof notifs) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    localStorage.setItem('notification_prefs', JSON.stringify(updated))
    addToast('Preferences mises a jour', 'success')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Parametres</h1>
          <p className="text-muted-foreground">Gerez votre profil et les preferences de l application.</p>
        </div>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom complet</label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={profileSaving}>
                  {profileSaving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe actuel</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                  minLength={6}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmer</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={passwordSaving}>
                {passwordSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Mise a jour...
                  </>
                ) : (
                  'Changer le mot de passe'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Hospital Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Informations de l hopital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleHospitalSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l hopital</label>
              <input
                value={hospital.name}
                onChange={(e) => setHospital({ ...hospital, name: e.target.value })}
                placeholder="Hopital General"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telephone</label>
                <input
                  value={hospital.phone}
                  onChange={(e) => setHospital({ ...hospital, phone: e.target.value })}
                  placeholder="+261 34 00 000 00"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={hospital.email}
                  onChange={(e) => setHospital({ ...hospital, email: e.target.value })}
                  placeholder="contact@hopital.mg"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Adresse</label>
              <input
                value={hospital.address}
                onChange={(e) => setHospital({ ...hospital, address: e.target.value })}
                placeholder="123 Rue de la Sante, Antananarivo"
                className={inputClass}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={hospitalSaving}>
                {hospitalSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Preferences de notification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'appointments' as const, label: 'Rendez-vous', desc: 'Notifications pour les nouveaux rendez-vous' },
              { key: 'hospitalizations' as const, label: 'Hospitalisations', desc: 'Notifications pour les admissions et sorties' },
              { key: 'prescriptions' as const, label: 'Prescriptions', desc: 'Notifications pour les nouvelles prescriptions' },
              { key: 'billing' as const, label: 'Facturation', desc: 'Alertes pour les factures et paiements' },
              { key: 'exams' as const, label: 'Examens', desc: 'Notifications pour les resultats d examens' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotifToggle(item.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    notifs[item.key] ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      notifs[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
