import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroups } from "@/hooks/use-admin";
import { useCreateBatch } from "@/hooks/use-batches";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CreateBatchModal() {
  const [open, setOpen] = useState(false);
  const { data: groups = [] } = useGroups();
  const createMutation = useCreateBatch();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    productionDate: new Date().toISOString().split('T')[0],
    itemCode: "",
    itemDescription: "",
    quantityProduced: "",
    lotCode: "",
    itemGroupId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        quantityProduced: Number(formData.quantityProduced),
      });
      toast({ title: "Lote criado com sucesso!" });
      setOpen(false);
      setFormData({ ...formData, itemCode: "", itemDescription: "", quantityProduced: "", lotCode: "" });
    } catch (err: any) {
      toast({ title: "Erro ao criar", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all">
          <PlusCircle className="w-5 h-5 mr-2" /> Novo Lote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl w-[95vw] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Registrar Novo Lote</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data Prod.</Label>
              <Input type="date" required className="rounded-lg" value={formData.productionDate} onChange={e => setFormData({...formData, productionDate: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Grupo</Label>
              <Select value={formData.itemGroupId} onValueChange={v => setFormData({...formData, itemGroupId: v})} required>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cód. Item (6-7 chars)</Label>
              <Input required minLength={6} maxLength={7} className="rounded-lg" value={formData.itemCode} onChange={e => setFormData({...formData, itemCode: e.target.value.toUpperCase()})} placeholder="EX1234" />
            </div>
            <div className="space-y-1.5">
              <Label>Cód. Lote</Label>
              <Input required minLength={8} maxLength={14} className="rounded-lg" value={formData.lotCode} onChange={e => setFormData({...formData, lotCode: e.target.value.toUpperCase()})} placeholder="LOT000001" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição do Item</Label>
            <Input required className="rounded-lg" value={formData.itemDescription} onChange={e => setFormData({...formData, itemDescription: e.target.value})} placeholder="Parafuso 10mm" />
          </div>

          <div className="space-y-1.5">
            <Label>Quant. Produzida</Label>
            <Input required type="number" min="1" className="rounded-lg" value={formData.quantityProduced} onChange={e => setFormData({...formData, quantityProduced: e.target.value})} placeholder="1000" />
          </div>

          <Button type="submit" disabled={createMutation.isPending} className="w-full h-12 rounded-xl mt-4 font-bold">
            {createMutation.isPending ? "Salvando..." : "Salvar Lote"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
