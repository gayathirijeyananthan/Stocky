import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { getJson, postJson } from '../services/api'

export default function RegisterCompanyPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // 1) Create admin account
      await register(email, password, 'COMPANY_ADMIN')
      // 2) Create company with pending status
      await postJson<{ company: unknown }>(
        '/companies',
        { name: companyName, address, contact },
        // use latest token from localStorage
        JSON.parse(localStorage.getItem('auth') || '{}').accessToken
      )
      // 3) Navigate to dashboard and show approval waiting screen
      navigate('/dashboard', { state: { awaitingApproval: true } })
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4 mb-4 text-center">Join as a Company</h2>
              <form onSubmit={onSubmit} className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Company Name</label>
                  <input className="form-control" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Inc." required />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Contact</label>
                  <input className="form-control" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+1 234 567 890" />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Password</label>
                  <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required />
                </div>
                {error && (
                  <div className="col-12"><div className="alert alert-danger py-2">{error}</div></div>
                )}
                <div className="col-12">
                  <button className="btn btn-success w-100" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Company Account'}</button>
                </div>
                <div className="col-12 text-muted small">
                  By continuing, you agree to our Terms and Privacy Policy.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


