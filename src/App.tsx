import { lazy, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppShell, BareShell, PageFallback } from './components/AppShell'
import { useProfile } from './state/profile'

const Welcome = lazy(() => import('./pages/Welcome'))
const SignIn = lazy(() => import('./pages/SignIn'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Home = lazy(() => import('./pages/Home'))
const Subjects = lazy(() => import('./pages/Subjects'))
const Settings = lazy(() => import('./pages/Settings'))
const Placeholder = lazy(() => import('./pages/Placeholder'))
const NotFound = lazy(() => import('./pages/NotFound'))

/** Until this device has a profile, send the student to the welcome screen. */
function RequireProfile({ children }: { children: ReactNode }) {
  const profile = useProfile()
  if (profile === undefined) return <PageFallback />
  if (!profile?.onboarded) return <Navigate to="/welcome" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    element: <BareShell />,
    children: [
      { path: '/welcome', element: <Welcome /> },
      { path: '/signin', element: <SignIn /> },
      { path: '/onboarding', element: <Onboarding /> },
    ],
  },
  {
    element: <RequireProfile><AppShell /></RequireProfile>,
    children: [
      { path: '/', element: <Home /> },
      { path: '/subjects', element: <Subjects /> },
      { path: '/exam', element: <Placeholder section="exam" /> },
      { path: '/focus', element: <Placeholder section="focus" /> },
      { path: '/tutor', element: <Placeholder section="tutor" needsOnline /> },
      { path: '/settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
