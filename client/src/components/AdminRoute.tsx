import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AdminRoute({ children }: Props) {
  const { session, loading } = useAuth();

  if (loading) return <div className="page"><div className="container">Loading…</div></div>;

  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
