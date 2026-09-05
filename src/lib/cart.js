const CART_STORAGE_KEY = "param_computers_cart";
export const CART_UPDATED_EVENT = "param_cart_updated";

export function getLocalCart() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
      return [];
    }

    const cart = JSON.parse(storedCart);

    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("Unable to read cart:", error);
    return [];
  }
}

export function saveLocalCart(cart) {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new CustomEvent(CART_UPDATED_EVENT, {
        detail: { cart },
      })
    );

    return cart;
  } catch (error) {
    console.error("Unable to save cart:", error);
    return [];
  }
}

export function addToCart(product) {
  const cart = getLocalCart();

  const existingItem = cart.find(
    (item) => item.product_id === product.id
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      brand: product.brand,
      image_url: product.image_url,
      quantity: 1,
    });
  }

  saveLocalCart(cart);

  return cart;
}

export function removeFromCart(productId) {
  const cart = getLocalCart();

  const updatedCart = cart.filter(
    (item) => item.product_id !== productId
  );

  saveLocalCart(updatedCart);

  return updatedCart;
}

export function updateCartQuantity(productId, quantity) {
  const cart = getLocalCart();

  const updatedCart = cart.map((item) =>
    item.product_id === productId
      ? {
          ...item,
          quantity: Math.max(1, quantity),
        }
      : item
  );

  saveLocalCart(updatedCart);

  return updatedCart;
}

export function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);

  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: { cart: [] },
    })
  );
}

export function getCartItemCount() {
  const cart = getLocalCart();

  return cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
}