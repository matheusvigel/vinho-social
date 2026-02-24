import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PageSpinner } from '@/components/ui/Spinner'
import { ROUTES } from '@/constants/routes'

// Lazy loading de todas as páginas
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))

const FeedPage = lazy(() => import('@/pages/feed/FeedPage'))
const CellarPage = lazy(() => import('@/pages/cellar/CellarPage'))
const AddWinePage = lazy(() => import('@/pages/cellar/AddWinePage'))
const WineDetailPage = lazy(() => import('@/pages/cellar/WineDetailPage'))
const CatalogPage = lazy(() => import('@/pages/catalog/CatalogPage'))
const CatalogWineDetailPage = lazy(() => import('@/pages/catalog/CatalogWineDetailPage'))
const ConfrariasPage = lazy(() => import('@/pages/confrarias/ConfrariasPage'))
const ConfrariaDetailPage = lazy(() => import('@/pages/confrarias/ConfrariaDetailPage'))
const CreateConfrariaPage = lazy(() => import('@/pages/confrarias/CreateConfrariaPage'))
const SearchPage = lazy(() => import('@/pages/search/SearchPage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const EditProfilePage = lazy(() => import('@/pages/profile/EditProfilePage'))

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  // Rotas públicas de autenticação
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <SuspensePage><LoginPage /></SuspensePage>,
      },
      {
        path: ROUTES.REGISTER,
        element: <SuspensePage><RegisterPage /></SuspensePage>,
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: <SuspensePage><ForgotPasswordPage /></SuspensePage>,
      },
    ],
  },

  // Rotas protegidas (requerem autenticação)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <SuspensePage><FeedPage /></SuspensePage>,
          },

          // Adega
          {
            path: ROUTES.CELLAR,
            element: <SuspensePage><CellarPage /></SuspensePage>,
          },
          {
            path: ROUTES.CELLAR_ADD,
            element: <SuspensePage><AddWinePage /></SuspensePage>,
          },
          {
            path: ROUTES.CELLAR_WINE,
            element: <SuspensePage><WineDetailPage /></SuspensePage>,
          },

          // Catálogo
          {
            path: ROUTES.CATALOG,
            element: <SuspensePage><CatalogPage /></SuspensePage>,
          },
          {
            path: ROUTES.CATALOG_WINE,
            element: <SuspensePage><CatalogWineDetailPage /></SuspensePage>,
          },

          // Confrarias
          {
            path: ROUTES.CONFRARIAS,
            element: <SuspensePage><ConfrariasPage /></SuspensePage>,
          },
          {
            path: ROUTES.CONFRARIA_NEW,
            element: <SuspensePage><CreateConfrariaPage /></SuspensePage>,
          },
          {
            path: ROUTES.CONFRARIA,
            element: <SuspensePage><ConfrariaDetailPage /></SuspensePage>,
          },

          // Social
          {
            path: ROUTES.SEARCH,
            element: <SuspensePage><SearchPage /></SuspensePage>,
          },
          {
            path: ROUTES.NOTIFICATIONS,
            element: <SuspensePage><NotificationsPage /></SuspensePage>,
          },

          // Perfil
          {
            path: ROUTES.PROFILE_EDIT,
            element: <SuspensePage><EditProfilePage /></SuspensePage>,
          },
          {
            path: ROUTES.PROFILE,
            element: <SuspensePage><ProfilePage /></SuspensePage>,
          },
        ],
      },
    ],
  },
])
