import { Outlet } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'

function App() {
  return (
    <div id="root-layout" className="bg-body-tertiary min-vh-100 d-flex flex-column">
      <Navbar />
      <main className="flex-grow-1 py-4">
        <Outlet />
      </main>
      <footer className="bg-dark text-white-50 py-3 mt-auto">
        <div className="container small">© {new Date().getFullYear()} Stocky</div>
      </footer>
    </div>
  )
}

export default App
