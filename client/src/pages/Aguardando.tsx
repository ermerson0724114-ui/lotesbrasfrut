import { Layout } from "@/components/Layout";
import { useBatches } from "@/hooks/use-batches";
import { BatchCard } from "@/components/BatchCard";
import { useAuth } from "@/hooks/use-auth";
import { CreateBatchModal } from "@/components/CreateBatchModal";
import { RegisterSampleModal } from "@/components/RegisterSampleModal";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Aguardando() {
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  const { data: batches, isLoading } = useBatches({ status: "AGUARDANDO", search });
  
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  return (
    <Layout title="Aguardando Amostras">
      <div className="space-y-4">
        
        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar código..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card rounded-xl h-10 shadow-sm border-border/50 focus-visible:ring-primary/20"
            />
          </div>
          {role === "PRODUCAO" && <CreateBatchModal />}
        </div>

        {/* List */}
        <div className="space-y-4 pb-4">
          {isLoading ? (
            [1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl w-full" />)
          ) : batches?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-secondary/30 rounded-2xl border border-dashed border-border/60">
              <AlertCircle className="w-10 h-10 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground font-medium">Nenhum lote aguardando</p>
            </div>
          ) : (
            batches?.map((batch: any) => (
              <BatchCard 
                key={batch.id} 
                batch={batch} 
                showAction={role === "QUALIDADE"}
                actionLabel="Amostra"
                onClickAction={() => setSelectedBatch(batch)}
              />
            ))
          )}
        </div>
      </div>

      {selectedBatch && (
        <RegisterSampleModal 
          batch={selectedBatch} 
          open={!!selectedBatch} 
          onClose={() => setSelectedBatch(null)} 
        />
      )}
    </Layout>
  );
}
