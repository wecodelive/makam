import React, { useMemo } from "react";
import { Heart } from "lucide-react";
import {
  addToWishlist,
  checkWishlistItem,
  removeFromWishlist,
} from "../../services/adminFunctions";
import { notifyError, notifySuccess } from "../../utils/notify";

export default function ProductFrame({
  height,
  width,
  price,
  name,
  image,
  productId,
  description,
  onClick,
}) {
  const hasSession = Boolean(
    localStorage.getItem("userId") || localStorage.getItem("adminId"),
  );
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const [wishlistItemId, setWishlistItemId] = React.useState(null);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const fetchWishlistStatus = async () => {
      if (!productId) {
        if (isMounted) {
          setIsInWishlist(false);
          setWishlistItemId(null);
        }
        return;
      }

      if (!hasSession) {
        if (isMounted) {
          setIsInWishlist(false);
          setWishlistItemId(null);
        }
        return;
      }

      try {
        const response = await checkWishlistItem(productId);

        if (!isMounted) return;

        if (response?.success) {
          setIsInWishlist(Boolean(response.isInWishlist));
          setWishlistItemId(response.wishlistItem?.id || null);
          return;
        }

        setIsInWishlist(false);
        setWishlistItemId(null);
      } catch {
        if (!isMounted) return;
        setIsInWishlist(false);
        setWishlistItemId(null);
      }
    };

    fetchWishlistStatus();

    return () => {
      isMounted = false;
    };
  }, [productId, hasSession]);

  const resolvedImage = useMemo(() => {
    if (Array.isArray(image)) {
      return image.find(Boolean) || "";
    }

    if (typeof image === "string") {
      return image;
    }

    if (image && typeof image === "object") {
      return image.url || image.src || "";
    }

    return "";
  }, [image]);

  const sizeStyle = {
    ...(width
      ? { width: typeof width === "number" ? `${width}px` : width }
      : {}),
    ...(height
      ? { height: typeof height === "number" ? `${height}px` : height }
      : {}),
  };

  const handleWishlistToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!productId || wishlistLoading) {
      return;
    }

    if (!hasSession) {
      notifyError("Please login or create an account to use wishlist");
      return;
    }

    setWishlistLoading(true);

    try {
      if (isInWishlist) {
        const targetWishlistId = wishlistItemId;

        if (!targetWishlistId) {
          const checkResponse = await checkWishlistItem(productId);
          if (checkResponse?.success && checkResponse.wishlistItem?.id) {
            const removeResponse = await removeFromWishlist(
              checkResponse.wishlistItem.id,
            );

            if (!removeResponse?.success) {
              throw new Error(
                removeResponse?.message || "Failed to remove from wishlist",
              );
            }

            setIsInWishlist(false);
            setWishlistItemId(null);
            notifySuccess("Removed from wishlist");
            return;
          }

          throw new Error("Unable to locate wishlist item");
        }

        const removeResponse = await removeFromWishlist(targetWishlistId);
        if (!removeResponse?.success) {
          throw new Error(
            removeResponse?.message || "Failed to remove from wishlist",
          );
        }

        setIsInWishlist(false);
        setWishlistItemId(null);
        notifySuccess("Removed from wishlist");
        return;
      }

      const addResponse = await addToWishlist(productId);
      if (!addResponse?.success) {
        throw new Error(addResponse?.message || "Failed to add to wishlist");
      }

      setIsInWishlist(true);
      setWishlistItemId(addResponse?.wishlistItem?.id || null);
      notifySuccess("Added to wishlist");
    } catch (error) {
      notifyError(error.message || "Unable to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 cursor-pointer ${width ? "w-full" : "w-42.25"} ${height ? "h-fit" : "h-fit"}`}
      style={sizeStyle}
      onClick={onClick}
    >
      <div
        className={`${width ? "w-full" : "w-42.25"} mb-1.5 ${height ? "h-full" : "h-44 sm:h-52 lg:h-60"} relative outline-1 outline-[#D9D9D9] bg-[#F5F5F5] bg-contain bg-no-repeat bg-center overflow-hidden flex items-center justify-center transition-transform duration-300 hover:scale-105`}
      >
        {productId && (
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className="absolute top-0 right-0 z-10 h-8 w-8 flex items-center justify-center bg-white border-l border-b border-[#00000014] disabled:opacity-60"
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={`h-4 w-4 ${isInWishlist ? "fill-black text-black" : "text-black"}`}
            />
          </button>
        )}

        <img
          src={resolvedImage || "/placeHolder.jpg"}
          alt={name || "Product"}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/placeHolder.jpg";
          }}
          className="w-full h-full object-cover"
        />
      </div>

      {(price || name || description) && (
        <div className="flex flex-col gap-1">
          {description ? (
            <p className="text-[12px] lg:text-[13px] text-[#000000A8] line-clamp-2">
              {description}
            </p>
          ) : null}

          <div className="flex justify-between items-center text-[13px] lg:text-[15px] font-medium gap-2">
            <h2 className="truncate">{name}</h2>
            <h2 className="shrink-0">{price}</h2>
          </div>
        </div>
      )}
    </div>
  );
}
