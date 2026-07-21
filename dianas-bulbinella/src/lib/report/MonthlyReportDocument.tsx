import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { MonthlyReport } from "@/lib/report/build";
import { zar } from "@/lib/pdf/zar";

/** Styles mirror src/lib/invoice/InvoiceDocument.tsx — bold is a font family
 *  ("Helvetica-Bold"), not a weight: react-pdf's built-in Helvetica has no
 *  weight synthesis. */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: "#2c2c2c",
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  brand: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#2f4f3a",
    marginBottom: 2,
  },
  brandSub: { fontSize: 9, color: "#6b6b6b" },
  rightHeader: { alignItems: "flex-end" },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 9, color: "#6b6b6b", marginTop: 2 },

  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#2f4f3a",
    marginTop: 16,
    marginBottom: 8,
  },

  cardRow: { flexDirection: "row", marginBottom: 4 },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 4,
    padding: 8,
  },
  cardLabel: {
    fontSize: 8,
    color: "#6b6b6b",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardValue: { fontSize: 13, fontFamily: "Helvetica-Bold" },

  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#6b6b6b" },
  note: { fontSize: 8, color: "#6b6b6b", marginTop: 4 },
  trendUp: { fontFamily: "Helvetica-Bold", color: "#2f4f3a", marginTop: 4 },
  trendDown: { fontFamily: "Helvetica-Bold", color: "#a33", marginTop: 4 },

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
  cProduct: { flex: 4 },
  cUnits: { flex: 1, textAlign: "right" },
  cRevenue: { flex: 1.4, textAlign: "right" },

  customerBlock: { marginBottom: 8 },
  customerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  customerTag: { fontSize: 8, color: "#6b6b6b", marginLeft: 4 },
  customerMeta: { fontSize: 8, color: "#6b6b6b" },

  footer: {
    marginTop: 36,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    fontSize: 8,
    color: "#8a8a8a",
    textAlign: "center",
  },
  pageNo: {
    position: "absolute",
    bottom: 16,
    right: 40,
    fontSize: 8,
    color: "#8a8a8a",
  },
});

export default function MonthlyReportDocument({
  report,
}: {
  report: MonthlyReport;
}) {
  const cards: { label: string; value: string | number }[] = [
    { label: "Total sales", value: zar(report.totalSales) },
    { label: "Orders", value: report.orderCount },
    { label: "Average order", value: zar(report.averageOrderValue) },
    { label: "New customers", value: report.newCustomers },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Diana&apos;s Bulbinella</Text>
            <Text style={styles.brandSub}>
              Natural skincare · White River, South Africa
            </Text>
          </View>
          <View style={styles.rightHeader}>
            <Text style={styles.title}>MONTHLY REPORT</Text>
            <Text style={styles.meta}>{report.label}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.cardRow}>
          {cards.map((c, i) => (
            <View
              key={c.label}
              style={[
                styles.card,
                { marginRight: i < cards.length - 1 ? 6 : 0 },
              ]}
            >
              <Text style={styles.cardLabel}>{c.label}</Text>
              <Text style={styles.cardValue}>{c.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Compared with last month</Text>
        <Text>
          <Text style={styles.bold}>{zar(report.previousSales)}</Text>
          {" from "}
          {report.previousOrderCount}{" "}
          {report.previousOrderCount === 1 ? "order" : "orders"} last month
        </Text>
        {report.salesChangePct === null ? (
          <Text style={styles.note}>No sales last month to compare against.</Text>
        ) : (
          <Text
            style={
              report.salesChangePct >= 0 ? styles.trendUp : styles.trendDown
            }
          >
            Sales {report.salesChangePct >= 0 ? "up" : "down"}{" "}
            {Math.abs(report.salesChangePct).toFixed(1)}% on last month
          </Text>
        )}

        <Text style={styles.sectionTitle}>Customer mix</Text>
        <Text>New customers: {report.newCustomers}</Text>
        <Text>Returning customers: {report.repeatCustomers}</Text>
        <Text>Guest orders (no account): {report.guestOrders}</Text>
        <Text style={styles.note}>
          Guest orders can&apos;t be linked to a customer account, so they always
          count as new.
        </Text>

        <Text style={styles.sectionTitle}>Top products</Text>
        {report.topProducts.length === 0 ? (
          <Text style={styles.muted}>No sales this month.</Text>
        ) : (
          <View>
            <View style={styles.tableHead}>
              <Text style={styles.cProduct}>Product</Text>
              <Text style={styles.cUnits}>Units</Text>
              <Text style={styles.cRevenue}>Revenue</Text>
            </View>
            {report.topProducts.map((p) => (
              <View style={styles.tableRow} key={p.title}>
                <Text style={styles.cProduct}>{p.title}</Text>
                <Text style={styles.cUnits}>{p.units}</Text>
                <Text style={styles.cRevenue}>{zar(p.revenue)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Customers</Text>
        {report.customers.length === 0 ? (
          <Text style={styles.muted}>No customers this month.</Text>
        ) : (
          // Keyed by index: a guest and a signed-in customer can share an
          // email address and still be two separate rows here.
          report.customers.map((c, i) => (
            <View style={styles.customerBlock} key={i} wrap={false}>
              <View style={styles.customerTopRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.bold}>{c.name}</Text>
                  <Text style={styles.customerTag}>
                    {c.isNew ? "(new)" : "(returning)"}
                  </Text>
                </View>
                <Text style={styles.bold}>{zar(c.spent)}</Text>
              </View>
              <Text style={styles.customerMeta}>
                {c.email} · {c.orders} {c.orders === 1 ? "order" : "orders"}
              </Text>
              {c.items.length > 0 && (
                <Text style={styles.customerMeta}>{c.items.join(", ")}</Text>
              )}
            </View>
          ))
        )}

        <Text style={styles.footer}>
          Generated automatically by dianas.co.za
          {"\n"}Figures include paid, completed, shipped and collected orders
          only.
        </Text>

        <Text
          style={styles.pageNo}
          fixed
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
