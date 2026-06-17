export interface Category {
  id: string;
  name: string;
}

export interface Performance {
  id: string;
  label: string;
  date: string;     // ISO date string
  time: string;
  venue: string;
  performanceType: string;
  season: string;
}

export interface Requester {
  id: string;
  name: string;
  email: string;
  role: string;
  allowedCategoryIds: string[]; // IDs of categories they can request for
}

export interface CompRequestInput {
  guestName: string;
  guestSurname: string;
  performanceId: string;       // linked Performance record ID
  categoryId: string;          // linked Category record ID
  guestEmail: string;
  houseSeats: boolean;
  notes: string;
  totalSeats: number;
  requesterId: string;         // linked Requester record ID
}

export interface CompRequestRow {
  id: string;
  guestName: string;
  guestSurname: string;
  guestEmail: string;
  performance: string; // resolved label from Performance
  category: string;    // resolved name from Category
  requester: string;   // resolved name from Requester
  totalSeats: number;
  houseSeats: boolean;
  notes: string;
  status: string;
  seatNumbers: string;
  ticketReference: string;
  approvedAt: string;
  submittedAt: string;
}

export interface StaffSession {
  id: string;
  name: string;
  role: "Admin" | "Box Office" | string;
}