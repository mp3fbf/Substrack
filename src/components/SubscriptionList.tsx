"use client";

import { useEffect, useState } from "react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import type { Subscription } from "@/types/database";

export function SubscriptionList({ userId }: { userId: string }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSubscriptions } = useSubscriptions();

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const data = await getSubscriptions(userId);
        setSubscriptions(data);
      } catch (error) {
        console.error("Error loading subscriptions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptions();
  }, [userId, getSubscriptions]);

  if (loading) return <div>Loading...</div>;
  if (!subscriptions.length) return <div>No subscriptions yet</div>;

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <div
          key={subscription.id}
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{subscription.service_name}</h3>
              <p className="text-sm text-muted-foreground">
                {subscription.billing_frequency} • Next billing: {subscription.next_billing_date}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {subscription.currency} {subscription.cost}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 