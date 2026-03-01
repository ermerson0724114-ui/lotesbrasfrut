# Gestão de Liberação de Lotes pela Qualidade

Aplicativo web mobile-first para gestão de qualidade.

## Como rodar o projeto localmente (Dev)

1. Renomeie o arquivo `.env.example` para `.env` e configure a variável `DATABASE_URL` com sua conexão do Neon PostgreSQL.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

## Deploy (Render / Neon)

1. Crie um banco no Neon e copie o `DATABASE_URL`.
2. Configure as seguintes variáveis de ambiente no Render (Web Service):
   - `DATABASE_URL` (Sua conexão do Neon)
   - `JWT_SECRET` (Uma chave secreta forte para os tokens)
   - `VITE_API_URL` (URL do serviço no Render se necessário para o front)
3. Configuração de Build no Render:
   - **Build Command**: `npm install && npm run build`
4. Configuração de Start no Render:
   - **Start Command**: `npm run start`

O processo de build (`npm run build`) rodará o `drizzle-kit push` para garantir que o banco esteja atualizado, e também o script de seed (`seed.ts`) que criará o usuário admin (`admin` / `147388`) via `INSERT ... ON CONFLICT DO NOTHING`.
