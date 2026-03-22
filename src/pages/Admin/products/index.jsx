import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "../../../components/Inputs";
import Button from "../../../components/Buttons";
import { Trash2, Edit, Eye } from "lucide-react";
import { notifyError } from "../../../utils/notify";
import { confirmAction } from "../../../utils/confirm";

export default function ProductsManagement() {
  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const DEFAULT_PAGE_SIZE = 10;
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    productTypeId: "",
    stock: "",
    sku: "",
    tags: "",
  });

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === formData.categoryId),
    [categories, formData.categoryId],
  );

  const availableProductTypes = selectedCategory?.productTypes || [];

  useEffect(() => {
    if (!productImages.length) {
      setImagePreviews([]);
      return;
    }

    const urls = productImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [productImages]);

  const fetchInitialData = useCallback(
    async (page = 1, query = "", limit = DEFAULT_PAGE_SIZE) => {
      try {
        const productsParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (query.trim()) {
          productsParams.set("q", query.trim());
        }

        const [categoriesRes, productsRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch(`/api/admin/products?${productsParams.toString()}`),
        ]);

        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();

        if (categoriesData.success) {
          setCategories(categoriesData.categories);
        }

        if (productsData.success) {
          setProducts(productsData.products);
          setPageSize(productsData.pagination?.limit || DEFAULT_PAGE_SIZE);
          setTotalPages(productsData.pagination?.totalPages || 1);
          setTotalProducts(productsData.pagination?.total || 0);
        }
      } catch (error) {
        console.error("Error fetching admin product data:", error);
      }
    },
    [DEFAULT_PAGE_SIZE],
  );

  useEffect(() => {
    fetchInitialData(currentPage, searchQuery, pageSize);
  }, [currentPage, searchQuery, pageSize, fetchInitialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "categoryId") {
        return { ...prev, categoryId: value, productTypeId: "" };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    const oversizedFiles = files.filter(
      (file) => file.size > MAX_IMAGE_SIZE_BYTES,
    );

    if (oversizedFiles.length) {
      notifyError(`Each image must be ${MAX_IMAGE_SIZE_MB}MB or less.`);
    }

    const validFiles = files.filter(
      (file) => file.size <= MAX_IMAGE_SIZE_BYTES,
    );
    setProductImages((prev) => [...prev, ...validFiles].slice(0, 5));
    e.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setProductImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const resetFormState = () => {
    setShowForm(false);
    setEditingProductId(null);
    setExistingImageUrls([]);
    setProductImages([]);
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      productTypeId: "",
      stock: "",
      sku: "",
      tags: "",
    });
  };

  const handleViewProduct = async (productId) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch product details");
      }

      setSelectedProduct(data.product);
    } catch (error) {
      console.error("Error fetching product details:", error);
      notifyError(error.message || "Unable to load product details");
    }
  };

  const handleEditProduct = async (productId) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch product details");
      }

      const product = data.product;

      setEditingProductId(product.id);
      setShowForm(true);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        categoryId: product.categoryId || "",
        productTypeId: product.productTypeId || "",
        stock: product.stockQuantity?.toString() || "",
        sku: product.sku || "",
        tags: (product.tags || []).join(", "),
      });
      setExistingImageUrls(product.images || []);
      setProductImages([]);
    } catch (error) {
      console.error("Error loading product for edit:", error);
      notifyError(error.message || "Unable to load product for edit");
    }
  };

  const handleDeleteProduct = async (productId) => {
    const shouldDelete = await confirmAction(
      "Are you sure you want to delete this product?",
      { title: "Delete Product", confirmText: "Delete", variant: "danger" },
    );
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      const remainingAfterDelete = Math.max(totalProducts - 1, 0);
      const nextTotalPages = Math.max(
        Math.ceil(remainingAfterDelete / pageSize),
        1,
      );
      const nextPage = Math.min(currentPage, nextTotalPages);

      setProducts((prev) => prev.filter((product) => product.id !== productId));
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }

      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      } else {
        fetchInitialData(nextPage, searchQuery, pageSize);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      notifyError(error.message || "Unable to delete product");
    }
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImageUrls((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.productTypeId) {
      notifyError("Please select both audience category and product type.");
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrls = [];

      if (productImages.length) {
        const base64Images = await Promise.all(
          productImages.map((file) => convertToBase64(file)),
        );

        const uploadResponse = await fetch("/api/admin/upload-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: base64Images }),
        });

        const uploadContentType =
          uploadResponse.headers.get("content-type") || "";
        const uploadData = uploadContentType.includes("application/json")
          ? await uploadResponse.json()
          : { success: false, message: await uploadResponse.text() };

        if (!uploadResponse.ok || !uploadData.success) {
          throw new Error(uploadData.message || "Failed to upload images");
        }

        uploadedImageUrls = uploadData.imageUrls || [];
      }

      const response = await fetch(
        editingProductId
          ? `/api/admin/products/${editingProductId}`
          : "/api/admin/products",
        {
          method: editingProductId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            images: editingProductId
              ? [...existingImageUrls, ...uploadedImageUrls]
              : uploadedImageUrls,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create product");
      }

      if (editingProductId) {
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProductId ? data.product : product,
          ),
        );
        if (selectedProduct?.id === editingProductId) {
          setSelectedProduct(data.product);
        }
      } else {
        fetchInitialData(currentPage, searchQuery, pageSize);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      notifyError(error.message || "Unable to create product");
      return;
    } finally {
      setLoading(false);
    }

    resetFormState();
  };

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px]">
          <h3 className="text-[#000000A8]">Admin</h3> / <h3>Products</h3>
        </span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
          Products Management
        </h1>
        <button
          onClick={() => {
            if (showForm) {
              resetFormState();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-[#D9D9D9] text-black text-[12px] font-medium h-10 px-4"
        >
          {showForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {selectedProduct && (
        <section className="border border-[#DFDFDF] p-4 mb-6">
          <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-3">
            Product Details
          </h2>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <p>
              <strong>Name:</strong> {selectedProduct.name}
            </p>
            <p>
              <strong>SKU:</strong> {selectedProduct.sku}
            </p>
            <p>
              <strong>Price:</strong> ₦
              {Number(selectedProduct.price).toLocaleString()}
            </p>
            <p>
              <strong>Stock:</strong> {selectedProduct.stockQuantity}
            </p>
            <p>
              <strong>Category:</strong> {selectedProduct.category?.name || "-"}
            </p>
            <p>
              <strong>Type:</strong> {selectedProduct.productType?.name || "-"}
            </p>
            <p className="col-span-2">
              <strong>Description:</strong> {selectedProduct.description || "-"}
            </p>
            <p className="col-span-2">
              <strong>Tags:</strong>{" "}
              {(selectedProduct.tags || []).join(", ") || "-"}
            </p>
          </div>

          {selectedProduct.images?.length ? (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {selectedProduct.images.map((image) => (
                <img
                  key={image}
                  src={image}
                  alt={selectedProduct.name}
                  className="w-full h-20 object-cover border border-[#DFDFDF]"
                />
              ))}
            </div>
          ) : null}
        </section>
      )}

      {showForm && (
        <section className="border border-[#DFDFDF] p-4 mb-6 flex flex-col gap-4">
          <h2 className="text-[14px] font-medium uppercase tracking-[1px]">
            {editingProductId ? "Edit Product" : "Add New Product"}
          </h2>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              id="productName"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              type="text"
            />

            <Input
              id="productDescription"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              type="text"
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                id="productPrice"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                type="number"
              />
              <Input
                id="productSKU"
                name="sku"
                placeholder="SKU"
                value={formData.sku}
                onChange={handleChange}
                type="text"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                id="productCategory"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
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

              <select
                id="productType"
                name="productTypeId"
                value={formData.productTypeId}
                onChange={handleChange}
                className="w-full border border-[#DFDFDF] h-12.5 px-4 text-[13px] outline-none"
                required
              >
                <option value="">Select Product Type</option>
                {availableProductTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                id="productStock"
                name="stock"
                placeholder="Stock Quantity"
                value={formData.stock}
                onChange={handleChange}
                type="number"
              />

              <Input
                id="productTags"
                name="tags"
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={handleChange}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="productImages"
                className="w-full border border-[#DFDFDF] h-12.5 px-4 text-[13px] outline-none flex items-center cursor-pointer"
              >
                Add Product Images (max 5)
              </label>
              <input
                id="productImages"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={preview}
                      className="relative border border-[#DFDFDF]"
                    >
                      <img
                        src={preview}
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black text-white text-[10px] px-1"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {editingProductId && existingImageUrls.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {existingImageUrls.map((imageUrl, index) => (
                    <div
                      key={imageUrl}
                      className="relative border border-[#DFDFDF]"
                    >
                      <img
                        src={imageUrl}
                        alt={`Existing product ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 bg-black text-white text-[10px] px-1"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              value={
                loading
                  ? editingProductId
                    ? "Updating..."
                    : "Creating..."
                  : editingProductId
                    ? "Update Product"
                    : "Create Product"
              }
              showArrow={true}
            />
          </form>
        </section>
      )}

      <section className="border border-[#DFDFDF] p-4">
        <h2 className="text-[14px] font-medium uppercase tracking-[1px] mb-4">
          Product List
        </h2>

        <div className="flex flex-col gap-2 mb-4">
          <Input
            id="searchProducts"
            name="searchProducts"
            placeholder="Search by product name, SKU, or tag"
            value={searchQuery}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchQuery(e.target.value);
            }}
            type="text"
          />
          <p className="text-[12px] text-[#0000008C]">
            {totalProducts} product{totalProducts === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#DFDFDF]">
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Image
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Name
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Price
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Stock
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  SKU
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Category
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Type
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase">
                  Tags
                </th>
                <th className="text-left py-2 px-2 font-medium uppercase w-24 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#DFDFDF] hover:bg-gray-50"
                >
                  <td className="py-2 px-2">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover border border-[#DFDFDF]"
                      />
                    ) : (
                      <div className="w-12 h-12 border border-[#DFDFDF] bg-[#F5F5F5] flex items-center justify-center text-[10px] text-[#0000008C]">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2">{product.name}</td>
                  <td className="py-2 px-2">
                    ₦{Number(product.price).toLocaleString()}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-1 ${
                        product.stockQuantity < 50
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="py-2 px-2">{product.sku}</td>
                  <td className="py-2 px-2">{product.category?.name || "-"}</td>
                  <td className="py-2 px-2">
                    {product.productType?.name || "-"}
                  </td>
                  <td className="py-2 px-2">
                    {(product.tags || []).join(", ") || "-"}
                  </td>
                  <td className="py-2 px-2 align-middle text-left whitespace-nowrap">
                    <div className="flex items-center gap-2 min-w-20">
                      <button
                        onClick={() => handleViewProduct(product.id)}
                        className="text-gray-700 hover:text-black"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-[#D9D9D9] disabled:opacity-50 text-black text-[12px] font-medium h-8 px-4"
          >
            Previous
          </button>

          <span className="text-[12px] font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage >= totalPages}
            className="bg-[#D9D9D9] disabled:opacity-50 text-black text-[12px] font-medium h-8 px-4"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
