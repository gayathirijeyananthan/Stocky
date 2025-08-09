import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import LandingPage from './pages/LandingPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import RegisterCompanyPage from './pages/RegisterCompanyPage.tsx'
import { AuthProvider } from './state/AuthContext.tsx'
import { UIProvider } from './state/UIContext.tsx'
import DashboardLayout from './layout/DashboardLayout.tsx'
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard.tsx'
import CompaniesManagement from './pages/admin/CompaniesManagement.tsx'
import CompanyDashboard from './pages/company/CompanyDashboard.tsx'
import ShopDashboard from './pages/shop/ShopDashboard.tsx'
import { Navigate } from 'react-router-dom'
import { useAuth } from './state/AuthContext.tsx'

function RoleGuard({ children, allow }: { children: React.ReactNode; allow: Array<'SUPER_ADMIN'|'COMPANY_ADMIN'|'SHOP_OWNER'> }) {
  const { state } = useAuth()
  if (!state.user) return <Navigate to="/login" replace />
  if (!allow.includes(state.user.role as any)) return <Navigate to="/" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'register/company', element: <RegisterCompanyPage /> },
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          { path: 'admin', element: <RoleGuard allow={['SUPER_ADMIN']}><SuperAdminDashboard /></RoleGuard> },
          { path: 'admin/companies', element: <RoleGuard allow={['SUPER_ADMIN']}><CompaniesManagement /></RoleGuard> },
          { path: 'dashboard', element: <RoleGuard allow={['COMPANY_ADMIN']}><CompanyDashboard /></RoleGuard> },
          { path: 'shop', element: <RoleGuard allow={['SHOP_OWNER']}><ShopDashboard /></RoleGuard> },
          // Placeholders for other company tabs routes
          { path: 'stores', element: <RoleGuard allow={['COMPANY_ADMIN']}><CompanyDashboard /></RoleGuard> },
          { path: 'products', element: <RoleGuard allow={['COMPANY_ADMIN']}><CompanyDashboard /></RoleGuard> },
          { path: 'deliveries', element: <RoleGuard allow={['COMPANY_ADMIN']}><CompanyDashboard /></RoleGuard> },
          { path: 'requests', element: <RoleGuard allow={['COMPANY_ADMIN']}><CompanyDashboard /></RoleGuard> },
          { path: 'restocks', element: <RoleGuard allow={['COMPANY_ADMIN']}><CompanyDashboard /></RoleGuard> },
          { path: 'shop/companies', element: <RoleGuard allow={['SHOP_OWNER']}><ShopDashboard /></RoleGuard> },
          { path: 'shop/stock', element: <RoleGuard allow={['SHOP_OWNER']}><ShopDashboard /></RoleGuard> },
        ]
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <UIProvider>
        <RouterProvider router={router} />
      </UIProvider>
    </AuthProvider>
  </StrictMode>,
)
