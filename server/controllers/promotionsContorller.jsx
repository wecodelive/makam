const prisma = require("../prisma/index.jsx");

const DISCOUNT_TYPE_MAP = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
  FREE_SHIPPING: "FREE_SHIPPING",
  percentage: "PERCENTAGE",
  fixed: "FIXED",
  shipping: "FREE_SHIPPING",
  free_shipping: "FREE_SHIPPING",
};

const normalizeDiscountType = (value) => DISCOUNT_TYPE_MAP[value] || null;

exports.getPromotions = async (req, res) => {
  try {
    const { q, status } = req.query;

    const where = {
      ...(status === "active"
        ? { isActive: true }
        : status === "inactive"
          ? { isActive: false }
          : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const promos = await prisma.promotionCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        isActive: true,
        startsAt: true,
        endsAt: true,
        usedCount: true,
        usageLimit: true,
        createdAt: true,
      },
    });

    res.status(200).json({ success: true, promos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const {
      code,
      description,
      type,
      discountType,
      discountValue,
      discount,
      expiryDate,
      startsAt,
      endsAt,
    } = req.body;

    const normalizedCode = String(code || "")
      .trim()
      .toUpperCase();
    if (!normalizedCode) {
      return res
        .status(400)
        .json({ success: false, message: "Promo code is required" });
    }

    const normalizedType = normalizeDiscountType(
      discountType || type || "PERCENTAGE",
    );
    if (!normalizedType) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid discount type" });
    }

    const parsedDiscount = Number(discountValue ?? discount ?? 0);
    const resolvedDiscountValue =
      normalizedType === "FREE_SHIPPING" ? 0 : parsedDiscount;

    if (
      normalizedType !== "FREE_SHIPPING" &&
      (!resolvedDiscountValue || resolvedDiscountValue <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0",
      });
    }

    const promo = await prisma.promotionCode.create({
      data: {
        code: normalizedCode,
        description: description?.trim() || null,
        discountType: normalizedType,
        discountValue: resolvedDiscountValue,
        endsAt: endsAt
          ? new Date(endsAt)
          : expiryDate
            ? new Date(expiryDate)
            : null,
        startsAt: startsAt ? new Date(startsAt) : null,
      },
    });

    res.status(201).json({ success: true, promo });
  } catch (error) {
    if (error?.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Promo code already exists" });
    }

    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const { promoId } = req.params;
    const {
      code,
      description,
      type,
      discountType,
      discountValue,
      discount,
      expiryDate,
      startsAt,
      endsAt,
      isActive,
    } = req.body;

    const existingPromo = await prisma.promotionCode.findUnique({
      where: { id: promoId },
    });

    if (!existingPromo) {
      return res
        .status(404)
        .json({ success: false, message: "Promotion not found" });
    }

    const data = {};

    if (code !== undefined) {
      const normalizedCode = String(code || "")
        .trim()
        .toUpperCase();
      if (!normalizedCode) {
        return res
          .status(400)
          .json({ success: false, message: "Promo code is required" });
      }
      data.code = normalizedCode;
    }

    if (description !== undefined) {
      data.description = description?.trim() || null;
    }

    let nextDiscountType = existingPromo.discountType;
    if (type !== undefined || discountType !== undefined) {
      const normalizedType = normalizeDiscountType(discountType || type);
      if (!normalizedType) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid discount type" });
      }

      nextDiscountType = normalizedType;
      data.discountType = normalizedType;
    }

    if (nextDiscountType === "FREE_SHIPPING") {
      data.discountValue = 0;
    } else if (
      discountValue !== undefined ||
      discount !== undefined ||
      nextDiscountType !== existingPromo.discountType
    ) {
      const providedDiscount = discountValue ?? discount;
      const resolvedDiscount =
        providedDiscount !== undefined
          ? Number(providedDiscount)
          : Number(existingPromo.discountValue);

      if (!Number.isFinite(resolvedDiscount) || resolvedDiscount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Discount value must be greater than 0",
        });
      }

      data.discountValue = resolvedDiscount;
    }

    if (expiryDate !== undefined || endsAt !== undefined) {
      const expiryValue = endsAt !== undefined ? endsAt : expiryDate;
      data.endsAt = expiryValue ? new Date(expiryValue) : null;
    }

    if (startsAt !== undefined) {
      data.startsAt = startsAt ? new Date(startsAt) : null;
    }

    if (typeof isActive === "boolean") {
      data.isActive = isActive;
    }

    const promo = await prisma.promotionCode.update({
      where: { id: promoId },
      data,
    });

    res.status(200).json({ success: true, promo });
  } catch (error) {
    if (error?.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Promo code already exists" });
    }

    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.togglePromotion = async (req, res) => {
  try {
    const { promoId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const payload = await exports.updatePromotion(
      { ...req, params: { promoId }, body: { isActive } },
      res,
    );

    return payload;
  } catch (error) {
    if (error?.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Promotion not found" });
    }

    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const { promoId } = req.params;

    const existingPromo = await prisma.promotionCode.findUnique({
      where: { id: promoId },
      select: { id: true, code: true, _count: { select: { orders: true } } },
    });

    if (!existingPromo) {
      return res
        .status(404)
        .json({ success: false, message: "Promotion not found" });
    }

    if (existingPromo._count.orders > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a promotion that is linked to orders",
      });
    }

    await prisma.promotionCode.delete({ where: { id: promoId } });

    res.status(200).json({
      success: true,
      message: `Promotion ${existingPromo.code} deleted successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
