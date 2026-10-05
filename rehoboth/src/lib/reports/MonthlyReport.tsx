import fs from "node:fs";
import path from "node:path";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { rands } from "../money";
import type { ReportPeriod } from "./period";
import type { ShopMetrics, ProductLine } from "./shop";
import type { Row, TrafficMetrics } from "./ga";
import type { Summary } from "./summary";

/**
 * The monthly report as a PDF. A pure function of ReportData — no fetching —
 * so it can be rendered with mock figures to check the layout.
 *
 * Layout rules carried over from Everest: every titled table is one unbreakable
 * block so a heading never strands at the foot of a page, and deltas are ASCII
 * plus colour, never arrow glyphs.
 */

export type ReportData = {
  period: ReportPeriod;
  generatedAt: string;
  shop: ShopMetrics;
  previous: ShopMetrics;
  traffic: TrafficMetrics;
  previousTraffic: TrafficMetrics;
  summary: Summary | null;
};

const BRAND = "#6C8781";
const NIGHT = "#24403A";
const INK = "#1B2521";
const SOFT = "#56635E";
const MUTE = "#808D88";
const HAIR = "#DFE9E4";
const WASH = "#F3F7F5";
const UP = "#2F7A4B";
const DOWN = "#B42318";

const asset = (...p: string[]) => path.join(process.cwd(), "public", ...p);

// Brand faces when the files are there; Helvetica (built in) when not, so a
// missing font never costs the client their report.
const FONTS = { display: "Helvetica", body: "Helvetica", bold: "Helvetica-Bold" };
if (fs.existsSync(asset("fonts", "karla-400.ttf"))) {
  Font.register({ family: "Marcellus", src: asset("fonts", "marcellus-400.ttf") });
  Font.register({
    family: "Karla",
    fonts: [
      { src: asset("fonts", "karla-400.ttf") },
      { src: asset("fonts", "karla-700.ttf"), fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  Object.assign(FONTS, { display: "Marcellus", body: "Karla", bold: "Karla" });
}

// Read as bytes: handed a Windows path, react-pdf mistakes "C:" for a URL.
const LOGO = fs.existsSync(asset("brand", "wordmark-light.png"))
  ? { data: fs.readFileSync(asset("brand", "wordmark-light.png")), format: "png" as const }
  : null;

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 56, paddingHorizontal: 40, fontFamily: FONTS.body, fontSize: 9, color: INK },
  cover: {
    backgroundColor: NIGHT,
    marginHorizontal: -40,
    marginTop: -36,
    paddingHorizontal: 40,
    paddingVertical: 26,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `3 solid ${BRAND}`,
  },
  logo: { width: 150 },
  coverTitle: { fontFamily: FONTS.display, fontSize: 18, color: "#FFFFFF", textAlign: "right" },
  coverSub: { fontSize: 8.5, color: "#C9D6D1", marginTop: 4, textAlign: "right" },
  section: {
    fontFamily: FONTS.display,
    fontSize: 14,
    color: NIGHT,
    borderBottom: `1.5 solid ${BRAND}`,
    paddingBottom: 4,
    marginTop: 20,
    marginBottom: 10,
  },
  sub: { fontFamily: FONTS.bold, fontWeight: 700, fontSize: 9, color: INK, marginBottom: 5, marginTop: 4 },
  tiles: { flexDirection: "row", gap: 8, marginBottom: 6 },
  tile: { flexGrow: 1, flexBasis: 0, backgroundColor: WASH, border: `1 solid ${HAIR}`, padding: 9 },
  tileLabel: { fontSize: 6.8, color: SOFT, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 },
  tileValue: { fontFamily: FONTS.bold, fontWeight: 700, fontSize: 15, color: NIGHT },
  delta: { fontFamily: FONTS.bold, fontWeight: 700, fontSize: 7.5, marginTop: 2 },
  note: { fontSize: 8.5, color: SOFT, marginTop: 2, marginBottom: 4 },
  cols: { flexDirection: "row", gap: 14 },
  col: { flex: 1 },
  th: { flexDirection: "row", backgroundColor: NIGHT, paddingVertical: 4.5, paddingHorizontal: 7 },
  thText: { color: "#FFFFFF", fontSize: 6.8, textTransform: "uppercase", letterSpacing: 0.5 },
  tr: { flexDirection: "row", borderBottom: `0.75 solid ${HAIR}`, paddingVertical: 4.5, paddingHorizontal: 7 },
  trAlt: { backgroundColor: WASH },
  td: { fontSize: 8 },
  right: { textAlign: "right" },
  empty: { fontSize: 8.5, color: MUTE, paddingVertical: 6 },
  summary: { backgroundColor: WASH, borderLeft: `3 solid ${BRAND}`, padding: 12, marginTop: 14 },
  summaryHead: { fontSize: 9.5, lineHeight: 1.5, color: INK },
  finding: { marginTop: 8 },
  findingWhat: { fontFamily: FONTS.bold, fontWeight: 700, fontSize: 8.5 },
  findingText: { fontSize: 8.5, color: SOFT, lineHeight: 1.45, marginTop: 1 },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `0.75 solid ${HAIR}`,
    paddingTop: 7,
    fontSize: 7,
    color: MUTE,
  },
});

