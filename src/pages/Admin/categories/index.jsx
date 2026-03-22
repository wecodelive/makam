import React, { useEffect, useMemo, useState } from "react";
import { Input } from "../../../components/Inputs";
import Button from "../../../components/Buttons";
import { Trash2, Edit, Eye } from "lucide-react";
import { notifyError } from "../../../utils/notify";
import { confirmAction } from "../../../utils/confirm";

export default function CategoriesManagement() {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductTypeForm, setShowProductTypeForm] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingType, setLoadingType] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingProductTypeId, setEditingProductTypeId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });
  const [productTypeFormData, setProductTypeFormData] = useState({
    name: "",
    description: "",
    slug: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productFilterLabel, setProductFilterLabel] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [activeProductTypeId, setActiveProductTypeId] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotalCount, setProductTotalCount] = useState(0);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [productTypeSearchQuery, setProductTypeSearchQuery] = useState("");
  const [productTypeCurrentPage, setProductTypeCurrentPage] = useState(1);

  const PRODUCTS_PAGE_SIZE = 10;
  const CATEGORIES_PAGE_SIZE = 5;
  const PRODUCT_TYPES_PAGE_SIZE = 5;

  const filteredCategoryList = useMemo(() => {
    const query = categorySearchQuery.trim().toLowerCase();
    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      [category.name, category.slug, category.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [categories, categorySearchQuery]);

  const categoryTotalPages = Math.max(
    Math.ceil(filteredCategoryList.length / CATEGORIES_PAGE_SIZE),
    1,
  );
  const safeCategoryPage = Math.min(categoryCurrentPage, categoryTotalPages);
  const paginatedCategories = filteredCategoryList.slice(
    (safeCategoryPage - 1) * CATEGORIES_PAGE_SIZE,
    safeCategoryPage * CATEGORIES_PAGE_SIZE,
  );

  const filteredProductTypeList = useMemo(() => {
    const query = productTypeSearchQuery.trim().toLowerCase();
    if (!query) {
      return productTypes;
    }

    return productTypes.filter((productType) =>
      [
        productType.name,
        productType.slug,
        productType.description,
        productType.category?.name,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [productTypes, productTypeSearchQuery]);

  const productTypeTotalPages = Math.max(
    Math.ceil(filteredProductTypeList.length / PRODUCT_TYPES_PAGE_SIZE),
    1,
  );
  const safeProductTypePage = Math.min(
    productTypeCurrentPage,
    productTypeTotalPages,
  );
  const paginatedProductTypes = filteredProductTypeList.slice(
    (safeProductTypePage - 1) * PRODUCT_TYPES_PAGE_SIZE,
    safeProductTypePage * PRODUCT_TYPES_PAGE_SIZE,
  );

  const resetCategoryForm = () => {
    setCategoryFormData({ name: "", description: "", slug: "" });
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  };

  const resetProductTypeForm = () => {
    setProductTypeFormData({
      name: "",
      description: "",
      slug: "",
      categoryId: "",
    });
    setEditingProductTypeId(null);
    setShowProductTypeForm(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const response = await fetch("/api/admin/product-types");
      const data = await response.json();

      if (data.success) {
        setProductTypes(data.productTypes || []);
      }
    } catch (error) {
      console.error("Error fetching product types:", error);
    }
  };

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProductTypes()]);
  }, []);

  useEffect(() => {
    setCategoryCurrentPage(1);
  }, [categorySearchQuery]);

  useEffect(() => {
    setProductTypeCurrentPage(1);
  }, [productTypeSearchQuery]);

  useEffect(() => {
    if (categoryCurrentPage > categoryTotalPages) {
      setCategoryCurrentPage(categoryTotalPages);
    }
  }, [categoryCurrentPage, categoryTotalPages]);

  useEffect(() => {
    if (productTypeCurrentPage > productTypeTotalPages) {
      setProductTypeCurrentPage(productTypeTotalPages);
    }
  }, [productTypeCurrentPage, productTypeTotalPages]);

  const refreshPageData = async () => {
    await Promise.all([fetchCategories(), fetchProductTypes()]);
  };

  const fetchFilteredProducts = async ({
    categoryId,
    productTypeId,
    query = "",
    page = 1,
  }) => {
    try {
      setProductsLoading(true);

      const params = new URLSearchParams();
      if (categoryId) {
        params.set("categoryId", categoryId);
      }
      if (productTypeId) {
        params.set("productTypeId", productTypeId);
      }
      if (query.trim()) {
        params.set("q", query.trim());
      }
      params.set("page", page.toString());
      params.set("limit", PRODUCTS_PAGE_SIZE.toString());

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load products");
      }

      setFilteredProducts(data.products || []);
      setProductTotalPages(data.pagination?.totalPages || 1);
      setProductTotalCount(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      notifyError(error.message || "Unable to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleViewProducts = ({ categoryId, productTypeId, label }) => {
    setActiveCategoryId(categoryId || "");
    setActiveProductTypeId(productTypeId || "");
    setProductFilterLabel(label);
    setProductSearchQuery("");
    setProductCurrentPage(1);
  };

  useEffect(() => {
    if (!activeCategoryId && !activeProductTypeId) {
      return;
    }

    fetchFilteredProducts({
      categoryId: activeCategoryId,
      productTypeId: activeProductTypeId,
      query: productSearchQuery,
      page: productCurrentPage,
    });
  }, [
    activeCategoryId,
    activeProductTypeId,
    productSearchQuery,
    productCurrentPage,
  ]);

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductTypeChange = (e) => {
    const { name, value } = e.target;
    setProductTypeFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    setLoadingCategory(true);
    try {
      const response = await fetch(
        editingCategoryId
          ? `/api/admin/categories/${editingCategoryId}`
          : "/api/admin/categories",
        {
          method: editingCategoryId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryFormData),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (editingCategoryId
              ? "Failed to update category"
              : "Failed to create category"),
        );
      }

      await refreshPageData();
      resetCategoryForm();
    } catch (error) {
      console.error("Error saving category:", error);
      notifyError(error.message || "Unable to save category");
      return;
    } finally {
      setLoadingCategory(false);
    }
  };

  const handleProductTypeSubmit = async (e) => {
    e.preventDefault();

    setLoadingType(true);
    try {
      const response = await fetch(
        editingProductTypeId
          ? `/api/admin/product-types/${editingProductTypeId}`
          : "/api/admin/product-types",
        {
          method: editingProductTypeId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productTypeFormData),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (editingProductTypeId
              ? "Failed to update product type"
              : "Failed to create product type"),
        );
      }

      await refreshPageData();
      resetProductTypeForm();
    } catch (error) {
      console.error("Error saving product type:", error);
      notifyError(error.message || "Unable to save product type");
    } finally {
      setLoadingType(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryFormData({
      name: category.name || "",
      description: category.description || "",
      slug: category.slug || "",
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    const shouldDelete = await confirmAction(
      "Are you sure you want to delete this category?",
      { title: "Delete Category", confirmText: "Delete", variant: "danger" },
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete category");
      }

      await refreshPageData();

      if (activeCategoryId === categoryId) {
        setActiveCategoryId("");
        setActiveProductTypeId("");
        setProductFilterLabel("");
        setFilteredProducts([]);
        setProductTotalPages(1);
        setProductTotalCount(0);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      notifyError(error.message || "Unable to delete category");
    }
  };

  const handleEditProductType = (productType) => {
    setEditingProductTypeId(productType.id);
    setProductTypeFormData({
      name: productType.name || "",
      description: productType.description || "",
      slug: productType.slug || "",
      categoryId: productType.categoryId || "",
    });
    setShowProductTypeForm(true);
  };

  const handleDeleteProductType = async (productTypeId) => {
    const shouldDelete = await confirmAction(
      "Are you sure you want to delete this product type?",
      {
        title: "Delete Product Type",
        confirmText: "Delete",
        variant: "danger",
      },
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/product-types/${productTypeId}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product type");
      }

      await refreshPageData();

      if (activeProductTypeId === productTypeId) {
        setActiveCategoryId("");
        setActiveProductTypeId("");
        setProductFilterLabel("");
        setFilteredProducts([]);
        setProductTotalPages(1);
        setProductTotalCount(0);
      }
    } catch (error) {
      console.error("Error deleting product type:", error);
      notifyError(error.message || "Unable to delete product type");
    }
  };

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px]">
          <h3 className="text-[#000000A8]">Admin</h3> / <h3>Categories</h3>
        </span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
          Categories Management
        </h1>
        <button
          onClick={() => {
            if (showCategoryForm) {
              resetCategoryForm();
            } else {
              setShowCategoryForm(true);
            }
          }}
          className="bg-[#D9D9D9] text-black text-[12px] font-medium h-10 px-4"
        >
          {showCategoryForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showCategoryForm && (
        <section className="border border-[#DFDFDF] p-4 mb-6">
          <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
            {editingCategoryId ? "Edit Category" : "Create New Category"}
          </h2>

          <form className="flex flex-col gap-3" onSubmit={handleCategorySubmit}>
            <Input
              id="categoryName"
              name="name"
              placeholder="Category Name"
              value={categoryFormData.name}
              onChange={handleCategoryChange}
              type="text"
            />

            <Input
              id="categoryDescription"
              name="description"
              placeholder="Description"
              value={categoryFormData.description}
              onChange={handleCategoryChange}
              type="text"
            />

            <Input
              id="categorySlug"
              name="slug"
              placeholder="URL Slug"
              value={categoryFormData.slug}
              onChange={handleCategoryChange}
              type="text"
            />

            <Button
              className="w-full"
              value={
                loadingCategory
                  ? editingCategoryId
                    ? "Updating..."
                    : "Creating..."
                  : editingCategoryId
                    ? "Update Category"
                    : "Create Category"
              }
              showArrow={true}
            />
          </form>
        </section>
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
          Product Types Management
        </h1>
        <button
          onClick={() => {
            if (showProductTypeForm) {
              resetProductTypeForm();
            } else {
              setShowProductTypeForm(true);
            }
          }}
          className="bg-[#D9D9D9] text-black text-[12px] font-medium h-10 px-4"
        >
          {showProductTypeForm ? "Cancel" : "Add Product Type"}
        </button>
      </div>

      {showProductTypeForm && (
        <section className="border border-[#DFDFDF] p-4 mb-6">
          <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
            {editingProductTypeId ? "Edit Product Type" : "Create Product Type"}
          </h2>

          <form
            className="flex flex-col gap-3"
            onSubmit={handleProductTypeSubmit}
          >
            <select
              name="categoryId"
              value={productTypeFormData.categoryId}
              onChange={handleProductTypeChange}
              className="w-full border border-[#DFDFDF] h-12.5 px-4 text-[13px] outline-none"
              required
            >
              <option value="">Select Audience Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <Input
              id="productTypeName"
              name="name"
              placeholder="Product Type Name"
              value={productTypeFormData.name}
              onChange={handleProductTypeChange}
              type="text"
            />

            <Input
              id="productTypeDescription"
              name="description"
              placeholder="Description"
              value={productTypeFormData.description}
              onChange={handleProductTypeChange}
              type="text"
            />

            <Input
              id="productTypeSlug"
              name="slug"
              placeholder="URL Slug"
              value={productTypeFormData.slug}
              onChange={handleProductTypeChange}
              type="text"
            />

            <Button
              className="w-full"
              value={
                loadingType
                  ? editingProductTypeId
                    ? "Updating..."
                    : "Creating..."
                  : editingProductTypeId
                    ? "Update Product Type"
                    : "Create Product Type"
              }
              showArrow={true}
            />
          </form>
        </section>
      )}

      <section className="border border-[#DFDFDF] p-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Category List
        </h2>

        <div className="mb-3">
          <Input
            id="searchCategories"
            name="searchCategories"
            placeholder="Search categories by name, slug, or description"
            value={categorySearchQuery}
            onChange={(e) => setCategorySearchQuery(e.target.value)}
            type="text"
          />
          <p className="text-[12px] text-[#0000008C]">
            {filteredCategoryList.length} categor
            {filteredCategoryList.length === 1 ? "y" : "ies"} found
          </p>
        </div>

        <div className="space-y-3">
          {paginatedCategories.map((category) => (
            <div
              key={category.id}
              className="border border-[#DFDFDF] p-3 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-[14px] font-medium uppercase">
                    {category.name}
                  </h3>
                  <p className="text-[12px] text-[#0000008C] mt-1">
                    {category.description}
                  </p>
                  <p className="text-[12px] text-[#0000008C]">
                    Slug: {category.slug}
                  </p>
                </div>
                <span className="text-[12px] font-medium">
                  {category._count?.products || 0} products
                </span>
              </div>

              <div className="text-[12px] text-[#0000008C] pb-2">
                Product types: {category.productTypes?.length || 0}
              </div>

              <div className="flex flex-wrap gap-2 pb-2">
                {(category.productTypes || []).map((productType) => (
                  <span
                    key={productType.id}
                    className="text-[11px] border border-[#DFDFDF] px-2 py-1"
                  >
                    {productType.name}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#DFDFDF]">
                <button
                  onClick={() =>
                    handleViewProducts({
                      categoryId: category.id,
                      label: `Category: ${category.name}`,
                    })
                  }
                  className="text-gray-700 hover:text-black flex items-center gap-1 text-[12px]"
                >
                  <Eye size={14} /> View Products
                </button>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[12px]"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1 text-[12px]"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() =>
              setCategoryCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={safeCategoryPage === 1}
            className="bg-[#D9D9D9] disabled:opacity-50 text-black text-[12px] font-medium h-8 px-4"
          >
            Previous
          </button>

          <span className="text-[12px] font-medium">
            Page {safeCategoryPage} of {categoryTotalPages}
          </span>

          <button
            onClick={() =>
              setCategoryCurrentPage((prev) =>
                Math.min(prev + 1, categoryTotalPages),
              )
            }
            disabled={safeCategoryPage >= categoryTotalPages}
            className="bg-[#D9D9D9] disabled:opacity-50 text-black text-[12px] font-medium h-8 px-4"
          >
            Next
          </button>
        </div>
      </section>

      <section className="border border-[#DFDFDF] p-4 mt-6">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Product Type List
        </h2>

        <div className="mb-3">
          <Input
            id="searchProductTypes"
            name="searchProductTypes"
            placeholder="Search product types by name, slug, description, or category"
            value={productTypeSearchQuery}
            onChange={(e) => setProductTypeSearchQuery(e.target.value)}
            type="text"
          />
          <p className="text-[12px] text-[#0000008C]">
            {filteredProductTypeList.length} product type
            {filteredProductTypeList.length === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="space-y-3">
          {paginatedProductTypes.map((productType) => (
            <div
              key={productType.id}
              className="border border-[#DFDFDF] p-3 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-[14px] font-medium uppercase">
                    {productType.name}
                  </h3>
                  <p className="text-[12px] text-[#0000008C] mt-1">
                    {productType.description || "-"}
                  </p>
                  <p className="text-[12px] text-[#0000008C]">
                    Slug: {productType.slug}
                  </p>
                  <p className="text-[12px] text-[#0000008C]">
                    Category: {productType.category?.name || "-"}
                  </p>
                </div>
                <span className="text-[12px] font-medium">
                  {productType._count?.products || 0} products
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#DFDFDF]">
                <button
                  onClick={() =>
                    handleViewProducts({
                      productTypeId: productType.id,
                      label: `Product Type: ${productType.name}`,
                    })
                  }
                  className="text-gray-700 hover:text-black flex items-center gap-1 text-[12px]"
                >
                  <Eye size={14} /> View Products
                </button>
                <button
                  onClick={() => handleEditProductType(productType)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[12px]"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteProductType(productType.id)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1 text-[12px]"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() =>
              setProductTypeCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={safeProductTypePage === 1}
            className="bg-[#D9D9D9] disabled:opacity-50 text-black text-[12px] font-medium h-8 px-4"
          >
            Previous
          </button>

          <span className="text-[12px] font-medium">
            Page {safeProductTypePage} of {productTypeTotalPages}
          </span>

          <button
            onClick={() =>
              setProductTypeCurrentPage((prev) =>
                Math.min(prev + 1, productTypeTotalPages),
              )
            }
            disabled={safeProductTypePage >= productTypeTotalPages}
            className="bg-[#D9D9D9] disabled:opacity-50 text-black text-[12px] font-medium h-8 px-4"
          >
            Next
          </button>
        </div>
      </section>

      <section className="border border-[#DFDFDF] p-4 mt-6">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-2">
          {productFilterLabel
            ? `Products in ${productFilterLabel}`
            : "Select a category or product type to view products"}
        </h2>

        {!!productFilterLabel && (
          <div className="mb-3">
            <Input
              id="searchFilteredProducts"
              name="searchFilteredProducts"
              placeholder="Search by product name, SKU, or tag"
              value={productSearchQuery}
              onChange={(e) => {
                setProductCurrentPage(1);
                setProductSearchQuery(e.target.value);
              }}
              type="text"
            />
            <p className="text-[12px] text-[#0000008C]">
              {productTotalCount} product{productTotalCount === 1 ? "" : "s"}{" "}
              found
            </p>
          </div>
        )}

        {productsLoading ? (
          <p className="text-[12px] text-[#0000008C]">Loading products...</p>
        ) : filteredProducts.length ? (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#DFDFDF]">
                  <th className="text-left py-2 px-2 font-medium uppercase">
                    Name
                  </th>
                  <th className="text-left py-2 px-2 font-medium uppercase">
                    SKU
                  </th>
                  <th className="text-left py-2 px-2 font-medium uppercase">
                    Price
                  </th>
                  <th className="text-left py-2 px-2 font-medium uppercase">
                    Stock
                  </th>
                  <th className="text-left py-2 px-2 font-medium uppercase">
                    Category
                  </th>
                  <th className="text-left py-2 px-2 font-medium uppercase">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-[#DFDFDF]">
                    <td className="py-2 px-2">{product.name}</td>
                    <td className="py-2 px-2">{product.sku}</td>
                    <td className="py-2 px-2">
                      ₦{Number(product.price).toLocaleString()}
                    </td>
                    <td className="py-2 px-2">{product.stockQuantity}</td>
                    <td className="py-2 px-2">
                      {product.category?.name || "-"}
                    </td>
                    <td className="py-2 px-2">
                      {product.productType?.name || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() =>
                  setProductCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={productCurrentPage === 1}
                className="bg-[#D9D9D9] disabled:opacity-50 text-black text-[12px] font-medium h-8 px-4"
              >
                Previous
              </button>

              <span className="text-[12px] font-medium">
                Page {productCurrentPage} of {productTotalPages}
              </span>

              <button
                onClick={() =>
                  setProductCurrentPage((prev) =>
                    Math.min(prev + 1, productTotalPages),
                  )
                }
                disabled={productCurrentPage >= productTotalPages}
                className="bg-[#D9D9D9] disabled:opacity-50 text-black text-[12px] font-medium h-8 px-4"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-[#0000008C]">
            No products to display.
          </p>
        )}
      </section>
    </div>
  );
}
