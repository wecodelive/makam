import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const AUTH_STATUS = {
  LOADING: "LOADING",
  AUTHENTICATED: "AUTHENTICATED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
};

const useAuthSession = () => {
  const [status, setStatus] = React.useState(AUTH_STATUS.LOADING);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!isMounted) return;

        if (response.ok && data?.success && data?.user?.id) {
          const nextUser = data.user;
          setUser(nextUser);
          setStatus(AUTH_STATUS.AUTHENTICATED);

          localStorage.setItem("userId", nextUser.id);
          localStorage.setItem("userEmail", nextUser.email || "");

          if (["ADMIN", "SUPER_ADMIN"].includes(nextUser.role)) {
            localStorage.setItem("adminId", nextUser.id);
            localStorage.setItem("adminEmail", nextUser.email || "");
          }
          return;
        }

        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminEmail");

        setUser(null);
        setStatus(AUTH_STATUS.UNAUTHENTICATED);
      } catch {
        if (!isMounted) return;

        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminEmail");

        setUser(null);
        setStatus(AUTH_STATUS.UNAUTHENTICATED);
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return { status, user };
};

export function RequireUserAuth({ children }) {
  const location = useLocation();
  const { status } = useAuthSession();

  if (status === AUTH_STATUS.LOADING) {
    return (
      <div className="px-4 py-10 text-[13px] text-[#0000008C]">Loading...</div>
    );
  }

  if (status === AUTH_STATUS.UNAUTHENTICATED) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export function RequireAdminAuth({ children }) {
  const location = useLocation();
  const { status, user } = useAuthSession();

  if (status === AUTH_STATUS.LOADING) {
    return (
      <div className="px-4 py-10 text-[13px] text-[#0000008C]">Loading...</div>
    );
  }

  if (status === AUTH_STATUS.UNAUTHENTICATED) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!["ADMIN", "SUPER_ADMIN"].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function PublicAuthRoute({ children, adminOnly = false }) {
  const { status, user } = useAuthSession();

  if (status === AUTH_STATUS.LOADING) {
    return (
      <div className="px-4 py-10 text-[13px] text-[#0000008C]">Loading...</div>
    );
  }

  if (status === AUTH_STATUS.AUTHENTICATED) {
    if (adminOnly) {
      if (["ADMIN", "SUPER_ADMIN"].includes(user?.role)) {
        return <Navigate to="/admin" replace />;
      }

      return children;
    }

    if (["ADMIN", "SUPER_ADMIN"].includes(user?.role)) {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}
