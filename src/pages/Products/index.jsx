import React from "react";
import { Search } from "../../components/Inputs";
import { ChevronDown, ChevronRight } from "lucide-react";
import FilterItem from "./components/FilterItem";
import ProductFrame from "../../components/ProductFrame";
import Filter from "./components/Filter";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  adminGetCategories,
  adminGetProductTypes,
  adminGetProducts,
} from "../../services/adminFunctions";
import { notifyError } from "../../utils/notify";

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilter, setShowFilter] = React.useState(false);
  const [productsLoading, setProductsLoading] = React.useState(false);
  const [categoriesLoading, setCategoriesLoading] = React.useState(false);
  const [productTypesLoading, setProductTypesLoading] = React.useState(false);
  const [products, setProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [productTypes, setProductTypes] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [searchInput, setSearchInput] = React.useState(
    searchParams.get("q") || "",
  );

  const activeQuery = (searchParams.get("q") || "").trim();
  const activeCategoryId = (searchParams.get("categoryId") || "").trim();
  const activeProductTypeId = (searchParams.get("productTypeId") || "").trim();
  const activeStockStatus = (searchParams.get("stockStatus") || "").trim();
  const activeMinPrice = (searchParams.get("minPrice") || "").trim();
  const activeMaxPrice = (searchParams.get("maxPrice") || "").trim();
  const activePage = Math.max(Number(searchParams.get("page") || 1), 1);
  const activePriceRange = React.useMemo(() => {
    if (!activeMinPrice && !activeMaxPrice) {
      return "";
    }

    if (activeMinPrice === "0" && activeMaxPrice === "25000") {
      return "0-25000";
    }

    if (activeMinPrice === "25000" && activeMaxPrice === "50000") {
      return "25000-50000";
    }

    if (activeMinPrice === "50000" && activeMaxPrice === "100000") {
      return "50000-100000";
    }

    if (activeMinPrice === "100000" && !activeMaxPrice) {
      return "100000+";
    }

    return "";
  }, [activeMinPrice, activeMaxPrice]);

  const activeCategoryName = React.useMemo(
    () =>
      categories.find((category) => category.id === activeCategoryId)?.name ||
      "Category",
    [categories, activeCategoryId],
  );

  const activeProductTypeName = React.useMemo(
    () =>
      productTypes.find((type) => type.id === activeProductTypeId)?.name ||
      "Product Type",
    [productTypes, activeProductTypeId],
  );

  const activeStockStatusLabel = React.useMemo(() => {
    if (activeStockStatus === "in") {
      return "In Stock";
    }

    if (activeStockStatus === "out") {
      return "Out of Stock";
    }

    return "";
  }, [activeStockStatus]);

  const activePriceRangeLabel = React.useMemo(() => {
    if (activePriceRange === "0-25000") {
      return "Under ₦25k";
    }

    if (activePriceRange === "25000-50000") {
      return "₦25k - ₦50k";
    }

    if (activePriceRange === "50000-100000") {
      return "₦50k - ₦100k";
    }

    if (activePriceRange === "100000+") {
      return "Above ₦100k";
    }

    return "";
  }, [activePriceRange]);

  const updateSearchQuery = React.useCallback(
    (updates, replace = true) => {
      const nextParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          nextParams.delete(key);
          return;
        }

        nextParams.set(key, String(value));
      });

      setSearchParams(nextParams, { replace });
    },
    [searchParams, setSearchParams],
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  React.useEffect(() => {
    setSearchInput(searchParams.get("q") || "");
  }, [searchParams]);

  React.useEffect(() => {
    const trimmedInput = searchInput.trim();

    if (trimmedInput === activeQuery) {
      return;
    }

    const timeoutId = setTimeout(() => {
      updateSearchQuery({ q: trimmedInput, page: 1 }, true);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput, activeQuery, updateSearchQuery]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const payload = await adminGetCategories();

        if (!payload.success) {
          throw new Error(payload.message || "Failed to fetch categories");
        }

        setCategories(payload.categories || []);
      } catch (error) {
        console.error("Error loading categories:", error);
        notifyError(error.message || "Unable to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  React.useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        setProductTypesLoading(true);
        const filters = activeCategoryId
          ? { categoryId: activeCategoryId }
          : {};
        const payload = await adminGetProductTypes(filters);

        if (!payload.success) {
          throw new Error(payload.message || "Failed to fetch product types");
        }

        setProductTypes(payload.productTypes || []);
      } catch (error) {
        console.error("Error loading product types:", error);
        notifyError(error.message || "Unable to load product types");
      } finally {
        setProductTypesLoading(false);
      }
    };

    fetchProductTypes();
  }, [activeCategoryId]);

  React.useEffect(() => {
    if (!activeProductTypeId) {
      return;
    }

    const selectedTypeStillVisible = productTypes.some(
      (type) => type.id === activeProductTypeId,
    );

    if (!selectedTypeStillVisible && !productTypesLoading) {
      updateSearchQuery({ productTypeId: null, page: 1 }, true);
    }
  }, [
    activeProductTypeId,
    productTypes,
    productTypesLoading,
    updateSearchQuery,
  ]);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);

        const filters = {
          page: activePage,
          limit: 12,
        };

        if (activeQuery) {
          filters.q = activeQuery;
        }

        if (activeCategoryId) {
          filters.categoryId = activeCategoryId;
        }

        if (activeProductTypeId) {
          filters.productTypeId = activeProductTypeId;
        }

        if (activeStockStatus) {
          filters.stockStatus = activeStockStatus;
        }

        if (activeMinPrice) {
          filters.minPrice = activeMinPrice;
        }

        if (activeMaxPrice) {
          filters.maxPrice = activeMaxPrice;
        }

        const payload = await adminGetProducts(filters);

        if (!payload.success) {
          throw new Error(payload.message || "Failed to fetch products");
        }

        setProducts(payload.products || []);
        setPagination({
          page: payload.pagination?.page || activePage,
          totalPages: payload.pagination?.totalPages || 1,
          total: payload.pagination?.total || 0,
        });
      } catch (error) {
        console.error("Error loading products:", error);
        notifyError(error.message || "Unable to load products");
        setProducts([]);
        setPagination({ page: activePage, totalPages: 1, total: 0 });
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [
    activeQuery,
    activeCategoryId,
    activeProductTypeId,
    activeStockStatus,
    activeMinPrice,
    activeMaxPrice,
    activePage,
  ]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmed = searchInput.trim();
    updateSearchQuery({ q: trimmed, page: 1 }, false);
  };

  const handleCategorySelect = (categoryId) => {
    updateSearchQuery({ categoryId, productTypeId: null, page: 1 }, false);
  };

  const handleProductTypeSelect = (productTypeId) => {
    updateSearchQuery({ productTypeId, page: 1 }, false);
  };

  const handleStockStatusSelect = (stockStatus) => {
    updateSearchQuery({ stockStatus, page: 1 }, false);
  };

  const handlePriceRangeSelect = (value) => {
    if (!value) {
      updateSearchQuery({ minPrice: null, maxPrice: null, page: 1 }, false);
      return;
    }

    if (value === "100000+") {
      updateSearchQuery({ minPrice: 100000, maxPrice: null, page: 1 }, false);
      return;
    }

    const [min, max] = value.split("-");
    updateSearchQuery({ minPrice: min, maxPrice: max, page: 1 }, false);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    updateSearchQuery(
      {
        q: null,
        categoryId: null,
        productTypeId: null,
        stockStatus: null,
        minPrice: null,
        maxPrice: null,
        page: null,
      },
      false,
    );
  };

  const handlePageChange = (nextPage) => {
    updateSearchQuery({ page: nextPage }, false);
  };

  const hasActiveFilters = Boolean(
    activeQuery ||
    activeCategoryId ||
    activeProductTypeId ||
    activeStockStatus ||
    activePriceRange,
  );

  return (
    <>
      <div className="flex flex-col h-fit w-full p-6 pb-20 ">
        <div className="self-center text-center gap-2 text-[16px] capitalize">
          <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px] ">
            <h3 className="text-[#000000A8]">Home</h3> /{" "}
            <h3 className="">Products</h3>
          </span>

          <h2 className="text-[24px] font-bold tracking-[2px] uppercase">
            Products
          </h2>
        </div>

        <div className="mt-6">
          <form onSubmit={handleSearchSubmit}>
            <Search
              placeholder="Search products"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </form>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <h3
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 text-[16px] capitalize font-bold tracking-[2px]"
          >
            Filters
            {showFilter ? (
              <ChevronDown className="rotate-90" size={18} />
            ) : (
              <ChevronRight className="" size={18} />
            )}
            {/* <ChevronRight className="" size={18} /> */}
          </h3>

          <div className="flex w-full h-full gap-4">
            <div
              className={`transition-all duration-300 ease-out overflow-hidden ${
                showFilter
                  ? "opacity-100 translate-x-0 max-w-70"
                  : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
              }`}
            >
              <Filter
                categories={categories}
                categoriesLoading={categoriesLoading}
                productTypes={productTypes}
                productTypesLoading={productTypesLoading}
                activeCategoryId={activeCategoryId}
                activeProductTypeId={activeProductTypeId}
                activeStockStatus={activeStockStatus}
                activePriceRange={activePriceRange}
                onSelectCategory={handleCategorySelect}
                onSelectProductType={handleProductTypeSelect}
                onSelectStockStatus={handleStockStatusSelect}
                onSelectPriceRange={handlePriceRangeSelect}
                onClearFilters={handleClearFilters}
              />
            </div>
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <div className="grid grid-flow-col auto-cols-max gap-x-3 gap-y-3 w-full min-w-0 overflow-x-auto overflow-y-hidden hide-scrollbar">
                <FilterItem
                  label="All"
                  active={!activeCategoryId}
                  onClick={() => handleCategorySelect("")}
                />
                {categories.map((category) => (
                  <FilterItem
                    key={category.id}
                    label={`${category.name} (${category?._count?.products || 0})`}
                    active={activeCategoryId === category.id}
                    onClick={() => handleCategorySelect(category.id)}
                  />
                ))}
              </div>

              {hasActiveFilters && (
                <div className="sticky top-0 z-20 bg-white py-2 -mx-1 px-1 md:static md:bg-transparent md:py-0 md:px-0 md:mx-0 flex flex-wrap gap-2">
                  {activeQuery && (
                    <button
                      type="button"
                      onClick={() =>
                        updateSearchQuery({ q: null, page: 1 }, false)
                      }
                      className="border border-[#0000001A] rounded-full px-3 py-1 text-[11px]"
                    >
                      Search: {activeQuery} ×
                    </button>
                  )}

                  {activeCategoryId && (
                    <button
                      type="button"
                      onClick={() =>
                        updateSearchQuery(
                          { categoryId: null, productTypeId: null, page: 1 },
                          false,
                        )
                      }
                      className="border border-[#0000001A] rounded-full px-3 py-1 text-[11px]"
                    >
                      Category: {activeCategoryName} ×
                    </button>
                  )}

                  {activeProductTypeId && (
                    <button
                      type="button"
                      onClick={() =>
                        updateSearchQuery(
                          { productTypeId: null, page: 1 },
                          false,
                        )
                      }
                      className="border border-[#0000001A] rounded-full px-3 py-1 text-[11px]"
                    >
                      Type: {activeProductTypeName} ×
                    </button>
                  )}

                  {activeStockStatus && (
                    <button
                      type="button"
                      onClick={() =>
                        updateSearchQuery({ stockStatus: null, page: 1 }, false)
                      }
                      className="border border-[#0000001A] rounded-full px-3 py-1 text-[11px]"
                    >
                      Stock: {activeStockStatusLabel} ×
                    </button>
                  )}

                  {activePriceRange && (
                    <button
                      type="button"
                      onClick={() =>
                        updateSearchQuery(
                          { minPrice: null, maxPrice: null, page: 1 },
                          false,
                        )
                      }
                      className="border border-[#0000001A] rounded-full px-3 py-1 text-[11px]"
                    >
                      Price: {activePriceRangeLabel} ×
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="rounded-full px-3 py-1 text-[11px] underline text-[#0000008C]"
                  >
                    Clear all
                  </button>
                </div>
              )}

              <div className="text-[12px] text-[#0000008C]">
                {productsLoading
                  ? "Loading..."
                  : `${pagination.total.toLocaleString("en-US")} product${pagination.total === 1 ? "" : "s"} found`}
              </div>

              <div
                className={`grid grid-flow-row auto-rows-max gap-x-4 gap-y-4 w-full mt-1 ${
                  showFilter
                    ? "grid-cols-1"
                    : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {productsLoading && (
                  <p className="text-[12px] text-[#0000008C]">
                    Loading products...
                  </p>
                )}

                {!productsLoading && products.length === 0 && (
                  <p className="text-[12px] text-[#0000008C]">
                    {activeQuery ||
                    activeCategoryId ||
                    activeProductTypeId ||
                    activeStockStatus ||
                    activePriceRange
                      ? "No products found for your search."
                      : "No products available yet."}
                  </p>
                )}

                {!productsLoading &&
                  products.map((product) => (
                    <ProductFrame
                      key={product.id}
                      width="100%"
                      price={formatCurrency(product.price)}
                      description={product.category?.name || "New Collection"}
                      name={product.name}
                      image={product.images?.[0]}
                      productId={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                    />
                  ))}
              </div>

              {!productsLoading && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(Math.max(pagination.page - 1, 1))
                    }
                    disabled={pagination.page <= 1}
                    className="border border-[#5E5E5E] px-3 py-1 text-[12px] disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <p className="text-[12px] text-[#0000008C]">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(
                        Math.min(pagination.page + 1, pagination.totalPages),
                      )
                    }
                    disabled={pagination.page >= pagination.totalPages}
                    className="border border-[#5E5E5E] px-3 py-1 text-[12px] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
