import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SettingsProvider } from './lib/settings'
import { AuthProvider, RequireAdmin } from './lib/auth'
import PublicLayout from './components/PublicLayout'
import Home from './pages/public/Home'
import Project from './pages/public/Project'
import NotFound from './pages/public/NotFound'
import './styles/global.css'

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Login = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const ProjectsAdmin = lazy(() => import('./pages/admin/ProjectsAdmin'))
const ProjectEditor = lazy(() => import('./pages/admin/ProjectEditor'))
const ExperienceAdmin = lazy(() => import('./pages/admin/ExperienceAdmin'))
const SkillsAdmin = lazy(() => import('./pages/admin/SkillsAdmin'))
const MessagesAdmin = lazy(() => import('./pages/admin/MessagesAdmin'))
const SiteSettings = lazy(() => import('./pages/admin/SiteSettings'))
const Account = lazy(() => import('./pages/admin/Account'))

function AdminFallback() {
  return <div className="admin-loading">Loading admin…</div>
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="work/:slug" element={<Project />} />
            </Route>

            <Route
              path="admin/login"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="admin"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                </Suspense>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<ProjectsAdmin />} />
              <Route path="projects/new" element={<ProjectEditor />} />
              <Route path="projects/:id" element={<ProjectEditor />} />
              <Route path="experience" element={<ExperienceAdmin />} />
              <Route path="skills" element={<SkillsAdmin />} />
              <Route path="messages" element={<MessagesAdmin />} />
              <Route path="settings" element={<SiteSettings />} />
              <Route path="settings/:tab" element={<SiteSettings />} />
              <Route path="account" element={<Account />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
