import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { type PropsWithChildren, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Spinner } from '../components/Spinner';
import { useTRPC } from '../trpc';

function buildSignInPath(location: ReturnType<typeof useLocation>) {
  const redirectUrl = `${location.pathname}${location.search}${location.hash}`;
  const searchParams = new URLSearchParams({ redirect_url: redirectUrl });
  return `/admin/sign-in?${searchParams.toString()}`;
}

function useAuthStatus() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const shouldCheckStatus = isLoaded && isSignedIn;
  const statusQuery = useQuery({
    ...trpc.auth.getStatus.queryOptions(),
    enabled: shouldCheckStatus,
  });

  if (shouldCheckStatus && statusQuery.error) {
    throw statusQuery.error;
  }

  return {
    isClerkLoaded: isLoaded,
    isSignedIn,
    location,
    navigate,
    statusQuery,
  };
}

export function ProtectedAdminRoute() {
  const { isClerkLoaded, isSignedIn, location, navigate, statusQuery } =
    useAuthStatus();

  useEffect(() => {
    if (statusQuery.data === 'forbidden') {
      void navigate('/admin/user-on-hold', { replace: true });
    }
  }, [navigate, statusQuery.data]);

  if (!isClerkLoaded) {
    return <Spinner />;
  }

  if (!isSignedIn) {
    return <Navigate replace to={buildSignInPath(location)} />;
  }

  return <Outlet />;
}

export function AdminAuthPageGuard({ children }: PropsWithChildren) {
  const { isClerkLoaded, isSignedIn, location, navigate, statusQuery } =
    useAuthStatus();

  useEffect(() => {
    if (statusQuery.data === 'forbidden') {
      void navigate('/admin/user-on-hold', { replace: true });
    }
  }, [navigate, statusQuery.data]);

  if (!isClerkLoaded) {
    return <Spinner />;
  }

  if (!isSignedIn) {
    return children;
  }

  const redirectUrl =
    new URLSearchParams(location.search).get('redirect_url') ?? '/admin';
  return <Navigate replace to={redirectUrl} />;
}

export function UserOnHoldPageGuard({ children }: PropsWithChildren) {
  const { isClerkLoaded, isSignedIn, location, navigate, statusQuery } =
    useAuthStatus();

  useEffect(() => {
    if (statusQuery.data === 'ok') {
      void navigate('/admin', { replace: true });
    }
  }, [navigate, statusQuery.data]);

  if (!isClerkLoaded) {
    return <Spinner />;
  }

  if (!isSignedIn) {
    return <Navigate replace to={buildSignInPath(location)} />;
  }

  return children;
}
