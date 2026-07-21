import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { zar } from "@/lib/pdf/zar";

export type InvoiceOrder = {
  order_number: string;
  created_at: string;
  paid_at: string | null;
  email: string;
  full_name: string;
  phone: string;
  delivery_method: string;
  delivery_address: Record<string, string> | null;
  collection_point: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
};

export type InvoiceItem = {
  product_title: string;
  size: string;
  unit_price: number;
  qty: number;
  line_total: number;
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#2c2c2c", fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#2f4f3a" },
  brandSub: { fontSize: 9, color: "#6b6b6b", marginTop: 2 },
  invoiceTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  meta: { fontSize: 9, color: "#6b6b6b", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#6b6b6b",
    marginBottom: 4,
  },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cItem: { flex: 4 },
  cQty: { flex: 1, textAlign: "right" },
  cPrice: { flex: 1.4, textAlign: "right" },
  cTotal: { flex: 1.4, textAlign: "right" },
  totals: { marginTop: 14, alignSelf: "flex-end", width: 200 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  footer: {
    marginTop: 36,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    fontSize: 8,
    color: "#8a8a8a",
    textAlign: "center",
  },
});

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function InvoiceDocument({
  order,
  items,
}: {
  order: InvoiceOrder;
  items: InvoiceItem[];
}) {
  const addr = order.delivery_address;
  const addressLines =
    order.delivery_method === "collection"
      ? [order.collection_point ? `Collection: ${order.collection_point}` : "Collection"]
      : [addr?.line1, addr?.line2, addr?.city, addr?.province, addr?.postalCode].filter(
          Boolean
        );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Diana&apos;s Bulbinella</Text>
            <Text style={styles.brandSub}>Natural skincare · White River, South Africa</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.meta}>#{order.order_number}</Text>
            <Text style={styles.meta}>Date: {formatDate(order.created_at)}</Text>
            {order.paid_at && (
              <Text style={styles.meta}>Paid: {formatDate(order.paid_at)}</Text>
            )}
          </View>
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Billed to</Text>
            <Text>{order.full_name}</Text>
            <Text>{order.email}</Text>
            {order.phone ? <Text>{order.phone}</Text> : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>
              {order.delivery_method === "collection" ? "Collection" : "Delivery"}
            </Text>
            {addressLines.length > 0 ? (
              addressLines.map((l, i) => <Text key={i}>{l as string}</Text>)
            ) : (
              <Text>—</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHead}>
            <Text style={styles.cItem}>Item</Text>
            <Text style={styles.cQty}>Qty</Text>
            <Text style={styles.cPrice}>Unit</Text>
            <Text style={styles.cTotal}>Total</Text>
          </View>
          {items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.cItem}>
                {item.product_title}
                {item.size ? ` — ${item.size}` : ""}
              </Text>
              <Text style={styles.cQty}>{item.qty}</Text>
              <Text style={styles.cPrice}>{zar(item.unit_price)}</Text>
              <Text style={styles.cTotal}>{zar(item.line_total)}</Text>
            </View>
          ))}

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text>Subtotal</Text>
              <Text>{zar(order.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Delivery</Text>
              <Text>{Number(order.shipping) === 0 ? "Free" : zar(order.shipping)}</Text>
            </View>
            <View style={styles.grand}>
              <Text>Total</Text>
              <Text>{zar(order.total)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for supporting a small South African family business.
          {"\n"}dianas.co.za
        </Text>
      </Page>
    </Document>
  );
}
