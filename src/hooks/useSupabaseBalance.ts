import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DemoBalance {
  algo_balance: number;
  inr_balance: number;
}

export function useSupabaseBalance(walletAddress: string | null) {
  const [balance, setBalance] = useState<DemoBalance>({ algo_balance: 1000, inr_balance: 50000 });
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setBalance({ algo_balance: 1000, inr_balance: 50000 });
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("demo_balances")
      .select("algo_balance, inr_balance")
      .eq("wallet_address", walletAddress)
      .single();
    if (data) {
      setBalance({ algo_balance: Number(data.algo_balance), inr_balance: Number(data.inr_balance) });
    }
    setLoading(false);
  }, [walletAddress]);

  useEffect(() => {
    fetchBalance();

    if (!walletAddress) return;

    const channel = supabase
      .channel(`balance-${walletAddress}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "demo_balances", filter: `wallet_address=eq.${walletAddress}` },
        () => fetchBalance()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletAddress, fetchBalance]);

  return { balance, loading, refetchBalance: fetchBalance };
}
