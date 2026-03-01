import { Layout } from "@/components/Layout";
import { useDashboard } from "@/hooks/use-batches";
import { Box, CheckCircle, Clock, AlertTriangle, Activity } from "lucide-react";
import { BatchCard } from "@/components/BatchCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return (
    <Layout title="Dashboard">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl mt-6" />
      </div>
    </Layout>
  );

  if (error) return (
    <Layout title="Dashboard">
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4 opacity-80" />
        <p className="font-semibold text-lg text-foreground">Erro ao carregar dados</p>
        <p className="text-muted-foreground text-sm mt-1">{error.message}</p>
      </div>
    </Layout>
  );

  const stats = [
    { label: "Total Registros", value: data?.total || 0, icon: Box, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Aguardando", value: data?.aguardando || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Liberados", value: data?.liberados || 0, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Retidos", value: data?.retidos || 0, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <Layout title="Visão Geral">
      <div className="space-y-6 delay-100">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col items-start gap-2 hover:shadow-md transition-shadow">
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <h3 className="text-3xl font-display font-bold text-foreground">{stat.value}</h3>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Older Batches Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 mt-8 px-1">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-bold">Lotes Mais Antigos</h2>
          </div>
          
          <div className="space-y-3">
            {data?.oldestWaiting?.length === 0 ? (
              <div className="text-center p-8 bg-secondary/30 rounded-2xl border border-border/50 border-dashed">
                <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum lote aguardando</p>
              </div>
            ) : (
              data?.oldestWaiting?.map((batch: any) => (
                <BatchCard key={batch.id} batch={batch} />
              ))
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
