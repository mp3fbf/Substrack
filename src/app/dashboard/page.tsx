import { auth } from "@clerk/nextjs/server";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { SubscriptionList } from "@/components/SubscriptionList";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Subscription</h2>
          <SubscriptionForm userId={userId} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Subscriptions</h2>
          <SubscriptionList userId={userId} />
        </div>
      </div>
    </div>
  );
} 