export function generateAffiliateCode(firstName: string | null, userId: string): string {
  const namePart = (firstName || "AFF").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5);
  const idPart = userId.replace(/-/g, "").slice(-4).toUpperCase();
  return `${namePart}${idPart}`;
}