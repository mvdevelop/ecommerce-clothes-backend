
## 👕 eCommerce Clothes Backend

Este é o motor (API) de uma plataforma de e-commerce voltada para o setor de vestuário. Desenvolvido com **Node.js**, **Express** e **MongoDB**, o backend gerencia desde o catálogo de produtos até o processamento de pedidos e autenticação de usuários, garantindo segurança e escalabilidade.

## 🚀 Tecnologias Utilizadas

* **Node.js**: Ambiente de execução Javascript no servidor.
* **Express.js**: Framework rápido e minimalista para criação de APIs REST.
* **MongoDB**: Banco de dados NoSQL orientado a documentos para flexibilidade de produtos.
* **Mongoose**: Biblioteca para modelagem de objetos (ODM) e validação de dados.
* **JWT (JSON Web Token)**: (Sugestão) Sistema de autenticação e proteção de rotas.
* **Dotenv**: Gerenciamento de variáveis de ambiente.

## 🛠️ Funcionalidades Principais

* **Gerenciamento de Produtos:** Cadastro, edição, remoção e listagem de roupas (com tamanhos, cores e estoque).
* **Sistema de Categorias:** Organização por tipo (Camisetas, Calças, Acessórios, etc).
* **Carrinho de Compras:** Lógica de persistência e cálculo de valores no servidor.
* **Autenticação de Usuários:** Cadastro e Login seguro.
* **Histórico de Pedidos:** Registro detalhado de compras realizadas.

## 📋 Endpoints da API (Exemplos)

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | `/api/products` | Lista todos os produtos com filtros |
| **POST** | `/api/products` | Adiciona um novo item (Admin) |
| **POST** | `/api/users/login` | Autentica o usuário e retorna o token |
| **GET** | `/api/orders` | Lista o histórico de pedidos do usuário |
| **POST** | `/api/cart` | Atualiza itens no carrinho |

## 📁 Estrutura do Projeto

ecommerce-clothes-backend/
├── src/
│   ├── config/      # Conexão com Banco de Dados e variáveis
│   ├── controllers/ # Lógica das requisições (req, res)
│   ├── middleware/  # Filtros de autenticação e erros
│   ├── models/      # Esquemas do Mongoose (Product, User, Order)
│   ├── routes/      # Definição dos endpoints da API
│   └── app.js       # Ponto de entrada da aplicação
├── .env             # Chaves secretas e URIs (não enviado ao GitHub)
└── package.json     # Dependências do projeto

## 🔧 Como rodar o projeto
Clone o repositório:

Bash

git clone [https://github.com/mvdevelop/ecommerce-clothes-backend.git](https://github.com/mvdevelop/ecommerce-clothes-backend.git)
cd ecommerce-clothes-backend
Instale as dependências:

Bash

npm install
Configure as Variáveis de Ambiente: Crie um arquivo .env na raiz e adicione:

Snippet de código

MONGO_URI=sua_string_de_conexao_mongodb
PORT=5000
JWT_SECRET=sua_chave_secreta_aqui
Inicie o servidor:

Bash

npm start # ou npm run dev (se tiver nodemon)
A API estará rodando em: http://localhost:5000

## 👨‍💻 Autor
Desenvolvido por mvdevelop.

GitHub: @mvdevelop

## 📄 Licença
Este projeto está sob a licença MIT.