/* ------------------------------------------------------------- helpers */

const num = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function Delta({ now, before }: { now: number; before: number | undefined }) {
  if (before === undefined) return null;
  if (before === 0) {
    return <Text style={[s.delta, { color: MUTE }]}>{now === 0 ? "No change" : "New this month"}</Text>;
  }
  const change = ((now - before) / before) * 100;
  const rounded = Math.round(change);
  if (rounded === 0) return <Text style={[s.delta, { color: MUTE }]}>No change vs last month</Text>;
  return (
    <Text style={[s.delta, { color: rounded > 0 ? UP : DOWN }]}>
      {rounded > 0 ? "+" : ""}
      {rounded}% vs last month
    </Text>
  );
}

function Tile({ label, value, now, before }: { label: string; value: string; now?: number; before?: number }) {
  return (
    <View style={s.tile} wrap={false}>
      <Text style={s.tileLabel}>{label}</Text>
      <Text style={s.tileValue}>{value}</Text>
      {now !== undefined && <Delta now={now} before={before} />}
    </View>
  );
}

function Section({ title }: { title: string }) {
  return (
    <Text style={s.section} minPresenceAhead={80}>
      {title}
    </Text>
  );
}

type Col = { head: string; flex: number; right?: boolean };

function Table({ title, cols, rows, empty }: { title: string; cols: Col[]; rows: string[][]; empty: string }) {
  return (
    <View wrap={false} style={{ marginBottom: 10 }}>
      <Text style={s.sub}>{title}</Text>
      <View style={s.th}>
        {cols.map((c) => (
          <Text key={c.head} style={[s.thText, { flex: c.flex }, c.right ? s.right : {}]}>
            {c.head}
          </Text>
        ))}
      </View>
      {rows.length === 0 ? (
        <Text style={[s.empty, { paddingHorizontal: 7 }]}>{empty}</Text>
      ) : (
        rows.map((r, i) => (
          <View key={i} style={[s.tr, i % 2 ? s.trAlt : {}]} wrap={false}>
            {r.map((cell, j) => (
              <Text key={j} style={[s.td, { flex: cols[j].flex }, cols[j].right ? s.right : {}]}>
                {cell}
              </Text>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

const productRows = (lines: ProductLine[]) =>
  lines.map((l) => [l.product, l.size, num(l.units), rands(l.revenue)]);

const PRODUCT_COLS: Col[] = [
  { head: "Product", flex: 3 },
  { head: "Size", flex: 1.4 },
  { head: "Units", flex: 1, right: true },
  { head: "Revenue", flex: 1.6, right: true },
];

const shareRows = (rows: Row[], total: number) =>
  rows.map((r) => [r.label || "(not set)", num(r.value), total ? `${Math.round((r.value / total) * 100)}%` : "-"]);

const SHARE_COLS = (head: string): Col[] => [
  { head, flex: 3 },
  { head: "Sessions", flex: 1.2, right: true },
  { head: "Share", flex: 1, right: true },
];

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Johannesburg" });

/* ------------------------------------------------------------ document */

export function MonthlyReport({ data }: { data: ReportData }) {
  const { period, shop, previous: prev, traffic, previousTraffic, summary } = data;
  const prevT = previousTraffic.available ? previousTraffic : undefined;
  const lastDay = Number(period.endDate.slice(8));

  return (
    <Document title={`Rehoboth Herbal Co. — ${period.label} report`} author="Ember Automations">
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          {LOGO ? <Image src={LOGO} style={s.logo} /> : <View />}
          <View>
            <Text style={s.coverTitle}>Monthly Report · {period.label}</Text>
            <Text style={s.coverSub}>
              1–{lastDay} {period.label} (SAST) · generated {longDate(data.generatedAt)}
            </Text>
          </View>
        </View>

        {summary && (
          <View style={s.summary} wrap={false}>
            <Text style={[s.sub, { marginTop: 0 }]}>The month in brief</Text>
            <Text style={s.summaryHead}>{summary.headline}</Text>
            {summary.findings.map((f, i) => (
              <View key={i} style={s.finding}>
                <Text style={s.findingWhat}>{f.what}</Text>
                {f.why && <Text style={s.findingText}>Why it matters: {f.why}</Text>}
                {f.action && <Text style={s.findingText}>Suggested next step: {f.action}</Text>}
              </View>
            ))}
          </View>
        )}

        <Section title="Sales" />
        <View style={s.tiles}>
          <Tile label="Paid orders" value={num(shop.paidOrders)} now={shop.paidOrders} before={prev.paidOrders} />
          <Tile label="Revenue" value={rands(shop.revenue)} now={shop.revenue} before={prev.revenue} />
          <Tile label="Average order" value={rands(shop.averageOrder)} now={shop.averageOrder} before={prev.averageOrder} />
          <Tile label="Delivered / collected" value={`${shop.delivered} / ${shop.collected}`} />
        </View>
        <Text style={s.note}>
          {shop.unpaidCheckouts === 0
            ? "Every checkout started this month was paid."
            : `${shop.unpaidCheckouts} checkout${shop.unpaidCheckouts === 1 ? "" : "s"} started but not paid.`}
        </Text>

        <Section title="Products" />
        <View style={s.cols}>
          <View style={s.col}>
            <Table title="Top products by revenue" cols={PRODUCT_COLS} rows={productRows(shop.topByRevenue)} empty="No sales this month." />
          </View>
          <View style={s.col}>
            <Table title="Top products by units" cols={PRODUCT_COLS} rows={productRows(shop.topByUnits)} empty="No sales this month." />
          </View>
        </View>

        <Section title="Customers & enquiries" />
        <View style={s.tiles}>
          <Tile label="New customer accounts" value={num(shop.newCustomers)} now={shop.newCustomers} before={prev.newCustomers} />
          <Tile label="Contact messages" value={num(shop.messages)} now={shop.messages} before={prev.messages} />
          <Tile
            label="Stockist applications"
            value={num(shop.stockistApplications)}
            now={shop.stockistApplications}
            before={prev.stockistApplications}
          />
          <Tile label="Stockists approved" value={num(shop.stockistsApproved)} />
        </View>

        <Section title="Latest news" />
        {shop.articles.length === 0 ? (
          <Text style={s.note}>No articles were published this month. {shop.articlesLive} live on the site in total.</Text>
        ) : (
          <Table
              title={`Published this month (${shop.articlesLive} live in total)`}
              cols={[
                { head: "Article", flex: 4 },
                { head: "Published", flex: 1.4, right: true },
              ]}
              rows={shop.articles.map((a) => [a.title, longDate(a.publishedAt)])}
              empty=""
            />
        )}

        <Section title="Website traffic" />
        {!traffic.available ? (
          <Text style={s.note}>Website traffic was unavailable when this report was generated.</Text>
        ) : (
          <>
            {traffic.trackingStarted && (
              <Text style={[s.note, { marginBottom: 8 }]}>
                Tracking started {longDate(traffic.trackingStarted)}; figures cover {Number(traffic.trackingStarted.slice(8))}–
                {lastDay} {period.label}.
              </Text>
            )}
            <View style={s.tiles}>
              <Tile label="Visits (sessions)" value={num(traffic.sessions)} now={traffic.sessions} before={prevT?.sessions} />
              <Tile label="Visitors" value={num(traffic.users)} now={traffic.users} before={prevT?.users} />
              <Tile label="New visitors" value={num(traffic.newUsers)} now={traffic.newUsers} before={prevT?.newUsers} />
              <Tile label="Page views" value={num(traffic.pageViews)} now={traffic.pageViews} before={prevT?.pageViews} />
              <Tile
                label="Engaged visits"
                value={pct(traffic.engagementRate)}
                now={traffic.engagementRate}
                before={prevT?.engagementRate}
              />
            </View>
            <Table
              title="Most-viewed pages"
              cols={[
                { head: "Page", flex: 5 },
                { head: "Views", flex: 1, right: true },
              ]}
              rows={traffic.pages.map((p) => [p.label, num(p.value)])}
              empty="No page views recorded."
            />
            <View style={s.cols} wrap={false}>
              <View style={s.col}>
                <Table
                  title="Where visitors came from"
                  cols={SHARE_COLS("Channel")}
                  rows={shareRows(traffic.channels, traffic.sessions)}
                  empty="No data."
                />
              </View>
              <View style={s.col}>
                <Table
                  title="Top countries"
                  cols={SHARE_COLS("Country")}
                  rows={shareRows(traffic.countries, traffic.sessions)}
                  empty="No data."
                />
              </View>
              <View style={s.col}>
                <Table title="Devices" cols={SHARE_COLS("Device")} rows={shareRows(traffic.devices, traffic.sessions)} empty="No data." />
              </View>
            </View>
          </>
        )}

        <View style={s.footer} fixed>
          <Text>Rehoboth Herbal Co. · {period.label} report · prepared by Ember Automations</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
