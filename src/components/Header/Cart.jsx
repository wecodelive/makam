import React from "react";
import { useNavigate } from "react-router";
import { X, RefreshCcw } from "lucide-react";
import Button from "../Buttons";
import {
  APP_CART_UPDATED_EVENT,
  clearCart,
  getCartSummary,
  removeFromCart,
  updateCartItemQuantity,
} from "../../utils/cart";

export default function Cart({ close }) {
  const navigate = useNavigate();

  const [cartSummary, setCartSummary] = React.useState(() => getCartSummary());

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  React.useEffect(() => {
    const syncCart = () => {
      setCartSummary(getCartSummary());
    };

    window.addEventListener(APP_CART_UPDATED_EVENT, syncCart);
    return () => window.removeEventListener(APP_CART_UPDATED_EVENT, syncCart);
  }, []);

  const { items, subtotal, total } = cartSummary;

  return (
    <div className="flex pb-5 flex-col gap-10 bg-white">
      <div className="flex items-center justify-between gap-4 uppercase text-[13px] font-medium leading-10 ">
        <h2>Shopping Bag</h2>
        {/* <button
          type="button"
          onClick={close}
          className="hover:opacity-70 transition-opacity"
        >
          <X className="cursor-pointer stroke-1 text-[#5E5E5E] text-[10px]" />
        </button> */}
      </div>

      <div>
        {items.length === 0 ? (
          <div className="py-10 text-[13px] text-[#0000008C]">
            Your cart is empty.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 border-b border-[#DFDFDF] pb-4"
              >
                <div
                  className="h-30 w-25 shrink-0 border border-[#00000014] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    navigate(`/product/${item.productId}`);
                    close();
                  }}
                >
                  <img
                    src={item.image || "/placeHolder.jpg"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <h3 className="text-[13px] font-medium uppercase">
                    {item.name}
                  </h3>
                  <p className="text-[12px] text-[#0000008C]">
                    {item.categoryName || "Product"}
                  </p>
                  <p className="text-[13px] font-semibold">
                    {formatCurrency(item.unitPrice)}
                  </p>

                  <div className="border text-center w-7 border-[#5E5E5E]">
                    <button
                      type="button"
                      className="text-[#5E5E5E] w-7 h-5.75"
                      onClick={() =>
                        updateCartItemQuantity(
                          item.productId,
                          item.quantity + 1,
                        )
                      }
                    >
                      +
                    </button>
                    <div className="flex items-center justify-center w-7 h-5.75 text-[10px] border-t border-b text-black border-[#5E5E5E]">
                      {item.quantity}
                    </div>
                    <button
                      type="button"
                      className="text-[#5E5E5E] w-7 h-5.75"
                      onClick={() => {
                        if (item.quantity <= 1) {
                          removeFromCart(item.productId);
                          return;
                        }

                        updateCartItemQuantity(
                          item.productId,
                          item.quantity - 1,
                        );
                      }}
                    >
                      -
                    </button>
                  </div>

                  <button
                    type="button"
                    className="w-fit flex items-center gap-1 text-[12px] text-[#5E5E5E] hover:text-red-500 transition-colors"
                    onClick={() => removeFromCart(item.productId)}
                    title="Remove item"
                  >
                    <RefreshCcw className="stroke-1 w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={clearCart}
              className="w-fit text-[12px] text-[#0000008C] underline hover:text-red-500 transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}

        <div className="flex flex-col mt-10">
          <h2 className="text-[14px] font-medium"> Order Summary</h2>

          <div className="border-b border-[#DFDFDF] py-6 mt-3 flex flex-col">
            <div className="justify-between flex">
              <span className="text-[12px] font-medium">Subtotal</span>
              <span className="text-[12px] font-medium">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="justify-between flex">
              <span className="text-[12px] font-medium">Shipping</span>
              <span className="text-[12px] text-[#0000008C] font-medium">
                {"Calculated at next step"}
              </span>
            </div>
          </div>
          <div className="justify-between flex mt-6">
            <span className="text-[16px] font-medium uppercase">Total</span>
            <span className="text-[16px]  font-medium">
              {formatCurrency(total)}
            </span>
          </div>

          <Button
            value="CHECKOUT"
            className="mt-12 w-full text-center items-center justify-center flex"
            onClick={() => {
              close();
              navigate("/checkout");
            }}
          />
        </div>
      </div>
    </div>
  );
}
