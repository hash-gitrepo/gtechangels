/**
 * FR-02: angel signups must be verified against the GTECH member register
 * before activation; non-members are rejected with a message to contact the
 * Secretariat. The register itself lives outside this platform (coordination
 * with the Secretariat / Mathson per PRD Section 9) — wire this up to that
 * source (a shared sheet export, an API, or an admin-maintained allowlist
 * table) before launch. Defaulting to `true` so the signup flow is usable
 * end-to-end in development.
 */
export async function isVerifiedGtechMember(_email: string, _companyName: string): Promise<boolean> {
  return true;
}
