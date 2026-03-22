import React from "react";
import { useNavigate } from "react-router";
import { logoutSession } from "../../services/adminFunctions";
import { notifyError, notifySuccess } from "../../utils/notify";

export default function SideNav({ close }) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isAdminSession, setIsAdminSession] = React.useState(() =>
    Boolean(localStorage.getItem("adminId")),
  );
  const [hasSession, setHasSession] = React.useState(() =>
    Boolean(localStorage.getItem("userId") || localStorage.getItem("adminId")),
  );

  React.useEffect(() => {
    const syncSessionState = () => {
      setIsAdminSession(Boolean(localStorage.getItem("adminId")));
      setHasSession(
        Boolean(
          localStorage.getItem("userId") || localStorage.getItem("adminId"),
        ),
      );
    };

    window.addEventListener("storage", syncSessionState);
    return () => window.removeEventListener("storage", syncSessionState);
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      const response = await logoutSession();

      if (!response?.success) {
        throw new Error(response?.message || "Failed to sign out");
      }

      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminEmail");
      setIsAdminSession(false);
      setHasSession(false);

      notifySuccess("Signed out successfully");
      close();
      navigate("/login", { replace: true });
    } catch (error) {
      notifyError(error.message || "Unable to sign out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="h-[80vh] overflow-hidden flex flex-col bg-white px-6 py-8">
      <div className="flex flex-col items-center justify-center gap-10">
        <h1
          className="text-3xl cursor-pointer"
          onClick={() => {
            close();
            navigate("/");
          }}
        >
          Home
        </h1>
        <h2
          className="text-3xl cursor-pointer"
          onClick={() => {
            close();
            navigate("/products");
          }}
        >
          Collections
        </h2>
        <h2
          className="text-3xl cursor-pointer"
          onClick={() => {
            close();
            navigate("/new");
          }}
        >
          New
        </h2>
      </div>

      <div className="mt-auto border-t border-[#DFDFDF] pt-5 flex flex-col items-center gap-3">
        <p className="text-[11px] uppercase tracking-[1.5px] text-[#0000008C]">
          Account
        </p>

        {isAdminSession && (
          <button
            type="button"
            className="text-lg cursor-pointer underline underline-offset-4"
            onClick={() => {
              close();
              navigate("/admin");
            }}
          >
            Admin
          </button>
        )}

        {hasSession && (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="text-lg cursor-pointer underline underline-offset-4 disabled:opacity-50"
          >
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </button>
        )}

        {!hasSession && (
          <>
            <button
              type="button"
              className="text-lg cursor-pointer underline underline-offset-4"
              onClick={() => {
                close();
                navigate("/login");
              }}
            >
              Login
            </button>

            <button
              type="button"
              className="text-lg cursor-pointer underline underline-offset-4"
              onClick={() => {
                close();
                navigate("/admin/login");
              }}
            >
              Admin Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
