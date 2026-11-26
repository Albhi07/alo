import { lazy, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppShell, BareShell, PageFallback } from './components/AppShell'
import { useProfile } from './state/profile'

const Welcome = lazy(() => import('./pages/Welcome'))
const SignIn = lazy(() => import('./pages/SignIn'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Home = lazy(() => import('./pages/Home'))
const Subjects = lazy(() => import('./pages/Subjects'))
const SubjectPage = lazy(() => import('./pages/SubjectPage'))
const ChapterPage = lazy(() => import('./pages/ChapterPage'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminHome = lazy(() => import('./admin/AdminHome'))
const EntityList = lazy(() => import('./admin/EntityList'))
const EntityEdit = lazy(() => import('./admin/EntityEdit'))
const CsvImport = lazy(() => import('./admin/CsvImport'))
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'))
const Practice = lazy(() => import('./pages/Practice'))
const Drill = lazy(() => import('./pages/Drill'))
const Exam = lazy(() => import('./pages/Exam'))
const MockExam = lazy(() => import('./pages/MockExam'))
const MockResult = lazy(() => import('./pages/MockResult'))
const Focus = lazy(() => import('./pages/Focus'))
const Plan = lazy(() => import('./pages/Plan'))
const Notices = lazy(() => import('./pages/Notices'))
const Settings = lazy(() => import('./pages/Settings'))
const Tutor = lazy(() => import('./pages/Tutor'))
const Connect = lazy(() => import('./pages/people/Connect'))
const ParentView = lazy(() => import('./pages/people/ParentView'))
const Teacher = lazy(() => import('./pages/people/Teacher'))
const TeacherClass = lazy(() => import('./pages/people/TeacherClass'))
const Analytics = lazy(() => import('./admin/Analytics'))
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
      { path: '/parent', element: <ParentView /> },
      { path: '/teacher', element: <Teacher /> },
      { path: '/teacher/:id', element: <TeacherClass /> },
    ],
  },
  {
    element: <RequireProfile><AppShell /></RequireProfile>,
    children: [
      { path: '/', element: <Home /> },
      { path: '/subjects', element: <Subjects /> },
      { path: '/subjects/:code', element: <SubjectPage /> },
      { path: '/chapters/:id', element: <ChapterPage /> },
      { path: '/lessons/:id', element: <LessonPlayer /> },
      { path: '/practice/:chapterId', element: <Practice /> },
      { path: '/drill/:id', element: <Drill /> },
      { path: '/exam', element: <Exam /> },
      { path: '/exam/mock/:id', element: <MockExam /> },
      { path: '/exam/result/:id', element: <MockResult /> },
      { path: '/focus', element: <Focus /> },
      { path: '/plan', element: <Plan /> },
      { path: '/notices', element: <Notices /> },
      { path: '/tutor', element: <Tutor /> },
      { path: '/connect', element: <Connect /> },
      { path: '/settings', element: <Settings /> },
      {
        path: '/admin', element: <AdminLayout />,
        children: [
          { index: true, element: <AdminHome /> },
          { path: 'import', element: <CsvImport /> },
          { path: 'analytics', element: <Analytics /> },
          { path: ':entity', element: <EntityList /> },
          { path: ':entity/:key', element: <EntityEdit /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' })

export default function App() {
  return <RouterProvider router={router} />
}
