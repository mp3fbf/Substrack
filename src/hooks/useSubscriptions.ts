import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/types/database';

export function useSubscriptions() {
  const getSubscriptions = useCallback(async (clerkId: string) => {
    // Primeiro, buscar o ID do usuário no Supabase
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();

    if (userError) {
      // Se o usuário não existe, vamos criá-lo
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkId,
          email: 'placeholder@email.com',
          name: 'User'
        })
        .select()
        .single();

      if (createError) throw createError;
      userData = newUser;
    }

    if (!userData) throw new Error('Failed to get or create user');

    // Agora podemos buscar as assinaturas
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userData.id);

    if (error) throw error;
    return data as Subscription[];
  }, []);

  const addSubscription = useCallback(async (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => {
    // Primeiro, buscar o ID do usuário no Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', subscription.user_id)
      .single();

    if (userError) throw userError;

    // Agora criar a assinatura com o ID correto
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        ...subscription,
        user_id: userData.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Subscription;
  }, []);

  return {
    getSubscriptions,
    addSubscription,
  };
} 