const prisma = require("../prisma/index.jsx");

const TRANSACTION_TYPES = [
  "STOCK_IN",
  "STOCK_OUT",
  "ADJUSTMENT",
  "RETURN",
  "DAMAGED",
];

const getInventoryStatus = (stockQuantity, lowStockThreshold) => {
  if (stockQuantity <= 0) return "CRITICAL";
  if (stockQuantity <= (lowStockThreshold || 10)) return "LOW_STOCK";
  return "NORMAL";
};

exports.getInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10, q, status } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const products = await prisma.product.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        category: {
          select: { id: true, name: true },
        },
        productType: {
          select: { id: true, name: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const normalizedStatus = (status || "").toUpperCase();

    const inventoryItems = products
      .map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        status: getInventoryStatus(
          product.stockQuantity,
          product.lowStockThreshold,
        ),
        category: product.category,
        productType: product.productType,
        updatedAt: product.updatedAt,
      }))
      .filter((item) => {
        if (!normalizedStatus) return true;
        return item.status === normalizedStatus;
      });

    const total = inventoryItems.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const skip = (pageNumber - 1) * pageSize;
    const paginated = inventoryItems.slice(skip, skip + pageSize);

    res.status(200).json({
      success: true,
      inventory: paginated,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getLowStockAlerts = async (req, res) => {
  try {
    const threshold = Math.max(Number(req.query.threshold) || 10, 0);

    const products = await prisma.product.findMany({
      where: {
        stockQuantity: {
          lte: threshold,
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
      },
      orderBy: [{ stockQuantity: "asc" }, { updatedAt: "desc" }],
      take: 20,
    });

    const alerts = products.map((product) => ({
      ...product,
      status: getInventoryStatus(
        product.stockQuantity,
        product.lowStockThreshold,
      ),
    }));

    res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, reason, type } = req.body;

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Quantity must be a valid non-negative number",
        });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const previousStock = product.stockQuantity;
    let newStock = Math.floor(parsedQuantity);
    let transactionType = "ADJUSTMENT";

    if (type && TRANSACTION_TYPES.includes(type)) {
      transactionType = type;
      const absoluteQuantity = Math.floor(Math.abs(parsedQuantity));

      if (type === "STOCK_IN" || type === "RETURN") {
        newStock = previousStock + absoluteQuantity;
      } else if (type === "STOCK_OUT" || type === "DAMAGED") {
        newStock = Math.max(previousStock - absoluteQuantity, 0);
      } else {
        newStock = Math.max(previousStock + Math.floor(parsedQuantity), 0);
      }
    }

    const [updatedProduct, transaction] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: newStock,
        },
      }),
      prisma.inventoryTransaction.create({
        data: {
          productId,
          type: transactionType,
          quantityChange: newStock - previousStock,
          previousStock,
          newStock,
          reason: reason?.trim() || null,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        stockQuantity: updatedProduct.stockQuantity,
        lowStockThreshold: updatedProduct.lowStockThreshold,
        status: getInventoryStatus(
          updatedProduct.stockQuantity,
          updatedProduct.lowStockThreshold,
        ),
      },
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.logInventoryTransaction = async (req, res) => {
  try {
    const { productId, quantity, type, reason } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    if (!TRANSACTION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type",
      });
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity === 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid non-zero number",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const previousStock = product.stockQuantity;
    let quantityChange = Math.floor(parsedQuantity);

    if (type === "STOCK_IN" || type === "RETURN") {
      quantityChange = Math.floor(Math.abs(parsedQuantity));
    } else if (type === "STOCK_OUT" || type === "DAMAGED") {
      quantityChange = -Math.floor(Math.abs(parsedQuantity));
    }

    const newStock = Math.max(previousStock + quantityChange, 0);

    const [updatedProduct, transaction] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stockQuantity: newStock },
      }),
      prisma.inventoryTransaction.create({
        data: {
          productId,
          type,
          quantityChange,
          previousStock,
          newStock,
          reason: reason?.trim() || null,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        stockQuantity: updatedProduct.stockQuantity,
        lowStockThreshold: updatedProduct.lowStockThreshold,
        status: getInventoryStatus(
          updatedProduct.stockQuantity,
          updatedProduct.lowStockThreshold,
        ),
      },
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
