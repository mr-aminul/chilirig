import { formatPrice } from "@/lib/utils";

export type DiscordOrderItem = {
  name: string;
  price: number;
  quantity: number;
};

export type DiscordOrderNotification = {
  orderId: string;
  fullName: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  cityName: string;
  zoneName: string;
  areaName: string;
  items: DiscordOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

function formatDeliveryAddress(order: DiscordOrderNotification) {
  return [order.address, order.areaName, order.zoneName, order.cityName]
    .filter(Boolean)
    .join(", ");
}

function formatItemsList(items: DiscordOrderItem[]) {
  const lines = items.map(
    (item) =>
      `• **${item.name}** × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
  );
  const text = lines.join("\n");
  if (text.length <= 1024) return text;
  return `${text.slice(0, 1020)}…`;
}

/** Posts a new-order alert to Discord. Does not throw; logs failures. */
export async function notifyDiscordNewOrder(order: DiscordOrderNotification): Promise<void> {
  const webhookUrl = process.env.DISCORD_ORDERS_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  const deliveryAddress = formatDeliveryAddress(order);
  const phoneLines = order.secondaryPhone
    ? `${order.phone}\nAlt: ${order.secondaryPhone}`
    : order.phone;

  const embed = {
    title: `New order ${order.orderId}`,
    color: 0x16a34a,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Customer", value: order.fullName, inline: true },
      { name: "Total", value: formatPrice(order.total), inline: true },
      { name: "Email", value: order.email, inline: true },
      { name: "Phone", value: phoneLines, inline: true },
      {
        name: "Items",
        value: formatItemsList(order.items) || "—",
        inline: false,
      },
      {
        name: "Delivery",
        value: deliveryAddress.length > 1024 ? `${deliveryAddress.slice(0, 1020)}…` : deliveryAddress,
        inline: false,
      },
      {
        name: "Breakdown",
        value: `Subtotal ${formatPrice(order.subtotal)} · Shipping ${formatPrice(order.shipping)} · **Total ${formatPrice(order.total)}**`,
        inline: false,
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[Discord] Order webhook failed:", response.status, text);
    }
  } catch (error) {
    console.error("[Discord] Order webhook error:", error);
  }
}
