# 👕 eCommerce Clothes Backend

API REST para uma plataforma de e-commerce de vestuário. Construída com **Node.js**, **Express**, **TypeScript**, **MongoDB** e **Mongoose**, com autenticação JWT, validação de entrada, RBAC, upload de imagens, sistema de carrinho e pedidos.

> Backend completo, tipado, com testes e pronto para produção.

---

## 🚀 Tecnologias

- **Node.js 18+** — Runtime JavaScript server-side
- **TypeScript 5** — Tipagem estática e DX moderna
- **Express 4** — Framework HTTP minimalista
- **MongoDB + Mongoose** — Persistência e ODM
- **JWT** — Autenticação stateless com access + refresh tokens
- **bcryptjs** — Hash de senhas
- **Joi** — Validação de payloads
- **Multer** — Upload de arquivos
- **Winston + Morgan** — Logging estruturado e de requests
- **Helmet + CORS + HPP + Rate Limiting** — Hardening de segurança
- **Jest + Supertest** — Testes unitários e de integração
- **tsx** — Dev experience sem step de build

---

## 🛠️ Funcionalidades

- 👤 **Autenticação completa** — signup, login, refresh token, logout, `/me`
- 🔐 **Autorização por roles** — `user` e `admin`
- 👕 **CRUD de produtos** com paginação, filtros e busca textual
- 🛒 **Carrinho de compras** persistente por usuário
- 📦 **Pedidos** com status, payment method e endereço de entrega
- 📤 **Upload de imagens** com validação de tipo e tamanho
- 🛡️ **Validação rigorosa** com mensagens claras
- 🧯 **Error handling centralizado** com logger
- 📊 **Logging estruturado** (console + arquivos em produção)
- 🧪 **Cobertura de testes** de fluxos críticos
- ⚡ **Rate limiting** para evitar abuso
- 💉 **Sanitização** contra NoSQL injection e XSS

---

## 📁 Estrutura do Projeto

```
ecommerce-clothes-backend/
├── src/
│   ├── config/             # DB, JWT
│   ├── controllers/        # Lógica das requisições
│   ├── middleware/         # Auth, error handler, request logger
│   ├── models/             # Schemas do Mongoose (User, Product, Order)
│   ├── routes/             # Definição dos endpoints
│   ├── validation/         # Schemas Joi
│   ├── utils/              # Logger, asyncHandler, errorResponse
│   ├── app.ts              # Configuração do Express
│   └── server.ts           # Entry point
├── tests/                  # Jest + Supertest
├── upload/images/          # Imagens enviadas
├── logs/                   # Logs em produção
├── .env.example
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.js
├── dockerfile
├── vercel.json
└── package.json
```

---

## ⚙️ Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
PORT=5000
NODE_ENV=development

JWT_SECRET=uma_chave_secreta_segura
JWT_EXPIRES_IN=1d
REFRESH_SECRET=outra_chave_secreta_segura
REFRESH_EXPIRES_IN=30d

BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=5mb
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif
```

---

## 🔧 Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env

# 3. Rodar em dev (hot reload via tsx)
npm run dev

# 4. Build de produção
npm run build

# 5. Iniciar versão compilada
npm start
```

A API sobe em `http://localhost:5000`.

---

## 🧪 Testes

```bash
npm test
```

Roda Jest + Supertest com MongoDB in-memory. Cobre:
- Auth (signup, login, /me, tokens inválidos)
- CRUD de produtos (permissões, validação, paginação)
- Health check

---

## 📚 Endpoints da API

### Auth

| Método | Endpoint | Auth | Descrição |
| --- | --- | --- | --- |
| POST | `/api/users/signup` | — | Cadastro de usuário |
| POST | `/api/users/login` | — | Login (retorna access + refresh) |
| POST | `/api/users/refresh` | — | Renovar tokens via cookie |
| POST | `/api/users/logout` | Bearer | Limpa cookies de auth |
| GET | `/api/users/me` | Bearer | Perfil do usuário logado |

### Produtos

| Método | Endpoint | Auth | Descrição |
| --- | --- | --- | --- |
| GET | `/api/products` | — | Lista com `?page`, `?limit`, `?category`, `?search`, `?sort` |
| GET | `/api/products/:id` | — | Detalhe do produto |
| GET | `/api/products/new` | — | 8 produtos mais recentes |
| GET | `/api/products/popular-women` | — | Top 4 para mulheres |
| POST | `/api/products` | Admin | Criar produto |
| PUT | `/api/products/:id` | Admin | Atualizar produto |
| DELETE | `/api/products/:id` | Admin | Remover produto |

### Carrinho

| Método | Endpoint | Auth | Descrição |
| --- | --- | --- | --- |
| GET | `/api/cart` | Bearer | Ler carrinho |
| POST | `/api/cart` | Bearer | Adicionar item |
| PUT | `/api/cart/:productId` | Bearer | Atualizar quantidade |
| DELETE | `/api/cart/:productId` | Bearer | Remover item |
| DELETE | `/api/cart` | Bearer | Limpar carrinho |

### Pedidos

| Método | Endpoint | Auth | Descrição |
| --- | --- | --- | --- |
| POST | `/api/orders` | Bearer | Criar pedido (limpa o carrinho) |
| GET | `/api/orders` | Bearer | Histórico do usuário |
| GET | `/api/orders/:id` | Bearer | Detalhe (dono ou admin) |
| PUT | `/api/orders/:id/status` | Admin | Atualizar status do pedido |

### Upload

| Método | Endpoint | Auth | Descrição |
| --- | --- | --- | --- |
| POST | `/api/upload` | Admin | Upload de 1 imagem (campo `product`) |
| POST | `/api/upload/multiple` | Admin | Upload de até 10 imagens (campo `products`) |

### Utilitários

| Método | Endpoint | Auth | Descrição |
| --- | --- | --- | --- |
| GET | `/health` | — | Status do servidor |
| GET | `/images/:filename` | — | Servir imagens estáticas |

---

## 🔒 Segurança Implementada

- **Senhas com bcrypt** (12 rounds)
- **JWT** com access + refresh tokens, ambos via httpOnly cookies
- **Helmet** para headers HTTP seguros
- **Rate limiting** (100 req / 10 min por IP)
- **HPP** para evitar poluição de parâmetros
- **Mongo sanitization** contra NoSQL injection
- **CORS configurável** via `CORS_ORIGIN`
- **Validação Joi** em todos os payloads sensíveis
- **RBAC** com middlewares `protect` e `authorize`

---

## 🐳 Docker

```bash
docker build -t ecommerce-backend .
docker run -p 5000:5000 --env-file .env ecommerce-backend
```

---

## ☁️ Deploy (Vercel)

O `vercel.json` já está configurado para build de TypeScript via `@vercel/node` apontando para `src/server.ts`. Lembre-se de configurar as variáveis de ambiente no painel da Vercel.

---

## 📄 Licença

MIT — Desenvolvido por [mvdevelop](https://github.com/mvdevelop).
