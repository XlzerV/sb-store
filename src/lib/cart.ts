export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  slug: string;
}

const CART_KEY = "vanguard_cart";

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: Omit<CartItem, "id">) {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === item.productId && i.size === item.size);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push({ ...item, id: crypto.randomUUID() });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
  return cart;
}

export function updateQuantity(id: string, quantity: number) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) item.quantity = Math.max(1, quantity);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
  return [];
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
