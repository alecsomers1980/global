import type { StaffSession } from "@/lib/types";

function getAirtableEnv() {
  const API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!API_KEY || !BASE_ID) {
    throw new Error("AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set");
  }
  return { API_KEY, BASE_ID };
}

export async function getUserByEmail(
  email: string
): Promise<StaffSession | null> {
  const { API_KEY, BASE_ID } = getAirtableEnv();
  const safeEmail = email.toLowerCase().replace(/'/g, "\\'");
  const formula = `AND(LOWER({Email})='${safeEmail}',{Active}=1)`;
  const encodedFormula = encodeURIComponent(formula);
  const tableName = encodeURIComponent("Users");

  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableName}?filterByFormula=${encodedFormula}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable request failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  const records = json.records as any[] | undefined;

  if (!records || records.length === 0) return null;

  const record = records[0];
  const fields = record.fields ?? {};

  return {
    id: record.id,
    name: fields["Name"] || email,
    role: fields["Role"] || "",
  };
}