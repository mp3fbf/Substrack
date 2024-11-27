"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import type { Subscription } from "@/types/database";

type FormData = Omit<Subscription, "id" | "user_id" | "created_at" | "updated_at">;

export function SubscriptionForm({ userId, onSuccess }: { userId: string; onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const { addSubscription } = useSubscriptions();
  
  const form = useForm<FormData>({
    defaultValues: {
      service_name: "",
      cost: 0,
      currency: "USD",
      billing_frequency: "monthly",
      next_billing_date: "",
      category: "",
      notes: "",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      setLoading(true);
      await addSubscription({
        ...data,
        user_id: userId,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding subscription:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="service_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="Netflix, Spotify, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem className="w-32">
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="billing_frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="next_billing_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Billing Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Subscription"}
        </Button>
      </form>
    </Form>
  );
} 