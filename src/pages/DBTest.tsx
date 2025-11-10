import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

const DBTest = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        console.log("Running database diagnostics...");
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        // Check if we can access the users table
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        console.log("User count:", count, "Count error:", countError);
        
        // Try to select all users (limited)
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(5);
        
        console.log("Users data:", users, "Users error:", usersError);
        
        // If we have a user, try to access their specific record
        let userRecord = null;
        let userRecordError = null;
        if (user?.id) {
          console.log("Checking user record for ID:", user.id);
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          userRecord = data;
          userRecordError = error;
          console.log("User record:", data, "User record error:", error);
        }
        
        // Check storage buckets
        const { data: buckets, error: bucketsError } = await supabase
          .storage
          .listBuckets();
        
        console.log("Buckets:", buckets, "Buckets error:", bucketsError);
        
        setResults({
          session,
          userCount: countError ? 'Error: ' + countError.message : count,
          users: usersError ? 'Error: ' + usersError.message : users,
          userRecord: userRecordError ? 'Error: ' + userRecordError.message : userRecord,
          buckets: bucketsError ? 'Error: ' + bucketsError.message : buckets
        });
      } catch (error) {
        console.error("Diagnostics error:", error);
        setResults({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    runDiagnostics();
  }, [user]);

  if (loading) {
    return <div style={{ padding: '20px', fontFamily: 'monospace' }}>Loading diagnostics...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Database Diagnostics</h1>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
};

export default DBTest;