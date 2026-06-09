// Usage: node scripts/hash-password.mjs "mypassword"
// Prints a bcrypt hash to paste into ADMIN_PASSWORD_HASH.
import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw) {
  console.error("Usage: node scripts/hash-password.mjs \"yourpassword\"");
  process.exit(1);
}
console.log(bcrypt.hashSync(pw, 10));
