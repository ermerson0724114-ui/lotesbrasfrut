import { Clock, Box, Layers, ArrowRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./ui/button";

interface BatchCardProps {
  batch: any;
  onClickAction?: () => void;
  actionLabel?: string;
  showAction?: boolean;
}

export function BatchCard({ batch, onClickAction, actionLabel, showAction }: BatchCardProps) {
  // Helpers to safely render A1-A4 sample statuses
  const renderSampleIndicator = (num: number) => {
    const sample = batch.samples?.find((s: any) => s.sampleNumber === num);
    if (!sample) return <div className="w-5 h-5 rounded-full border-2 border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground font-bold">{num}</div>;
    
    const isOk = sample.result === "APROVADO";
    return (
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold shadow-sm ${isOk ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
        {isOk ? '✓' : '✗'}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-border/60 flex flex-col gap-3 transition-all hover:shadow-md">
      {/* Header: Code & Status */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-lg leading-none">{batch.itemCode}</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
              {batch.groupName || 'Grupo Indef.'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{batch.itemDescription}</p>
        </div>
        <StatusBadge status={batch.status} />
      </div>

      {/* Middle Grid: Lot, Qty, Date */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 bg-secondary/30 rounded-xl p-3">
        <div className="flex items-center gap-2 text-sm">
          <Layers className="w-4 h-4 text-primary/70" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider leading-none">Lote</p>
            <p className="font-semibold text-foreground">{batch.lotCode}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Box className="w-4 h-4 text-primary/70" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider leading-none">Qtd</p>
            <p className="font-semibold text-foreground">{batch.quantityProduced}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm col-span-2">
          <Clock className="w-4 h-4 text-primary/70" />
          <div className="flex justify-between w-full">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider leading-none">Criado em</p>
              <p className="font-semibold text-foreground text-xs">{new Date(batch.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider leading-none">Aguardando</p>
              <p className="font-semibold text-amber-600 text-xs">{batch.daysWaiting || 0} dias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Samples & Actions */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amostras</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map(num => (
              <div key={num}>{renderSampleIndicator(num)}</div>
            ))}
          </div>
        </div>
        
        {showAction && onClickAction && (
          <Button 
            size="sm" 
            onClick={onClickAction}
            className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold"
          >
            {actionLabel} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {batch.status === 'AGUARDANDO' && (
        <div className="text-xs font-medium text-center text-primary/80 bg-primary/5 rounded-lg py-1.5 mt-1 border border-primary/10">
          {batch.currentStage}
        </div>
      )}
    </div>
  );
}
