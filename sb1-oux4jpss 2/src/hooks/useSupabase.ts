import { useState, useEffect } from 'react';
import { supabase, migrateLocalStorageToSupabase, fetchUserData } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useSupabase() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadData();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Check if we need to migrate local storage data
      const hasLocalData = localStorage.length > 0;
      if (hasLocalData) {
        const { success, error } = await migrateLocalStorageToSupabase();
        if (success) {
          toast.success('Data migrated successfully');
        } else {
          console.error('Migration error:', error);
          toast.error('Error migrating data');
        }
      }

      // Fetch all user data
      const userData = await fetchUserData();
      if (userData) {
        setData(userData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setData(null);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
  };

  return {
    session,
    loading,
    data,
    signIn,
    signUp,
    signOut,
    refreshData: loadData
  };
}