import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbMarket {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  yes_price: number;
  no_price: number;
  yes_pool: number;
  no_pool: number;
  total_volume: number;
  end_time: string | null;
  is_live: boolean;
  resolved: boolean;
  resolved_outcome: string | null;
  oracle_sources: any;
  created_at: string;
}

export function useSupabaseMarkets() {
  const [markets, setMarkets] = useState<DbMarket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarkets = useCallback(async () => {
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setMarkets(data as DbMarket[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMarkets();

    const channel = supabase
      .channel("markets-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "markets" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setMarkets((prev) =>
              prev.map((m) =>
                m.id === (payload.new as DbMarket).id
                  ? (payload.new as DbMarket)
                  : m
              )
            );
          } else {
            fetchMarkets();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMarkets]);

  return { markets, loading };
}

export function useSupabaseMarket(id: string | undefined) {
  const [market, setMarket] = useState<DbMarket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("markets")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setMarket(data as DbMarket);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel(`market-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "markets", filter: `id=eq.${id}` },
        (payload) => {
          setMarket(payload.new as DbMarket);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return { market, loading };
}
