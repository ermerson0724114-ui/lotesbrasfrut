import { BATCH_STATUS } from "@shared/schema";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  
  if (normalized === "aguardando") {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold badge-aguardando border shadow-sm">Aguardando</span>;
  }
  if (normalized === "liberado") {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold badge-liberado border shadow-sm">Liberado</span>;
  }
  if (normalized === "retido") {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold badge-retido border shadow-sm">Retido</span>;
  }
  
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border/50">{status}</span>;
}
