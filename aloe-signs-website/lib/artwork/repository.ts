import { sql } from '@vercel/postgres';
import crypto from 'crypto';

const UNDOWNLOADED_RETENTION_DAYS = 30;
const DOWNLOADED_RETENTION_DAYS = 7;

export interface SubmissionInput {
  companyName: string | null;
  contactPerson: string;
  contactNumber: string;
  email: string | null;
  description: string | null;
  ipHash: string;
}

export interface FileRecord {
  storagePath: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
}

export interface FileRow {
  id: string;
  storage_path: string;
  original_name: string;
  size_bytes: number;
  mime_type: string;
}

export interface SubmissionRow {
  id: string;
  reference: string;
  company_name: string | null;
  contact_person: string;
  contact_number: string;
  email: string | null;
  description: string | null;
  status: string;
  created_at: string;
  viewed_at: string | null;
  downloaded_at: string | null;
  delete_after: string;
  notified_at: string | null;
  files: FileRow[];
}

type SubmissionRowWithoutFiles = Omit<SubmissionRow, 'files'>;

interface FileRowWithSubmissionId extends FileRow {
  submission_id: string;
}

export function makeReference(): string {
  return 'AW-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

async function hydrate(rows: SubmissionRowWithoutFiles[]): Promise<SubmissionRow[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);

  const filesResult = await sql.query<FileRowWithSubmissionId>(
    `SELECT id, storage_path, original_name, size_bytes, mime_type, submission_id
     FROM artwork_submission_files
     WHERE submission_id = ANY($1::uuid[])`,
    [ids]
  );

  const filesBySubmission = new Map<string, FileRow[]>();

  for (const file of filesResult.rows) {
    const { submission_id, ...fileRow } = file;
    const existing = filesBySubmission.get(submission_id) ?? [];
    existing.push(fileRow);
    filesBySubmission.set(submission_id, existing);
  }

  return rows.map((row) => ({
    ...row,
    files: filesBySubmission.get(row.id) ?? [],
  }));
}

export async function createSubmission(
  input: SubmissionInput
): Promise<{ id: string; reference: string }> {
  const result = await sql.query<{ id: string; reference: string }>(
    `INSERT INTO artwork_submissions
       (reference, company_name, contact_person, contact_number, email, description, ip_hash, status, delete_after)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_upload', NOW() + INTERVAL '${UNDOWNLOADED_RETENTION_DAYS} days')
     RETURNING id, reference`,
    [
      makeReference(),
      input.companyName,
      input.contactPerson,
      input.contactNumber,
      input.email,
      input.description,
      input.ipHash,
    ]
  );

  return result.rows[0];
}

export async function attachFiles(
  submissionId: string,
  files: FileRecord[]
): Promise<void> {
  for (const file of files) {
    await sql.query(
      `INSERT INTO artwork_submission_files
         (submission_id, storage_path, original_name, size_bytes, mime_type)
       VALUES ($1, $2, $3, $4, $5)`,
      [submissionId, file.storagePath, file.originalName, file.sizeBytes, file.mimeType]
    );
  }
}

export async function markReceived(id: string): Promise<void> {
  await sql.query(
    `UPDATE artwork_submissions SET status = 'received' WHERE id = $1`,
    [id]
  );
}

export async function markNotified(id: string): Promise<void> {
  await sql.query(
    `UPDATE artwork_submissions SET notified_at = NOW() WHERE id = $1`,
    [id]
  );
}

export async function markViewed(id: string): Promise<void> {
  await sql.query(
    `UPDATE artwork_submissions SET viewed_at = COALESCE(viewed_at, NOW()) WHERE id = $1`,
    [id]
  );
}

export async function markDownloaded(id: string): Promise<void> {
  await sql.query(
    `UPDATE artwork_submissions
     SET downloaded_at = NOW(),
         delete_after = NOW() + INTERVAL '${DOWNLOADED_RETENTION_DAYS} days'
     WHERE id = $1 AND downloaded_at IS NULL`,
    [id]
  );
}

export async function countRecentByIpHash(
  ipHash: string,
  withinMinutes: number
): Promise<number> {
  const result = await sql.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM artwork_submissions
     WHERE ip_hash = $1
       AND created_at > NOW() - ($2 || ' minutes')::interval`,
    [ipHash, withinMinutes]
  );

  return result.rows[0].count;
}

export async function countUnread(): Promise<number> {
  const result = await sql.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM artwork_submissions
     WHERE status = 'received' AND viewed_at IS NULL`
  );

  return result.rows[0].count;
}

export async function listSubmissions(): Promise<SubmissionRow[]> {
  const result = await sql.query<SubmissionRowWithoutFiles>(
    `SELECT id, reference, company_name, contact_person, contact_number, email,
            description, status, created_at, viewed_at, downloaded_at, delete_after, notified_at
     FROM artwork_submissions
     WHERE status = 'received'
     ORDER BY created_at DESC`
  );

  return hydrate(result.rows);
}

export async function getSubmission(id: string): Promise<SubmissionRow | null> {
  const result = await sql.query<SubmissionRowWithoutFiles>(
    `SELECT id, reference, company_name, contact_person, contact_number, email,
            description, status, created_at, viewed_at, downloaded_at, delete_after, notified_at
     FROM artwork_submissions
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const [submission] = await hydrate(result.rows);
  return submission;
}

export async function findExpired(): Promise<
  { id: string; storage_paths: string[] }[]
> {
  const result = await sql.query<{ id: string; storage_paths: string[] }>(
    `SELECT s.id,
            COALESCE(
              ARRAY_AGG(f.storage_path) FILTER (WHERE f.storage_path IS NOT NULL),
              ARRAY[]::text[]
            ) AS storage_paths
     FROM artwork_submissions s
     LEFT JOIN artwork_submission_files f ON f.submission_id = s.id
     WHERE s.delete_after < NOW()
        OR (s.status = 'pending_upload' AND s.created_at < NOW() - INTERVAL '24 hours')
     GROUP BY s.id`
  );

  return result.rows;
}

export async function deleteSubmissions(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  await sql.query(
    `DELETE FROM artwork_submissions WHERE id = ANY($1::uuid[])`,
    [ids]
  );
}

export async function findUnnotified(): Promise<SubmissionRow[]> {
  const result = await sql.query<SubmissionRowWithoutFiles>(
    `SELECT id, reference, company_name, contact_person, contact_number, email,
            description, status, created_at, viewed_at, downloaded_at, delete_after, notified_at
     FROM artwork_submissions
     WHERE status = 'received' AND notified_at IS NULL`
  );

  return hydrate(result.rows);
}

