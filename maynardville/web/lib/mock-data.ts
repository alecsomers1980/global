// PREVIEW SCAFFOLDING — sample data shown when AIRTABLE_API_KEY is unset.
// Remove (and the isPreview() hooks in lib/comps.ts, lib/dashboard.ts, lib/reporting.ts) before go-live.
import type { CompRequestRow } from "./types";

export function isPreview(): boolean {
  return !process.env.AIRTABLE_API_KEY;
}

export const mockCompRequestRows: CompRequestRow[] = [
  {
    id: "rec_mock_01",
    guestName: "Lara",
    guestSurname: "Botha",
    guestEmail: "lara.b@example.com",
    performance: "Twelfth Night — 14 Feb",
    category: "Media",
    requester: "Jaco van Rensburg",
    totalSeats: 2,
    houseSeats: false,
    notes: "Article for Die Burger",
    status: "REQUEST",
    seatNumbers: "",
    ticketReference: "",
    approvedAt: "",
    submittedAt: "2025-07-10T09:15:00.000Z",
  },
  {
    id: "rec_mock_02",
    guestName: "Mark",
    guestSurname: "Steyn",
    guestEmail: "mark@example.com",
    performance: "Twelfth Night — 15 Feb",
    category: "VIP",
    requester: "Sascha Polkey",
    totalSeats: 1,
    houseSeats: false,
    notes: "",
    status: "REQUEST",
    seatNumbers: "",
    ticketReference: "",
    approvedAt: "",
    submittedAt: "2025-07-11T11:00:00.000Z",
  },
  {
    id: "rec_mock_03",
    guestName: "Michelle",
    guestSurname: "Barnard",
    guestEmail: "michelle.b@example.com",
    performance: "Twelfth Night — 21 Feb",
    category: "Partner / Sponsor",
    requester: "Kerry Burns",
    totalSeats: 3,
    houseSeats: true,
    notes: "Standard sponsor hospitality",
    status: "REQUEST",
    seatNumbers: "",
    ticketReference: "",
    approvedAt: "",
    submittedAt: "2025-07-11T15:30:00.000Z",
  },
  {
    id: "rec_mock_04",
    guestName: "Thabo",
    guestSurname: "Molefe",
    guestEmail: "thabo.m@example.com",
    performance: "Romeo & Juliet — 28 Feb",
    category: "Competition Winners",
    requester: "Alyssa van der Schyff",
    totalSeats: 2,
    houseSeats: false,
    notes: "",
    status: "TO ISSUE",
    seatNumbers: "",
    ticketReference: "",
    approvedAt: "2025-07-12T08:10:00.000Z",
    submittedAt: "2025-07-12T07:45:00.000Z",
  },
  {
    id: "rec_mock_05",
    guestName: "Johan",
    guestSurname: "Vos",
    guestEmail: "johan.v@example.com",
    performance: "Twelfth Night — 21 Feb",
    category: "Media",
    requester: "Wessel Odendaal",
    totalSeats: 1,
    houseSeats: false,
    notes: "Volksblad review",
    status: "TO ISSUE",
    seatNumbers: "",
    ticketReference: "",
    approvedAt: "2025-07-13T09:00:00.000Z",
    submittedAt: "2025-07-12T16:20:00.000Z",
  },
  {
    id: "rec_mock_06",
    guestName: "Samantha",
    guestSurname: "Klopper",
    guestEmail: "samk@example.com",
    performance: "Romeo & Juliet — 28 Feb",
    category: "VIP",
    requester: "Rauen Venter",
    totalSeats: 2,
    houseSeats: true,
    notes: "VIP hospitality",
    status: "ISSUED",
    seatNumbers: "A01, A02",
    ticketReference: "QKT-10432",
    approvedAt: "2025-07-13T10:30:00.000Z",
    submittedAt: "2025-07-13T10:00:00.000Z",
  },
  {
    id: "rec_mock_07",
    guestName: "Paul",
    guestSurname: "van der Westhuizen",
    guestEmail: "paul.w@example.com",
    performance: "Twelfth Night — 14 Feb",
    category: "Cast / Crew / Team Comp",
    requester: "Jaco van Rensburg",
    totalSeats: 4,
    houseSeats: false,
    notes: "",
    status: "ISSUED",
    seatNumbers: "C04, C05, C06, C07",
    ticketReference: "QKT-10433",
    approvedAt: "2025-07-14T09:15:00.000Z",
    submittedAt: "2025-07-13T14:40:00.000Z",
  },
  {
    id: "rec_mock_08",
    guestName: "Elna",
    guestSurname: "Smit",
    guestEmail: "elna.s@example.com",
    performance: "Twelfth Night — 15 Feb",
    category: "Partner / Sponsor",
    requester: "Kerry Burns",
    totalSeats: 6,
    houseSeats: false,
    notes: "Dinner and show",
    status: "ISSUED",
    seatNumbers: "D12, D13, D14, D15, D16, D17",
    ticketReference: "QKT-10434",
    approvedAt: "2025-07-15T07:50:00.000Z",
    submittedAt: "2025-07-14T11:00:00.000Z",
  },
  {
    id: "rec_mock_09",
    guestName: "Pieter",
    guestSurname: "Du Toit",
    guestEmail: "pieter.dt@example.com",
    performance: "Twelfth Night — 21 Feb",
    category: "Media",
    requester: "Sascha Polkey",
    totalSeats: 1,
    houseSeats: false,
    notes: "Cape Times photographer",
    status: "ISSUED",
    seatNumbers: "",
    ticketReference: "",
    approvedAt: "2025-07-15T12:30:00.000Z",
    submittedAt: "2025-07-14T16:10:00.000Z",
  },
  {
    id: "rec_mock_10",
    guestName: "Megan",
    guestSurname: "Odendaal",
    guestEmail: "megano@example.com",
    performance: "Romeo & Juliet — 28 Feb",
    category: "Friends / Family",
    requester: "Wessel Odendaal",
    totalSeats: 2,
    houseSeats: false,
    notes: "Family of cast",
    status: "ISSUED",
    seatNumbers: "E01, E02",
    ticketReference: "QKT-10435",
    approvedAt: "2025-07-16T08:45:00.000Z",
    submittedAt: "2025-07-15T09:30:00.000Z",
  },
  {
    id: "rec_mock_11",
    guestName: "Busisiwe",
    guestSurname: "Nkosi",
    guestEmail: "busi.n@example.com",
    performance: "Twelfth Night — 14 Feb",
    category: "Competition Winners",
    requester: "Alyssa van der Schyff",
    totalSeats: 2,
    houseSeats: false,
    notes: "Declined – duplicate entry",
    status: "DECLINED",
    seatNumbers: "",
    ticketReference: "",
    approvedAt: "",
    submittedAt: "2025-07-15T11:20:00.000Z",
  },
  {
    id: "rec_mock_12",
    guestName: "Lungile",
    guestSurname: "Zulu",
    guestEmail: "lungile.z@example.com",
    performance: "Twelfth Night — 15 Feb",
    category: "Cast / Crew / Team Comp",
    requester: "Rauen Venter",
    totalSeats: 3,
    houseSeats: false,
    notes: "Team comp",
    status: "ISSUED",
    seatNumbers: "B10, B11, B12",
    ticketReference: "QKT-10436",
    approvedAt: "2025-07-16T13:00:00.000Z",
    submittedAt: "2025-07-16T12:15:00.000Z",
  },
];

