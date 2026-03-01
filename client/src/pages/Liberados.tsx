import { Layout } from "@/components/Layout";
import { useBatches } from "@/hooks/use-batches";
import { BatchCard } from "@/components/BatchCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Liberados() {
  const { data: batches, isLoading } = useBatches({ status: "LIBERADO" });

  const exportData = () => {
    window.open('/api/public/export?status=LIBERADO&format=csv', '_blank');
  };

  return (
    <Layout title="Lotes Liberados">
      <div className="space-y-4">
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={exportData} className="rounded-lg font-medium text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
        </div>

        <div className="space-y-4 pb-4">
          {isLoading ? (
            [1,2].map(i => <Skeleton key={i} className="h-40 rounded-2xl w-full" />)
          ) : batches?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200">
              <AlertCircle className="w-10 h-10 text-emerald-400 mb-2" />
              <p className="text-emerald-700/70 font-medium">Nenhum lote liberado</p>
            </div>
          ) : (
            batches?.map((batch: any) => (
              <BatchCard key={batch.id} batch={batch} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
