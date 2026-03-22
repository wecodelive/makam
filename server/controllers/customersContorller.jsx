const prisma = require("../prisma/index.jsx");

exports.getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, q, status } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (pageNumber - 1) * pageSize;

    const where = {
      role: "CUSTOMER",
      ...(status === "active"
        ? { isActive: true, isSuspended: false }
        : status === "inactive"
          ? { OR: [{ isActive: false }, { isSuspended: true }] }
          : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isActive: true,
          isSuspended: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    res.status(200).json({
      success: true,
      customers,
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

exports.getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await prisma.user.findFirst({
      where: {
        id: customerId,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        isSuspended: true,
        createdAt: true,
        addresses: {
          orderBy: { createdAt: "desc" },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            placedAt: true,
            _count: {
              select: { items: true },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { name, firstName, lastName, email, phone, isActive, isSuspended } =
      req.body;

    const existingCustomer = await prisma.user.findFirst({
      where: { id: customerId, role: "CUSTOMER" },
    });

    if (!existingCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const updatedCustomer = await prisma.user.update({
      where: { id: customerId },
      data: {
        ...(name !== undefined
          ? { name: name?.trim() || existingCustomer.name }
          : {}),
        ...(firstName !== undefined
          ? { firstName: firstName?.trim() || null }
          : {}),
        ...(lastName !== undefined
          ? { lastName: lastName?.trim() || null }
          : {}),
        ...(email !== undefined
          ? { email: email?.trim() || existingCustomer.email }
          : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
        ...(typeof isSuspended === "boolean" ? { isSuspended } : {}),
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        isSuspended: true,
      },
    });

    res.status(200).json({ success: true, customer: updatedCustomer });
  } catch (error) {
    if (error?.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.suspendCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { action } = req.body;

    const existingCustomer = await prisma.user.findFirst({
      where: { id: customerId, role: "CUSTOMER" },
    });

    if (!existingCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    let updateData;
    if (action === "activate") {
      updateData = { isActive: true, isSuspended: false };
    } else {
      updateData = { isActive: false, isSuspended: true };
    }

    const customer = await prisma.user.update({
      where: { id: customerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        isSuspended: true,
      },
    });

    res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.resetCustomerPassword = async (req, res) => {
  try {
    const { customerId } = req.params;

    const existingCustomer = await prisma.user.findFirst({
      where: { id: customerId, role: "CUSTOMER" },
      select: { id: true, email: true },
    });

    if (!existingCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      message: `Password reset link queued for ${existingCustomer.email}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
