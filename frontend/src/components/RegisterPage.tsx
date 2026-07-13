import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de l'inscription")
      }

      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg"
            aria-hidden="true"
          >
            <svg
              className="w-8 h-8 text-on-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Hospital Management</h1>
          <p className="text-foreground/60 mt-1">Creez votre compte</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-2xl p-8 shadow-xl border border-border"
          noValidate
        >
          {error && (
            <div
              role="alert"
              className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-3 mb-6"
            >
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Nom complet
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              aria-required="true"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:ring-3 focus:ring-ring focus:border-transparent transition-all duration-200"
              placeholder="Jean Dupont"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              aria-required="true"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:ring-3 focus:ring-ring focus:border-transparent transition-all duration-200"
              placeholder="vous@exemple.com"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              aria-required="true"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:ring-3 focus:ring-ring focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              aria-required="true"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:ring-3 focus:ring-ring focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-on-primary font-semibold rounded-lg transition-all duration-200 cursor-pointer min-h-[44px]"
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>

          <p className="text-center text-foreground/60 text-sm mt-6">
            Deja un compte ?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary-hover font-medium transition-colors duration-200 underline underline-offset-2"
            >
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
