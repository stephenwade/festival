import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom';

import { RouteErrorBoundary } from './components/ErrorBoundary';
import { Spinner } from './components/Spinner';
import Index from './routes/_index';
import Show from './routes/$show';
import Admin from './routes/admin';
import { ProtectedAdminRoute } from './utils/auth-route-guards';

const EditShow = lazy(() => import('./routes/admin.shows.$show_.edit'));
const NewShow = lazy(() => import('./routes/admin.shows.new'));
const Shows = lazy(() => import('./routes/admin.shows'));
const ShowsIndex = lazy(() => import('./routes/admin.shows._index'));
const SignInRoute = lazy(() => import('./routes/admin.sign-in.$'));
const SignUpRoute = lazy(() => import('./routes/admin.sign-up.$'));
const UserOnHold = lazy(() => import('./routes/admin.user-on-hold'));
const ViewShow = lazy(() => import('./routes/admin.shows.$show'));

function CanonicalPathRedirect() {
  const location = useLocation();

  if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
    const canonicalPath = location.pathname.replace(/\/+$/, '');

    return (
      <Navigate
        replace
        to={`${canonicalPath}${location.search}${location.hash}`}
      />
    );
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <CanonicalPathRedirect />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Index /> },
      {
        path: 'admin/sign-in/*',
        element: <Admin />,
        children: [{ path: '*', element: <SignInRoute /> }],
      },
      {
        path: 'admin/sign-up/*',
        element: <Admin />,
        children: [{ path: '*', element: <SignUpRoute /> }],
      },
      {
        path: 'admin/user-on-hold',
        element: <Admin />,
        children: [{ index: true, element: <UserOnHold /> }],
      },
      {
        path: 'admin',
        element: <ProtectedAdminRoute />,
        children: [
          {
            element: <Admin />,
            children: [
              { index: true, element: <Navigate replace to="/admin/shows" /> },
              {
                path: 'shows',
                element: <Shows />,
                children: [
                  { index: true, element: <ShowsIndex /> },
                  { path: 'new', element: <NewShow /> },
                  { path: ':show/edit', element: <EditShow /> },
                  { path: ':show', element: <ViewShow /> },
                ],
              },
            ],
          },
        ],
      },
      { path: ':show', element: <Show /> },
    ],
  },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<Spinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
