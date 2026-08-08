interface YalidineAddress {
  wilaya_id: number;
  commune_id: number;
  address: string;
  full_name: string;
  phone: string;
}

interface YalidineOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  address: YalidineAddress;
  items: { name: string; quantity: number; price: number }[];
}

const YALIDINE_API_URL = "https://api.yalidine.app/v1";
const YALIDINE_API_KEY = process.env.YALIDINE_API_KEY || "";
const YALIDINE_API_SECRET = process.env.YALIDINE_API_SECRET || "";

export async function createDelivery(order: YalidineOrder) {
  try {
    const response = await fetch(`${YALIDINE_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": YALIDINE_API_KEY,
        "X-API-Secret": YALIDINE_API_SECRET,
      },
      body: JSON.stringify({
        order_id: order.id,
        first_name: order.address.full_name.split(" ")[0],
        last_name: order.address.full_name.split(" ").slice(1).join(" ") || "Client",
        phone: order.address.phone,
        wilaya_id: order.address.wilaya_id,
        commune_id: order.address.commune_id,
        address: order.address.address,
        products: order.items.map((item) => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_price: order.total,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Yalidine error:", error);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Yalidine delivery error:", error);
    return null;
  }
}

export async function trackDelivery(trackingId: string) {
  try {
    const response = await fetch(`${YALIDINE_API_URL}/orders/${trackingId}`, {
      headers: {
        "X-API-Key": YALIDINE_API_KEY,
        "X-API-Secret": YALIDINE_API_SECRET,
      },
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
