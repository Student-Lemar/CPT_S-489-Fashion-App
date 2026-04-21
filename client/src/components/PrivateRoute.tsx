import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  allowAdmin?: boolean;
}

export default function PrivateRoute({ children, allowAdmin }: Props) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div className="page">
        <div className="container">Loading…</div>
      </div>
    );

  if (!session) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (session.role === "admin" && !allowAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
