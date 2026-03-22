import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "../Inputs";
import Button from "../Buttons";
import { Facebook, InstagramIcon, Twitter } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const [isAdminSession, setIsAdminSession] = useState(() =>
    Boolean(localStorage.getItem("adminId")),
  );
  const profileRoute = isAdminSession ? "/admin" : "/user";
  const [hasSession, setHasSession] = useState(() =>
    Boolean(localStorage.getItem("userId") || localStorage.getItem("adminId")),
  );

  useEffect(() => {
    const syncSession = () => {
      setIsAdminSession(Boolean(localStorage.getItem("adminId")));
      setHasSession(
        Boolean(
          localStorage.getItem("userId") || localStorage.getItem("adminId"),
        ),
      );
    };

    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  return (
    <div className="bg-[#F5F5F5] h-fit flex flex-col  px-6 py-15 justify-center gap-6">
      <img className="h-14 w-14 mb-3" src="/icons/logo.svg" alt="logo" />

      <div className="flex flex-col gap-4">
        <h3 className=" text-[20px] tracking-[2px]">
          Subscribe to our newsletter
        </h3>
        <p className="tracking-[1px]">
          Get all our latest updates and offers delivered straight to your
          inbox.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          label="Email Address"
          placeholder="Enter your email"
          id="email"
          type="email"
          inputVariant="h-[56px] w-full lg:w-1/3"
          placeVariant=""
        />

        <Button value="Subscribe" />
      </div>

      <div className="mt-6">
        <ul className="space-y-1.5">
          <li
            className="w-fit text-[20px] tracking-[2px] cursor-pointer underline underline-offset-4"
            onClick={() => navigate("/")}
          >
            Home
          </li>
          <li
            className="w-fit text-[20px] tracking-[2px] cursor-pointer underline underline-offset-4"
            onClick={() => navigate("/products")}
          >
            Collections
          </li>
          <li
            className="w-fit text-[20px] tracking-[2px] cursor-pointer underline underline-offset-4"
            onClick={() => navigate("/products?q=new")}
          >
            New Arrivals
          </li>
        </ul>
      </div>

      <div className="mt-1 border-t border-[#DFDFDF] pt-5 flex flex-col gap-2">
        <p className="text-[11px] uppercase tracking-[1.5px] text-[#0000008C]">
          Account
        </p>
        <ul className="space-y-1.5">
          {hasSession ? (
            <>
              {isAdminSession && (
                <li
                  className="w-fit text-[16px] cursor-pointer underline underline-offset-4"
                  onClick={() => navigate("/admin")}
                >
                  Admin
                </li>
              )}
              <li
                className="w-fit text-[16px] cursor-pointer underline underline-offset-4"
                onClick={() => navigate(profileRoute)}
              >
                My Account
              </li>
              <li
                className="w-fit text-[16px] cursor-pointer underline underline-offset-4"
                onClick={() => navigate("/orders")}
              >
                Orders
              </li>
              <li
                className="w-fit text-[16px] cursor-pointer underline underline-offset-4"
                onClick={() => navigate("/wishlist")}
              >
                Wishlist
              </li>
            </>
          ) : (
            <>
              <li
                className="w-fit text-[16px] cursor-pointer underline underline-offset-4"
                onClick={() => navigate("/login")}
              >
                Login
              </li>
              <li
                className="w-fit text-[16px] cursor-pointer underline underline-offset-4"
                onClick={() => navigate("/create-account")}
              >
                Create Account
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="flex flex-col gap-10 tracking-[1px]">
        <p className="capitalize">
          Makam shoes are some of the best in the market, and we are committed
          to providing our customers with the best shopping experience possible.
        </p>

        <p className="text-center font-semibold">
          CopyRight &copy; {new Date().getFullYear()} Makam. All rights
          reserved.
        </p>
      </div>

      <div className="mt-3 flex self-center gap-3 text-3xl">
        <Twitter className="h-8 w-8 hover:cursor-pointer" />
        <InstagramIcon className="h-8 w-8 hover:cursor-pointer" />
        <Facebook className="h-8 w-8 hover:cursor-pointer" />
      </div>
    </div>
  );
}
