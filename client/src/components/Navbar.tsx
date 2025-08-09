import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function Navbar() {
  const { state, logout } = useAuth()
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Stocky</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExample" aria-controls="navbarsExample" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarsExample">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {!state.user && (
              <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
            )}
            {state.user && (
              <>
                <li className="nav-item"><span className="nav-link disabled">{state.user.email}</span></li>
                <li className="nav-item"><button className="btn btn-outline-light btn-sm ms-2" onClick={logout}>Logout</button></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}


