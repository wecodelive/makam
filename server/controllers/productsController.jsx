const prisma = require("../prisma/index.jsx");

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const normalizeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return [
      ...new Set(
        tags.map((tag) => tag?.toString().trim().toLowerCase()).filter(Boolean),
      ),
    ];
  }

  return [
    ...new Set(
      tags
        .toString()
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
};

exports.getProducts = async (req, res) => {
  try {
    const {
      categoryId,
      productTypeId,
      q,
      minPrice,
      maxPrice,
      stockStatus,
      includeArchived,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (pageNumber - 1) * pageSize;

    const where = {
      ...(includeArchived === "true" ? {} : { status: { not: "ARCHIVED" } }),
      ...(categoryId ? { categoryId } : {}),
      ...(productTypeId ? { productTypeId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { tags: { has: q.toLowerCase() } },
            ],
          }
        : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined
                ? { gte: Math.max(Number(minPrice) || 0, 0) }
                : {}),
              ...(maxPrice !== undefined
                ? { gte: 0, lte: Math.max(Number(maxPrice) || 0, 0) }
                : {}),
            },
          }
        : {}),
      ...(stockStatus === "in"
        ? { stockQuantity: { gt: 0 } }
        : stockStatus === "out"
          ? { stockQuantity: { lte: 0 } }
          : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          productType: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, productTypeId, q, includeArchived } = req.query;

    const where = {
      ...(includeArchived === "true" ? {} : { status: { not: "ARCHIVED" } }),
      ...(categoryId ? { categoryId } : {}),
      ...(productTypeId ? { productTypeId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { tags: { has: q.toLowerCase() } },
            ],
          }
        : {}),
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        productType: { select: { id: true, name: true, slug: true } },
      },
    });

    res.status(200).json({
      success: true,
      products,
      total: products.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        productType: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      productTypeId,
      stock,
      sku,
      slug,
      tags,
      images,
    } = req.body;

    if (!name?.trim() || !sku?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Product name and SKU are required" });
    }

    if (!categoryId || !productTypeId) {
      return res.status(400).json({
        success: false,
        message: "Category and product type are required",
      });
    }

    if (price === undefined || price === null || Number(price) < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid product price is required" });
    }

    const [category, productType] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.productType.findUnique({ where: { id: productTypeId } }),
    ]);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (!productType) {
      return res
        .status(404)
        .json({ success: false, message: "Product type not found" });
    }

    if (productType.categoryId !== categoryId) {
      return res.status(400).json({
        success: false,
        message: "Product type does not belong to selected category",
      });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        slug: slugify(slug || name),
        sku: sku.trim().toUpperCase(),
        price: Number(price),
        stockQuantity: Number(stock || 0),
        categoryId,
        productTypeId,
        tags: normalizeTags(tags),
        images: Array.isArray(images) ? images : [],
        status: "ACTIVE",
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        productType: { select: { id: true, name: true, slug: true } },
      },
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Product SKU or slug already exists",
      });
    }

    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name,
      description,
      price,
      categoryId,
      productTypeId,
      stock,
      sku,
      slug,
      tags,
      images,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (price !== undefined && price !== null && Number(price) < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid product price is required" });
    }

    const resolvedCategoryId = categoryId || existingProduct.categoryId;
    const resolvedProductTypeId =
      productTypeId || existingProduct.productTypeId;

    const [category, productType] = await Promise.all([
      prisma.category.findUnique({ where: { id: resolvedCategoryId } }),
      prisma.productType.findUnique({ where: { id: resolvedProductTypeId } }),
    ]);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (!productType) {
      return res
        .status(404)
        .json({ success: false, message: "Product type not found" });
    }

    if (productType.categoryId !== resolvedCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Product type does not belong to selected category",
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(description !== undefined
          ? { description: description?.trim() || null }
          : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(stock !== undefined ? { stockQuantity: Number(stock || 0) } : {}),
        ...(sku !== undefined ? { sku: sku.trim().toUpperCase() } : {}),
        ...(slug !== undefined
          ? { slug: slugify(slug || name || existingProduct.name) }
          : {}),
        ...(tags !== undefined ? { tags: normalizeTags(tags) } : {}),
        ...(Array.isArray(images) ? { images } : {}),
        categoryId: resolvedCategoryId,
        productTypeId: resolvedProductTypeId,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        productType: { select: { id: true, name: true, slug: true } },
      },
    });

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Product SKU or slug already exists",
      });
    }

    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const [productOrderItemsCount, productVariants] = await Promise.all([
      prisma.orderItem.count({ where: { productId } }),
      prisma.productVariant.findMany({
        where: { productId },
        select: { id: true },
      }),
    ]);

    const variantIds = productVariants.map((variant) => variant.id);
    const variantOrderItemsCount = variantIds.length
      ? await prisma.orderItem.count({
          where: { variantId: { in: variantIds } },
        })
      : 0;

    if (productOrderItemsCount > 0 || variantOrderItemsCount > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.cartItem.deleteMany({ where: { productId } });
        await tx.wishlistItem.deleteMany({ where: { productId } });
        await tx.product.update({
          where: { id: productId },
          data: { status: "ARCHIVED" },
        });
      });

      return res.status(200).json({
        success: true,
        message: "Product archived because it is linked to existing orders.",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { productId } });
      await tx.wishlistItem.deleteMany({ where: { productId } });
      await tx.productReview.deleteMany({ where: { productId } });
      await tx.inventoryTransaction.deleteMany({ where: { productId } });

      if (variantIds.length) {
        await tx.cartItem.deleteMany({
          where: { variantId: { in: variantIds } },
        });
        await tx.wishlistItem.deleteMany({
          where: { variantId: { in: variantIds } },
        });
        await tx.productVariant.deleteMany({
          where: { id: { in: variantIds } },
        });
      }

      await tx.product.delete({ where: { id: productId } });
    });

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
