export const ALLOWED_EXTENSIONS = ['.pdf', '.ai', '.eps', '.tiff', '.tif', '.png', '.jpg', '.jpeg', '.svg', '.zip', '.psd'];
export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

export interface ManifestEntry {
  name: string;
  size: number;
  type: string;
}

export interface ValidatedSubmission {
  companyName: string | null;
  contactPerson: string;
  contactNumber: string;
  email: string | null;
  description: string | null;
  files: ManifestEntry[];
}

export function validateSubmission(
  body: unknown
): { ok: true; value: ValidatedSubmission } | { ok: false; error: string } {
  const root: Record<string, unknown> =
    body !== null && typeof body === 'object' ? (body as Record<string, unknown>) : {};

  const contactPerson = typeof root.contactPerson === 'string' ? root.contactPerson.trim() : '';
  if (!contactPerson) {
    return { ok: false, error: 'Contact person is required.' };
  }

  const contactNumber = typeof root.contactNumber === 'string' ? root.contactNumber.trim() : '';
  if (!contactNumber) {
    return { ok: false, error: 'Contact number is required.' };
  }

  const emailRaw = typeof root.email === 'string' ? root.email.trim() : '';
  if (emailRaw !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    return { ok: false, error: 'That email address does not look right.' };
  }
  const email = emailRaw === '' ? null : emailRaw;

  const filesRaw = root.files;
  if (!Array.isArray(filesRaw) || filesRaw.length === 0) {
    return { ok: false, error: 'Please attach at least one file.' };
  }

  if (filesRaw.length > MAX_FILES) {
    return { ok: false, error: `A maximum of ${MAX_FILES} files can be sent at once.` };
  }

  const files: ManifestEntry[] = [];
  let totalSize = 0;

  for (const fileRaw of filesRaw) {
    const file: Record<string, unknown> =
      fileRaw !== null && typeof fileRaw === 'object'
        ? (fileRaw as Record<string, unknown>)
        : {};

    const name = typeof file.name === 'string' ? file.name.trim() : '';
    if (!name) {
      return { ok: false, error: 'One of the files has no name.' };
    }

    const lowerName = name.toLowerCase();
    const dotIndex = lowerName.lastIndexOf('.');
    const extension = dotIndex >= 0 ? lowerName.slice(dotIndex) : '';
    if (ALLOWED_EXTENSIONS.indexOf(extension) === -1) {
      return { ok: false, error: `${name}: that file type is not accepted.` };
    }

    const size = file.size;
    if (typeof size !== 'number' || !(size > 0)) {
      return { ok: false, error: `${name}: file appears to be empty.` };
    }

    if (size > MAX_FILE_BYTES) {
      return { ok: false, error: `${name} is larger than 50 MB.` };
    }

    const typeRaw = typeof file.type === 'string' ? file.type.trim() : '';
    const type = typeRaw === '' ? 'application/octet-stream' : typeRaw;

    files.push({ name, size, type });
    totalSize += size;
  }

  if (totalSize > MAX_TOTAL_BYTES) {
    return { ok: false, error: 'That is more than 200 MB in total. Please send fewer files.' };
  }

  const companyNameRaw = typeof root.companyName === 'string' ? root.companyName.trim() : '';
  const descriptionRaw = typeof root.description === 'string' ? root.description.trim() : '';

  return {
    ok: true,
    value: {
      companyName: companyNameRaw === '' ? null : companyNameRaw,
      contactPerson,
      contactNumber,
      email,
      description: descriptionRaw === '' ? null : descriptionRaw,
      files,
    },
  };
}

