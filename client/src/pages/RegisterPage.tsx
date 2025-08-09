import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'COMPANY_ADMIN' | 'SHOP_OWNER'>('COMPANY_ADMIN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(email, password, role)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
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
              <h2 className="h4 mb-4 text-center">Create your account</h2>
              <form onSubmit={onSubmit} className="vstack gap-3">
                <div>
                  <label className="form-label">Email</label>
                  <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Create a password" required />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <select className="form-select" value={role} onChange={(e) => setRole(e.target.value as any)}>
                    <option value="COMPANY_ADMIN">Company Admin</option>
                    <option value="SHOP_OWNER">Shop Owner</option>
                  </select>
                </div>
                {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
                <button className="btn btn-success w-100" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage


