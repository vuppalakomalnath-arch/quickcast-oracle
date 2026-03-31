import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbBet {
  id: string;
  wallet_address: string;
  market_id: string;
  side: string;
  amount: number;
  price: number;
  claimed: boolean;
  created_at: string;
}

export function useUserBets(walletAddress: string | null) {
  const [bets, setBets] = useState<DbBet[]>([]);

  const fetchBets = useCallback(async () => {
    if (!walletAddress) {
      setBets([]);
      return;
    }
    const { data } = await supabase
      .from("bets")
      .select("*")
      .eq("wallet_address", walletAddress)
      .order("created_at", { ascending: false });
    if (data) setBets(data as DbBet[]);
  }, [walletAddress]);

  useEffect(() => {
    fetchBets();

    if (!walletAddress) return;

    const channel = supabase
      .channel(`bets-${walletAddress}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bets", filter: `wallet_address=eq.${walletAddress}` },
        () => fetchBets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletAddress, fetchBets]);

  return { bets, refetchBets: fetchBets };
}

export function useAllBets() {
  const [bets, setBets] = useState<DbBet[]>([]);

  const fetchBets = useCallback(async () => {
    const { data } = await supabase
      .from("bets")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBets(data as DbBet[]);
  }, []);

  useEffect(() => {
    fetchBets();

    const channel = supabase
      .channel("all-bets-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bets" },
        () => fetchBets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBets]);

  return { bets };
}