export const mockSalesSummary: {
  performance: string;
  tickets: number;
  gross: number;
}[] = [
  {
    performance: "Romeo & Juliet — 28 Feb",
    tickets: 700,
    gross: 154000,
  },
  {
    performance: "Twelfth Night — 21 Feb",
    tickets: 420,
    gross: 92400,
  },
  {
    performance: "Twelfth Night — 14 Feb",
    tickets: 350,
    gross: 77000,
  },
  {
    performance: "Twelfth Night — 15 Feb",
    tickets: 280,
    gross: 61600,
  },
];

export const mockSalesVsCompReport: {
  rows: {
    performanceId: string;
    performance: string;
    date: string;
    capacity: number;
    ticketsSold: number;
    gross: number;
    compsIssued: number;
    compsPipeline: number;
    totalAllocated: number;
    utilisationPct: number | null;
    remaining: number | null;
  }[];
  totals: {
    performanceId: string;
    performance: string;
    date: string;
    capacity: number;
    ticketsSold: number;
    gross: number;
    compsIssued: number;
    compsPipeline: number;
    totalAllocated: number;
    utilisationPct: number | null;
    remaining: number | null;
  };
} = {
  rows: [
    {
      performanceId: "tn_feb14",
      performance: "Twelfth Night — 14 Feb",
      date: "2026-02-14",
      capacity: 720,
      ticketsSold: 350,
      gross: 77000,
      compsIssued: 5,
      compsPipeline: 2,
      totalAllocated: 355,
      utilisationPct: Math.round((355 / 720) * 100),
      remaining: 720 - 355,
    },
    {
      performanceId: "tn_feb15",
      performance: "Twelfth Night — 15 Feb",
      date: "2026-02-15",
      capacity: 720,
      ticketsSold: 280,
      gross: 61600,
      compsIssued: 8,
      compsPipeline: 3,
      totalAllocated: 288,
      utilisationPct: Math.round((288 / 720) * 100),
      remaining: 720 - 288,
    },
    {
      performanceId: "tn_feb21",
      performance: "Twelfth Night — 21 Feb",
      date: "2026-02-21",
      capacity: 720,
      ticketsSold: 420,
      gross: 92400,
      compsIssued: 12,
      compsPipeline: 7,
      totalAllocated: 432,
      utilisationPct: Math.round((432 / 720) * 100),
      remaining: 720 - 432,
    },
    {
      performanceId: "rj_feb28",
      performance: "Romeo & Juliet — 28 Feb",
      date: "2026-02-28",
      capacity: 720,
      ticketsSold: 700,
      gross: 154000,
      compsIssued: 30,
      compsPipeline: 10,
      totalAllocated: 730,
      utilisationPct: Math.round((730 / 720) * 100),
      remaining: 720 - 730,
    },
  ],
  totals: {
    performanceId: "TOTAL",
    performance: "Total",
    date: "",
    capacity: 720 * 4, // 2880
    ticketsSold: 350 + 280 + 420 + 700, // 1750
    gross: 77000 + 61600 + 92400 + 154000, // 385000
    compsIssued: 5 + 8 + 12 + 30, // 55
    compsPipeline: 2 + 3 + 7 + 10, // 22
    totalAllocated: (350 + 280 + 420 + 700) + (5 + 8 + 12 + 30), // 1805
    utilisationPct: Math.round(
      ((350 + 280 + 420 + 700 + 5 + 8 + 12 + 30) / (720 * 4)) * 100
    ), // 63
    remaining: 720 * 4 - (350 + 280 + 420 + 700 + 5 + 8 + 12 + 30), // 1075
  },
};