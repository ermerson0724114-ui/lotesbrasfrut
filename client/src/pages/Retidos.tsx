import { Layout } from "@/components/Layout";
import { useBatches } from "@/hooks/use-batches";
import { BatchCard } from "@/components/BatchCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Retidos() {
  const { data: batches, isLoading } = useBatches({ status: "RETIDO" });

  const exportData = () => {
    window.open('/api/public/export?status=RETIDO&format=csv', '_blank');
  };

  return (
    <Layout title="Lotes Retidos">
      <div className="space-y-4">
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={exportData} className="rounded-lg font-medium text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100">
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
        </div>

        <div className="space-y-4 pb-4">
          {isLoading ? (
            [1,2].map(i => <Skeleton key={i} className="h-40 rounded-2xl w-full" />)
          ) : batches?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-rose-50/50 rounded-2xl border border-dashed border-rose-200">
              <AlertCircle className="w-10 h-10 text-rose-400 mb-2" />
              <p className="text-rose-700/70 font-medium">Nenhum lote retido</p>
            </div>
          ) : (
            batches?.map((batch: any) => (
              <div key={batch.id} className="relative">
                <BatchCard batch={batch} />
                {/* Expand recommendation inside or under card */}
                {batch.samples?.find((s:any) => s.recommendation)?.recommendation && (
                  <div className="mt-2 p-3 bg-rose-50 rounded-xl border border-rose-100 text-sm">
                    <p className="font-bold text-rose-800 text-xs uppercase mb-1">Ação Requerida:</p>
                    <p className="text-rose-900">{batch.samples.find((s:any) => s.recommendation).recommendation}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
