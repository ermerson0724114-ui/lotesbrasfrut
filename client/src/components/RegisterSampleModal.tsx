import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera, CheckCircle2, XCircle } from "lucide-react";
import { useAddSample } from "@/hooks/use-batches";
import { useToast } from "@/hooks/use-toast";

interface Props {
  batch: any;
  open: boolean;
  onClose: () => void;
}

export function RegisterSampleModal({ batch, open, onClose }: Props) {
  const mutation = useAddSample();
  const { toast } = useToast();
  
  const [result, setResult] = useState<"APROVADO" | "REPROVADO">("APROVADO");
  const [decidedNext, setDecidedNext] = useState<"AGUARDAR_PROXIMA" | "LIBERAR" | "RETER">("AGUARDAR_PROXIMA");
  const [reason, setReason] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (result === "REPROVADO" && !reason.trim()) {
      toast({ title: "Erro", description: "Motivo é obrigatório para reprovadas", variant: "destructive" });
      return;
    }
    
    if (decidedNext === "RETER" && !recommendation.trim()) {
      toast({ title: "Erro", description: "Recomendação é obrigatória ao reter", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("result", result);
    formData.append("decidedNext", decidedNext);
    if (reason) formData.append("reason", reason);
    if (recommendation) formData.append("recommendation", recommendation);
    if (file) formData.append("photo", file);

    try {
      await mutation.mutateAsync({ batchId: batch.id, formData });
      toast({ title: "Amostra registrada com sucesso!" });
      onClose();
      // Reset
      setResult("APROVADO");
      setDecidedNext("AGUARDAR_PROXIMA");
      setReason("");
      setRecommendation("");
      setFile(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const nextSampleNum = (batch?.samples?.length || 0) + 1;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl w-[95vw] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Registrar Amostra #{nextSampleNum}</DialogTitle>
          <p className="text-sm text-muted-foreground">Lote: {batch?.lotCode}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          
          {/* Result Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Resultado da Análise</Label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${result === 'APROVADO' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700' : 'border-border hover:bg-secondary/50'}`}
                onClick={() => setResult('APROVADO')}
              >
                <CheckCircle2 className={`w-8 h-8 ${result === 'APROVADO' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                <span className="font-bold">Aprovado</span>
              </div>
              <div 
                className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${result === 'REPROVADO' ? 'border-rose-500 bg-rose-500/10 text-rose-700' : 'border-border hover:bg-secondary/50'}`}
                onClick={() => { setResult('REPROVADO'); setDecidedNext('RETER'); }}
              >
                <XCircle className={`w-8 h-8 ${result === 'REPROVADO' ? 'text-rose-500' : 'text-muted-foreground'}`} />
                <span className="font-bold">Reprovado</span>
              </div>
            </div>
          </div>

          {result === "REPROVADO" && (
            <div className="space-y-1.5 animate-slide-up">
              <Label className="text-rose-600 font-bold">Motivo da Reprovação *</Label>
              <Textarea required className="rounded-xl border-rose-200 focus-visible:ring-rose-500" value={reason} onChange={e => setReason(e.target.value)} placeholder="Descreva o problema encontrado..." />
            </div>
          )}

          {/* Decisão */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Decisão para o Lote</Label>
            <RadioGroup value={decidedNext} onValueChange={(v: any) => setDecidedNext(v)} className="flex flex-col space-y-1">
              {nextSampleNum < 4 && (
                <div className="flex items-center space-x-2 border p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                  <RadioGroupItem value="AGUARDAR_PROXIMA" id="d1" />
                  <Label htmlFor="d1" className="cursor-pointer flex-1 font-semibold">Aguardar próxima amostra</Label>
                </div>
              )}
              <div className="flex items-center space-x-2 border p-3 rounded-xl border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                <RadioGroupItem value="LIBERAR" id="d2" disabled={result === 'REPROVADO' && batch.samples?.filter((s:any)=>s.result==='APROVADO').length === 0} />
                <Label htmlFor="d2" className="cursor-pointer flex-1 font-semibold text-emerald-700">Liberar Lote</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-xl border-rose-200 hover:bg-rose-50/50 transition-colors">
                <RadioGroupItem value="RETER" id="d3" />
                <Label htmlFor="d3" className="cursor-pointer flex-1 font-semibold text-rose-700">Reter Lote</Label>
              </div>
            </RadioGroup>
          </div>

          {decidedNext === "RETER" && (
            <div className="space-y-1.5 animate-slide-up">
              <Label className="text-rose-600 font-bold">Recomendação de Processo *</Label>
              <Textarea required className="rounded-xl border-rose-200 focus-visible:ring-rose-500" value={recommendation} onChange={e => setRecommendation(e.target.value)} placeholder="Ação necessária antes do descarte/reprocesso..." />
            </div>
          )}

          {/* Photo Upload */}
          <div className="space-y-2 pt-2 border-t">
             <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Evidência (Opcional)</Label>
             <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors border-border">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-6 h-6 mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {file ? file.name : "Tirar foto ou anexar"}
                  </p>
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full h-12 rounded-xl mt-4 font-bold text-base shadow-lg hover:-translate-y-0.5">
            {mutation.isPending ? "Salvando..." : "Confirmar Decisão"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
