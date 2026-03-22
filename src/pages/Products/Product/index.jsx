import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import ProductFrame from "../../../components/ProductFrame";
import Button from "../../../components/Buttons";
import {
  addToWishlist,
  adminGetProductById,
  adminGetProducts,
  checkWishlistItem,
  removeFromWishlist,
} from "../../../services/adminFunctions";
import { notifyError, notifySuccess } from "../../../utils/notify";
import { addToCart } from "../../../utils/cart";

export default function Product() {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const hasSession = Boolean(
    localStorage.getItem("userId") || localStorage.getItem("adminId"),
  );
  const [product, setProduct] = React.useState(null);
  const [relatedProducts, setRelatedProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState("");
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const [wishlistItemId, setWishlistItemId] = React.useState(null);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  React.useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        if (!productId) {
          throw new Error("Invalid product id");
        }

        const payload = await adminGetProductById(productId);

        if (!payload.success) {
          throw new Error(payload.message || "Failed to load product");
        }

        const nextProduct = payload.product;
        setProduct(nextProduct);

        const productImages = Array.isArray(nextProduct.images)
          ? nextProduct.images.filter(Boolean)
          : [];
        setSelectedImage(productImages[0] || "");

        const relatedPayload = await adminGetProducts({
          categoryId: nextProduct.categoryId,
          limit: 8,
          page: 1,
        });

        if (relatedPayload.success) {
          setRelatedProducts(
            (relatedPayload.products || []).filter(
              (item) => item.id !== nextProduct.id,
            ),
          );
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error("Error loading product details:", error);
        notifyError(error.message || "Unable to load product details");
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

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

  const handleWishlistToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!productId || wishlistLoading) {
      return;
    }

    if (!hasSession) {
      notifyError("Please login or create an account to use wishlist");
      navigate("/login");
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

  const productImages = React.useMemo(
    () =>
      Array.isArray(product?.images) ? product.images.filter(Boolean) : [],
    [product],
  );

  const displayImage = selectedImage || productImages[0] || "/placeHolder.jpg";

  const productTags = React.useMemo(
    () =>
      Array.isArray(product?.tags)
        ? product.tags.filter(Boolean).slice(0, 6)
        : [],
    [product],
  );

  const isOutOfStock = Number(product?.stockQuantity || 0) <= 0;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) {
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity: 1,
      maxQuantity: Math.max(Number(product.stockQuantity) || 1, 1),
      image: displayImage,
      categoryName: product.category?.name || "",
    });

    notifySuccess("Added to cart.");
  };

  return (
    <>
      <div className="py-10 flex flex-col gap-6">
        {loading ? (
          <div className="px-6 py-10 text-[13px] text-[#0000008C]">
            Loading product...
          </div>
        ) : !product ? (
          <div className="px-6 py-10 flex flex-col gap-3">
            <p className="text-[13px] text-[#0000008C]">Product not found.</p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="w-fit text-[13px] underline"
            >
              Back to products
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              <div
                className="w-full h-105 md:h-150.25 bg-contain bg-no-repeat bg-center"
                style={{ backgroundImage: `url('${displayImage}')` }}
              />
              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="absolute top-0 right-0 z-10 h-9 w-9 flex items-center justify-center bg-white border-l border-b border-[#00000014] disabled:opacity-60"
                aria-label={
                  isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={`h-4 w-4 ${isInWishlist ? "fill-black text-black" : "text-black"}`}
                />
              </button>
            </div>

            {productImages.length > 0 && (
              <div className="px-6 mt-2 flex gap-3 overflow-x-auto overflow-y-hidden hide-scrollbar">
                {productImages.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(image)}
                    className={`h-19.5 w-16 shrink-0 border ${
                      selectedImage === image
                        ? "border-black"
                        : "border-[#00000029]"
                    } bg-contain bg-no-repeat bg-center`}
                    style={{ backgroundImage: `url('${image}')` }}
                    aria-label={`View product image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="px-6 flex gap-3 flex-col">
              <h2 className="text-xl uppercase">{product.name}</h2>

              <div className="flex justify-between tracking-[1px]">
                <p className="text-[#0000008C] text-[14px]">
                  MRP incl. of all taxes
                </p>
                <h3 className="font-semibold">
                  {formatCurrency(product.price)}
                </h3>
              </div>

              <p className="text-[12px] tracking-[1px]">
                {product.description || "No description available yet."}
              </p>

              <div className="flex flex-wrap gap-2 text-[11px] text-[#0000008C] uppercase">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <span>{product.category?.name || "Category"}</span>
                <span>•</span>
                <span>{product.productType?.name || "Type"}</span>
              </div>

              <p
                className={`text-[12px] tracking-[1px] uppercase ${
                  isOutOfStock ? "text-[#B42318]" : "text-[#027A48]"
                }`}
              >
                {isOutOfStock
                  ? "Out of stock"
                  : `${product.stockQuantity} item${product.stockQuantity > 1 ? "s" : ""} available`}
              </p>

              {productTags.length > 0 && (
                <div className="flex flex-wrap gap-2 my-1">
                  {productTags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#0000001F] px-2 py-1 text-[11px] uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <Button
                value={isOutOfStock ? "OUT OF STOCK" : "ADD"}
                onClick={handleAddToCart}
                className="w-full rounded-none uppercase h-12"
              />
            </div>

            {relatedProducts.length > 0 && (
              <div className="px-6 mt-6 flex flex-col gap-3">
                <h3 className="text-[16px] font-bold tracking-[1px] uppercase">
                  You may also like
                </h3>
                <div className="flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar">
                  {relatedProducts.slice(0, 6).map((item) => (
                    <ProductFrame
                      key={item.id}
                      price={formatCurrency(item.price)}
                      description={item.category?.name || "Collection"}
                      name={item.name}
                      image={item.images?.[0]}
                      productId={item.id}
                      onClick={() => navigate(`/product/${item.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
