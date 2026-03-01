import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsers, useGroups, useLogs, useClearLogs, useCreateUser, useCreateGroup, useDeleteGroup } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Trash2, Users, FolderTree, ShieldAlert, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { role } = useAuth();
  const { data: users } = useUsers();
  const { data: groups } = useGroups();
  const { data: logs } = useLogs();
  const clearLogs = useClearLogs();
  const createUser = useCreateUser();
  const createGroup = useCreateGroup();
  const deleteGroup = useDeleteGroup();
  const { toast } = useToast();

  if (role !== "ADMIN") return <Redirect to="/" />;

  const handleCreateUser = async () => {
    const username = prompt("Username:");
    if (!username) return;
    const password = prompt("Password (min 6 chars):");
    if (!password || password.length < 6) return;
    const displayName = prompt("Nome de exibição:");
    if (!displayName) return;
    const roleChoice = prompt("Role (PRODUCAO ou QUALIDADE):")?.toUpperCase();
    if (roleChoice !== "PRODUCAO" && roleChoice !== "QUALIDADE") {
      alert("Role inválida. Use PRODUCAO ou QUALIDADE.");
      return;
    }

    try {
      await createUser.mutateAsync({
        username,
        password,
        displayName,
        role: roleChoice as any,
        isActive: true
      });
      toast({ title: "Usuário criado com sucesso" });
    } catch (e: any) {
      toast({ title: "Erro ao criar usuário", description: e.message, variant: "destructive" });
    }
  };

  const handleCreateGroup = async () => {
    const name = prompt("Nome do grupo:");
    if (!name) return;
    try {
      await createGroup.mutateAsync({ name });
      toast({ title: "Grupo criado com sucesso" });
    } catch (e: any) {
      toast({ title: "Erro ao criar grupo", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (confirm("Tem certeza que deseja apagar este grupo?")) {
      try {
        await deleteGroup.mutateAsync(id);
        toast({ title: "Grupo removido" });
      } catch (e: any) {
        toast({ title: "Erro ao remover grupo", description: e.message, variant: "destructive" });
      }
    }
  };

  const handleClearLogs = async () => {
    if (confirm("Tem certeza que deseja apagar todos os logs?")) {
      await clearLogs.mutateAsync();
      toast({ title: "Logs apagados" });
    }
  };

  return (
    <Layout title="Administração">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl bg-secondary/80 p-1 mb-6">
          <TabsTrigger value="users" className="rounded-lg font-bold"><Users className="w-4 h-4 mr-2"/> Usuários</TabsTrigger>
          <TabsTrigger value="groups" className="rounded-lg font-bold"><FolderTree className="w-4 h-4 mr-2"/> Grupos</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg font-bold"><ShieldAlert className="w-4 h-4 mr-2"/> Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 animate-slide-up">
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border">
            <h3 className="font-display font-bold">Gestão de Usuários</h3>
            <Button size="sm" onClick={handleCreateUser} disabled={createUser.isPending} className="rounded-lg shadow-md">
              <Plus className="w-4 h-4 mr-1" /> Novo Usuário
            </Button>
          </div>
          <div className="grid gap-3">
            {users?.map((u: any) => (
              <div key={u.id} className="p-3 bg-card rounded-xl border flex justify-between items-center">
                <div>
                  <p className="font-bold">{u.displayName}</p>
                  <p className="text-xs text-muted-foreground">{u.username} • {u.role}</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {u.isActive ? "ATIVO" : "INATIVO"}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4 animate-slide-up">
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border">
            <h3 className="font-display font-bold">Grupos de Item</h3>
            <Button size="sm" onClick={handleCreateGroup} disabled={createGroup.isPending} className="rounded-lg shadow-md">
              <Plus className="w-4 h-4 mr-1" /> Novo Grupo
            </Button>
          </div>
          <div className="grid gap-3">
            {groups?.map((g: any) => (
              <div key={g.id} className="p-3 bg-card rounded-xl border flex justify-between items-center">
                <p className="font-bold text-sm">{g.name}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteGroup(g.id)}
                  disabled={deleteGroup.isPending}
                  className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 animate-slide-up">
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border">
            <h3 className="font-display font-bold">Auditoria do Sistema</h3>
            <Button variant="destructive" size="sm" onClick={handleClearLogs} disabled={clearLogs.isPending} className="rounded-lg shadow-md">
              <Trash2 className="w-4 h-4 mr-2"/> Limpar
            </Button>
          </div>
          <ScrollArea className="h-[60vh] rounded-xl border bg-card/50 p-2">
            <div className="space-y-2">
              {logs?.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">Nenhum log encontrado</p>}
              {logs?.map((log: any) => (
                <div key={log.id} className="text-xs p-2 bg-background rounded border font-mono">
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                    <span>{log.action}</span>
                  </div>
                  <p className="text-foreground">Usuário: {log.userId} • Tabela: {log.entityType}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
