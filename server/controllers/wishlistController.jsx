const prisma = require("../prisma/index.jsx");

exports.getWishlist = async (req, res) => {
  try {
    const extractUserFromJwt = require("../helpers/extractUserFromJwt.jsx");
    const decoded = extractUserFromJwt(req);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid or missing token",
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (pageNumber - 1) * pageSize;

    const [wishlistItems, total] = await Promise.all([
      prisma.wishlistItem.findMany({
        where: { userId: decoded.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              sku: true,
              images: true,
              description: true,
              stockQuantity: true,
              category: { select: { id: true, name: true } },
            },
          },
          variant: {
            select: {
              id: true,
              color: true,
              size: true,
            },
          },
        },
      }),
      prisma.wishlistItem.count({ where: { userId: decoded.id } }),
    ]);

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    res.status(200).json({
      success: true,
      wishlistItems,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const extractUserFromJwt = require("../helpers/extractUserFromJwt.jsx");
    const decoded = extractUserFromJwt(req);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid or missing token",
      });
    }

    const { productId, variantId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        userId: decoded.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Create wishlist item
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: decoded.id,
        productId,
        variantId: variantId || null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            sku: true,
            images: true,
            stockQuantity: true,
          },
        },
        variant: true,
      },
    });

    res.status(201).json({
      success: true,
      wishlistItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const extractUserFromJwt = require("../helpers/extractUserFromJwt.jsx");
    const decoded = extractUserFromJwt(req);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid or missing token",
      });
    }

    const { wishlistItemId } = req.params;

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { id: wishlistItemId },
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    if (wishlistItem.userId !== decoded.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - cannot delete other user's wishlist items",
      });
    }

    await prisma.wishlistItem.delete({
      where: { id: wishlistItemId },
    });

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.checkWishlistItem = async (req, res) => {
  try {
    const extractUserFromJwt = require("../helpers/extractUserFromJwt.jsx");
    const decoded = extractUserFromJwt(req);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid or missing token",
      });
    }

    const { productId, variantId } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: decoded.id,
        productId,
        variantId: variantId || null,
      },
    });

    res.status(200).json({
      success: true,
      isInWishlist: !!wishlistItem,
      wishlistItem: wishlistItem || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
