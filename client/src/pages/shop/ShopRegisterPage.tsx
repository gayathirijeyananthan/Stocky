import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'

export default function ShopRegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [shopContact, setShopContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await (register as any)(email, password, 'SHOP_OWNER', {
        name: shopName,
        address: shopAddress,
        contact: shopContact,
      })
      if (user.role === 'SHOP_OWNER') {
        navigate('/shop/pending')
      } else {
        navigate('/')
      }
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
              <h2 className="h4 mb-4 text-center">Create your shop account</h2>
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
                  <label className="form-label">Shop name</label>
                  <input className="form-control" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g. Fresh Mart" required />
                </div>
                <div>
                  <label className="form-label">Address</label>
                  <input className="form-control" value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} placeholder="Street, City" />
                </div>
                <div>
                  <label className="form-label">Contact number</label>
                  <input className="form-control" value={shopContact} onChange={(e) => setShopContact(e.target.value)} placeholder="e.g. +1 555-1234" />
                </div>
                {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
                <button className="btn btn-success w-100" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Shop Account'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


