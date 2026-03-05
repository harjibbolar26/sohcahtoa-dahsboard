import { cookies } from "next/headers";
import { USER_COOKIE } from "@/lib/auth";
import { mockCard, mockCardTransactions, mockCardFlow } from "@/lib/mock-data";
import HomeClient from "@/components/HomeClient";

/**
 * Dashboard Home — Server Component
 *
 * This is a React Server Component that:
 * - Reads user data from cookies on the server
 * - Passes static mock data (card, card transactions, flows) as props
 * - Delegates interactive features to the HomeClient component
 *
 * Caching: This page uses `revalidate = 60` to simulate
 * caching FX rates data that refreshes every 60 seconds.
 */

export const revalidate = 60;

export default async function DashboardHome() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE)?.value;
  let userName = "User";

  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      userName = user.name;
    } catch {
      // ignore
    }
  }

  return (
    <HomeClient
      userName={userName}
      card={mockCard}
      cardTransactions={mockCardTransactions}
      cardFlow={mockCardFlow}
    />
  );
}
