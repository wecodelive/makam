import React, { useEffect, useMemo, useState } from "react";
import ProductFrame from "../../components/ProductFrame";
import { Search } from "../../components/Inputs";
import Button from "../../components/Buttons";
import { useNavigate } from "react-router";
import {
  adminGetCategories,
  adminGetProducts,
  adminGetPromoCodes,
} from "../../services/adminFunctions";
import { notifyError, notifySuccess } from "../../utils/notify";

export default function Index() {
  const navigate = useNavigate();
  const [homeProducts, setHomeProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [activePromo, setActivePromo] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const featuredProducts = useMemo(
    () => homeProducts.slice(0, 8),
    [homeProducts],
  );

  const featuredCategories = useMemo(
    () => categories.slice(0, 6),
    [categories],
  );

  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return homeProducts
      .filter((product) => {
        const searchableValue = [product.name, product.category?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableValue.includes(query);
      })
      .slice(0, 5);
  }, [homeProducts, searchQuery]);

  const promoLabel = useMemo(() => {
    if (!activePromo) {
      return "";
    }

    if (activePromo.discountType === "PERCENTAGE") {
      return `${Number(activePromo.discountValue || 0)}% OFF`;
    }

    if (activePromo.discountType === "FREE_SHIPPING") {
      return "FREE SHIPPING";
    }

    return `₦${Number(activePromo.discountValue || 0).toLocaleString("en-US")} OFF`;
  }, [activePromo]);

  const promoTimeLeftLabel = useMemo(() => {
    if (!activePromo?.endsAt) {
      return "Limited offer";
    }

    const endsAt = new Date(activePromo.endsAt).getTime();
    const now = Date.now();
    const diff = endsAt - now;

    if (diff <= 0) {
      return "Ends today";
    }

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? "s" : ""} left`;
  }, [activePromo]);

  const shouldShowSuggestions =
    isSearchFocused && searchQuery.trim() && searchSuggestions.length > 0;

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return featuredProducts;
    }

    return featuredProducts.filter((product) => {
      const searchableValue = [product.name, product.category?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableValue.includes(query);
    });
  }, [featuredProducts, searchQuery]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) {
      navigate("/products");
      return;
    }

    navigate(`/products?q=${encodeURIComponent(query)}`);
  };

  const handleCopyPromoCode = async () => {
    if (!activePromo?.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activePromo.code);
      notifySuccess("Promo code copied.");
    } catch {
      notifyError("Unable to copy promo code");
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setProductsLoading(true);

        const [productsResult, categoriesResult, promosResult] =
          await Promise.allSettled([
            adminGetProducts({ page: 1, limit: 16 }),
            adminGetCategories(),
            adminGetPromoCodes({ status: "active" }),
          ]);

        if (
          productsResult.status !== "fulfilled" ||
          !productsResult.value?.success
        ) {
          throw new Error(
            productsResult.status === "fulfilled"
              ? productsResult.value?.message || "Failed to load products"
              : "Failed to load products",
          );
        }

        setHomeProducts(productsResult.value.products || []);

        if (
          categoriesResult.status === "fulfilled" &&
          categoriesResult.value?.success
        ) {
          setCategories(categoriesResult.value.categories || []);
        }

        if (
          promosResult.status === "fulfilled" &&
          promosResult.value?.success
        ) {
          const promos = promosResult.value.promos || [];
          setActivePromo(promos[0] || null);
        }
      } catch (error) {
        console.error("Error fetching homepage products:", error);
        notifyError(error.message || "Unable to load products");
      } finally {
        setProductsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <>
      <div className="h-fit w-full p-6 pb-20 ">
        <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {featuredCategories.length > 0 ? (
            featuredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => navigate(`/products?categoryId=${category.id}`)}
                className="shrink-0 rounded-full border border-[#0000001A] px-4 py-1.5 text-[12px] uppercase tracking-[1px]"
              >
                {category.name} ({category?._count?.products || 0})
              </button>
            ))
          ) : (
            <ul className="text-[16px] uppercase">
              <li>men</li>
              <li>women</li>
              <li>kids</li>
            </ul>
          )}
        </div>

        {activePromo && (
          <div className="mt-6 rounded-2xl border border-[#00000014] p-4 bg-[#00000005]">
            <p className="text-[11px] uppercase tracking-[1.5px] text-[#0000008C]">
              Active Promotion
            </p>
            <h3 className="mt-1 text-[20px] font-bold">{promoLabel}</h3>
            <p className="text-[13px] text-[#00000099] mt-1">
              {activePromo.description ||
                `Use code ${activePromo.code} at checkout`}{" "}
              • {promoTimeLeftLabel}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPromoCode}
                className="rounded-full border border-[#0000001A] px-3 py-1 text-[12px] font-medium"
              >
                Copy {activePromo.code}
              </button>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="rounded-full bg-black text-white px-3 py-1 text-[12px] font-medium"
              >
                Shop now
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search
              placeholder="Search products"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 120)}
            />

            {shouldShowSuggestions && (
              <div className="absolute z-10 mt-2 w-full rounded-xl border border-[#00000014] bg-white shadow-sm overflow-hidden">
                {searchSuggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-[#00000005]"
                    onMouseDown={() => navigate(`/product/${product.id}`)}
                  >
                    <p className="text-[13px] font-medium">{product.name}</p>
                    <p className="text-[11px] text-[#0000008C]">
                      {product.category?.name || "Product"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        <div className="mt-10 flex flex-col gap-2">
          <h1 className="uppercase text-5xl font-extrabold leading-10 ">
            New <br /> Collection
          </h1>

          <p className="text-[16px] uppercase">
            summer <br /> 2026
          </p>
        </div>

        <div className="mt-10 flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar">
          {productsLoading && (
            <p className="text-[12px] text-[#0000008C]">Loading products...</p>
          )}

          {!productsLoading && filteredProducts.length === 0 && (
            <p className="text-[12px] text-[#0000008C]">
              {searchQuery.trim()
                ? "No products found for your search."
                : "No products available yet."}
            </p>
          )}

          {!productsLoading &&
            filteredProducts.map((product) => (
              <ProductFrame
                price={formatCurrency(product.price)}
                description={product.category?.name || "New Collection"}
                name={product.name}
                image={product.images?.[0]}
                productId={product.id}
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
        </div>

        <div className="mt-10" onClick={() => navigate("/products")}>
          <Button showArrow={true} value={"Go To Shop"} />
        </div>
      </div>
    </>
  );
}
