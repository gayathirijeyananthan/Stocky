import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'SUPER_ADMIN') {
        navigate('/admin')
      } else if (user.role === 'COMPANY_ADMIN') {
        navigate('/dashboard')
      } else {
        navigate(user.shopStatus === 'active' ? '/shop' : '/shop/pending')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4 mb-4 text-center">Login</h2>
              <form onSubmit={onSubmit} className="vstack gap-3">
                <div>
                  <label className="form-label">Email</label>
                  <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
                </div>
                {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
                <button className="btn btn-primary w-100" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage


