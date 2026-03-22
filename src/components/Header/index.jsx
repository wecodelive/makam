import React from "react";
import { Handbag } from "lucide-react";
import { UserRound } from "lucide-react";
import Modal from "../Modals/Modal";
import SideNav from "./SideNav";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import Cart from "./Cart";
import { APP_CART_UPDATED_EVENT, getCartSummary } from "../../utils/cart";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = React.useState(false);
  const [showCart, setShowCart] = React.useState(false);
  const [cartItemCount, setCartItemCount] = React.useState(0);
  const isAdminSession = Boolean(localStorage.getItem("adminId"));
  const profileRoute = isAdminSession ? "/admin" : "/user";

  const isCartRelatedRoute = location.pathname.startsWith("/checkout");
  const isUserRelatedRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/user") ||
    location.pathname.startsWith("/wishlist") ||
    location.pathname.startsWith("/orders") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/create-account");

  React.useEffect(() => {
    const syncCartCount = () => {
      setCartItemCount(getCartSummary().itemCount);
    };

    syncCartCount();
    window.addEventListener(APP_CART_UPDATED_EVENT, syncCartCount);

    return () => {
      window.removeEventListener(APP_CART_UPDATED_EVENT, syncCartCount);
    };
  }, []);

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };

  const toggleCart = () => {
    setShowCart((prev) => !prev);
  };

  return (
    <>
      <div>
        <header className="flex justify-between py-7 px-6">
          <img
            className="h-4 w-6.5"
            src="/icons/hamburger.svg"
            alt=""
            srcSet=""
            onClick={toggleModal}
          />

          <div className="flex justify-between w-[50%]">
            <img
              onClick={() => navigate("/")}
              className="h-7.25 w-7.25"
              src="/icons/logo.svg"
              alt=""
              srcSet=""
            />

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={toggleCart}
                className={`relative flex justify-center items-center outline-1 aspect-square rounded-full w-10 h-10 transition-all ${
                  isCartRelatedRoute
                    ? "bg-black text-white outline-black"
                    : "outline-[#D9D9D9] hover:outline-2 hover:outline-black"
                }`}
              >
                <Handbag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-4.5 h-4.5 rounded-full text-[10px] flex items-center justify-center px-1 ${
                      isCartRelatedRoute
                        ? "bg-white text-black"
                        : "bg-black text-white"
                    }`}
                  >
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(profileRoute)}
                className={`flex justify-center items-center outline-1 aspect-square rounded-full w-10 h-10 transition-all ${
                  isUserRelatedRoute
                    ? "bg-black text-white outline-black"
                    : "outline-[#D9D9D9] hover:outline-2 hover:outline-black"
                }`}
              >
                <UserRound className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
      </div>

      {showModal && (
        <Modal
          styles="w-full md:w-[50%] lg:w-[40%]"
          position="modal-right"
          closeModal={toggleModal}
        >
          <SideNav close={toggleModal} />
        </Modal>
      )}

      {showCart && (
        <Modal
          styles="w-full md:w-[50%] lg:w-[40%]"
          position="modal-right"
          closeModal={toggleCart}
        >
          <Cart close={toggleCart} />
        </Modal>
      )}
    </>
  );
}
