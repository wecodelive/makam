import React from "react";
import { Input } from "../../components/Inputs";
import Button from "../../components/Buttons";
import { MoveLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "./components/OrderCard";
import {
  APP_CART_UPDATED_EVENT,
  clearCart,
  getCartSummary,
} from "../../utils/cart";
import { placeCheckoutOrder } from "../../services/adminFunctions";
import { notifyError, notifySuccess } from "../../utils/notify";

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    country: "",
    region: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [cartSummary, setCartSummary] = useState(() => getCartSummary());

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

    syncCart();
    window.addEventListener(APP_CART_UPDATED_EVENT, syncCart);

    return () => {
      window.removeEventListener(APP_CART_UPDATED_EVENT, syncCart);
    };
  }, []);

  const orders = React.useMemo(
    () =>
      cartSummary.items.map((item) => ({
        productId: item.productId,
        image: item.image || "/placeHolder.jpg",
        orderTitle: item.name,
        orderColour: item.categoryName || "Standard",
        orderSize: "-",
        orderNo: String(item.quantity),
        orderCost: formatCurrency(
          (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
        ),
      })),
    [cartSummary.items],
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!cartSummary.items.length) {
      notifyError("Your cart is empty.");
      return;
    }

    if (!formData.email.trim()) {
      notifyError("Email is required to place order.");
      return;
    }

    try {
      setSubmittingOrder(true);

      const payload = {
        customer: {
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
        },
        shippingAddress: {
          country: formData.country.trim(),
          region: formData.region.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
        },
        items: cartSummary.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await placeCheckoutOrder(payload);

      if (!response.success) {
        throw new Error(response.message || "Unable to place order");
      }

      clearCart();
      notifySuccess("Order placed successfully.");
      navigate(`/orders/${response.order.id}`);
    } catch (error) {
      console.error("Error placing checkout order:", error);
      notifyError(error.message || "Unable to place order");
    } finally {
      setSubmittingOrder(false);
    }
  };
  return (
    <div className="px-6 py-10">
      <MoveLeft
        className="mb-7.5 cursor-pointer"
        onClick={() => navigate(-1)}
      />
      <div>
        <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px]">
          CHECKOUT
        </h1>
        <div className="mb-3 inline-flex items-center rounded-full border border-[#0000001A] bg-[#00000005] px-3 py-1 text-[11px] font-medium uppercase tracking-[1px] text-[#0000008C]">
          Guest checkout available — no account required
        </div>
        <div className="flex font-medium text-[12px] tracking-0 justify-between">
          <span id="information">INFORMATION</span>
          <span id="shipping">SHIPPING</span>
          <span id="payment">PAYMENT</span>
        </div>
      </div>
      <section className="flex flex-col gap-y-10 lg:flex-row">
        <form className="flex flex-col gap-3 mt-3" onSubmit={handleSubmit}>
          <fieldset className="my-3">
            <legend className="my-3">CONTACT INFO</legend>
            <div className="grid grid-rows-1 gap-y-2">
              <Input
                label=""
                placeholder="Email"
                id="checkoutMail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
              />
              <Input
                label=""
                placeholder="Phone"
                id="checkoutPhone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                type="tel"
              />
            </div>
          </fieldset>

          <fieldset className="my-3">
            <legend className="my-3">SHIPPING ADDRESS</legend>

            <div className="grid grid-rows-1 grid-cols-2 gap-2 w-full">
              <Input
                label=""
                placeholder="First Name"
                id="checkoutFirstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                type="text"
              />

              <Input
                label=""
                placeholder="Last Name"
                id="checkoutLastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                type="text"
              />
            </div>

            <div className="grid gap-2 my-2">
              <Input
                label=""
                placeholder="Country"
                id="checkoutCountry"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                type="text"
              />
              <Input
                label=""
                placeholder="State / Region"
                id="checkoutRegion"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                type="text"
              />
              <Input
                label=""
                placeholder="Address"
                id="checkoutAddress"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                type="text"
              />
            </div>

            <div className="grid grid-rows-1 grid-cols-2 gap-2 w-full">
              <Input
                label=""
                placeholder="City"
                id="checkoutCity"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                type="text"
              />
              <Input
                label=""
                placeholder="Postal Code"
                id="checkoutPostal"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                type="text"
              />
            </div>
          </fieldset>

          <Button
            className=" w-full mt-3"
            value={submittingOrder ? "PROCESSING..." : "PLACE ORDER"}
            showArrow={true}
          />
        </form>

        <article className="flex flex-col gap-y-2 my-2 ">
          <h2>YOUR ORDER</h2>
          {orders.length === 0 ? (
            <p className="text-[12px] text-[#0000008C] my-2">
              Your cart is empty. Add items before checkout.
            </p>
          ) : (
            <div className=" flex flex-col gap-y-2 my-2">
              {orders.map((order) => {
                return (
                  <OrderCard
                    key={order.productId}
                    order={order}
                    onChange={() => navigate(`/product/${order.productId}`)}
                  />
                );
              })}
            </div>
          )}

          <div className="border-b border-t border-[#DFDFDF] py-6 flex flex-col">
            <div className="justify-between flex">
              <span className="text-[12px] font-medium">Subtotal</span>
              <span className="text-[12px] font-medium">
                {formatCurrency(cartSummary.subtotal)}
              </span>
            </div>
            <div className="justify-between flex">
              <span className="text-[12px] font-medium">Shipping</span>
              <span className="text-[12px] text-[#0000008C] font-medium">
                {"Calculated at next step"}
              </span>
            </div>
          </div>
          <div className="justify-between flex">
            <span className="text-[12px] font-medium">Total</span>
            <span className="text-[12px] font-medium">
              {formatCurrency(cartSummary.total)}
            </span>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Checkout;
