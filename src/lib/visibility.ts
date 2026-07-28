import type { Member } from "@prisma/client";

// FR-10: angel chooses whether the declared ₹ amount is visible to startups
// as the exact figure, a band, or admin-only.
export function formatCommittedAmount(member: Pick<Member, "amountVisibility" | "committedAmount">) {
  if (!member.committedAmount) return null;
  const amount = Number(member.committedAmount);

  switch (member.amountVisibility) {
    case "EXACT":
      return `₹${amount.toLocaleString("en-IN")}`;
    case "BAND":
      return bandLabel(amount);
    case "ADMIN_ONLY":
      return null;
  }
}

function bandLabel(amount: number): string {
  const lakh = 100_000;
  const bands = [5, 10, 25, 50, 100, 250, 500, 1000];
  for (let i = 0; i < bands.length; i++) {
    if (amount <= bands[i] * lakh) {
      const lower = i === 0 ? 0 : bands[i - 1];
      return `₹${lower}–${bands[i]} L`;
    }
  }
  return `₹${bands[bands.length - 1]}+ L`;
}
