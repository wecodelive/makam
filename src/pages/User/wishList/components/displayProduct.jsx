import React, { useState } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import { removeFromWishlist } from "../../../../services/adminFunctions";
import { addToCart } from "../../../../utils/cart";
import Button from "../../../../components/Buttons";
import { notifySuccess, notifyError } from "../../../../utils/notify";

export default function DisplayProduct({ wishlistItem, onRemove }) {
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const product = wishlistItem?.product;

  if (!product) {
    return null;
  }

  const imageUrl =
    product?.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/263x314?text=Product";

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      const response = await removeFromWishlist(wishlistItem.id);

      if (response?.success) {
        notifySuccess("Removed from wishlist");
        onRemove(wishlistItem.id);
      } else {
        notifyError(response?.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      notifyError("Failed to remove item");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToCart = () => {
    try {
      addToCart({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        image: product.images?.[0] || "",
        maxQuantity: product.stockQuantity,
      });
      notifySuccess(`Added ${quantity} item(s) to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      notifyError("Failed to add to cart");
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const isOutOfStock = product.stockQuantity <= 0;
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  return (
    <article className="rounded-xl border border-[#DFDFDF] bg-white p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3
          className="text-[15px] sm:text-[16px] font-medium cursor-pointer hover:underline line-clamp-1"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-[#5E5E5E] hover:text-red-600 transition-colors"
          title="Remove from wishlist"
        >
          <X className="w-5 h-5 cursor-pointer" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div
          className="cursor-pointer shrink-0 w-full sm:w-37.5"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-52.5 sm:h-47.5 object-cover rounded-lg"
          />
        </div>

        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div className="space-y-1">
            <p className="text-[12px] text-[#0000008C] line-clamp-2">
              {product.description || "No description available"}
            </p>
            <p className="text-[18px] font-bold">
              {formatCurrency(product.price)}
            </p>
            <p
              className={`text-[12px] ${
                isOutOfStock ? "text-red-600" : "text-green-600"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : `In Stock (${product.stockQuantity})`}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#0000008C] uppercase tracking-[0.8px]">
                Quantity
              </span>
              <div className="flex items-center border border-[#5E5E5E]">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-7.5 h-7 flex items-center justify-center text-[#5E5E5E] hover:bg-gray-100"
                >
                  −
                </button>
                <div className="w-8 h-7 flex items-center justify-center text-[12px] border-l border-r border-[#5E5E5E]">
                  {quantity}
                </div>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-7.5 h-7 flex items-center justify-center text-[#5E5E5E] hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <Button
              value="Add to Cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isRemoving}
              className={`w-full ${
                isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
              }`}
              showArrow={true}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
