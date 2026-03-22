export const APP_CART_UPDATED_EVENT = "app-cart-updated";

const CART_STORAGE_KEY = "makam-cart-v1";

const isBrowser = () => typeof window !== "undefined";

const emitCartUpdate = () => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(APP_CART_UPDATED_EVENT));
};

const readCart = () => {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
};

const writeCart = (items) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  emitCartUpdate();
};

export const getCartItems = () => readCart();

export const addToCart = (item) => {
  const items = readCart();
  const existingIndex = items.findIndex((entry) => entry.productId === item.productId);
  const maxQuantity = Math.max(Number(item.maxQuantity) || 1, 1);

  if (existingIndex >= 0) {
    const existing = items[existingIndex];
    items[existingIndex] = {
      ...existing,
      quantity: Math.min(existing.quantity + (item.quantity || 1), maxQuantity),
      unitPrice: item.unitPrice ?? existing.unitPrice,
      image: item.image || existing.image,
      name: item.name || existing.name,
    };
  } else {
    items.push({
      productId: item.productId,
      name: item.name,
      unitPrice: Number(item.unitPrice) || 0,
      quantity: Math.min(Math.max(Number(item.quantity) || 1, 1), maxQuantity),
      maxQuantity,
      image: item.image || "",
      categoryName: item.categoryName || "",
    });
  }

  writeCart(items);
  return items;
};

export const updateCartItemQuantity = (productId, quantity) => {
  const items = readCart();
  const nextQuantity = Math.max(Number(quantity) || 1, 1);

  const nextItems = items
    .map((item) => {
      if (item.productId !== productId) {
        return item;
      }

      return {
        ...item,
        quantity: Math.min(nextQuantity, Math.max(Number(item.maxQuantity) || 1, 1)),
      };
    })
    .filter((item) => item.quantity > 0);

  writeCart(nextItems);
  return nextItems;
};

export const removeFromCart = (productId) => {
  const items = readCart();
  const nextItems = items.filter((item) => item.productId !== productId);
  writeCart(nextItems);
  return nextItems;
};

export const clearCart = () => {
  writeCart([]);
};

export const getCartSummary = () => {
  const items = readCart();
  const itemCount = items.reduce((count, item) => count + (Number(item.quantity) || 0), 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
    0,
  );

  return {
    items,
    itemCount,
    subtotal,
    total: subtotal,
  };
};