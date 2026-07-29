# Librian

Librian é uma plataforma para gerenciamento pessoal de acervos literários físicos, com estrutura orientada a rede social. Cada usuário mantém estantes organizadas de livros que podem ser visualizadas por outras pessoas na rede. A plataforma foca em curadoria pessoal, visibilidade pública e controle total de propriedade pelo usuário.

---

## Objetivo

Permitir que qualquer usuário organize seus livros físicos em prateleiras virtuais, categorizando, filtrando e expondo publicamente sua coleção. A aplicação prioriza controle individual, mas com visibilidade social — semelhante a um “feed” literário por usuário.

---

## Setup local

### Pré-requisitos

- Java 17+
- Maven
- Docker / Docker Compose
- Node.js 20+

### 1. Banco (Postgres)

```bash
docker compose up -d db
```

Credenciais padrão (também em `.env.example`):

- host: `localhost`
- porta: `5433` (mapeada do container `5432`; evita conflito com Postgres local)
- database: `librian`
- user: `librian_user`
- password: `secret`

### 2. Backend (Spring Boot)

Na raiz do repositório (use Java 17):

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`. O Flyway aplica as migrations na subida.

> Se a conexão falhar com `role "librian_user" does not exist`, recrie com `docker compose down -v && docker compose up -d db`.

### 3. Frontend (Next.js)

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

O front sobe em `http://localhost:3000`.

### Autenticação

1. Em `/login`, peça um **magic link** (email).
2. Com `app.mail.enabled=true` e SMTP configurado (veja `application-local.properties.example`), o email é enviado de verdade.
3. Ao abrir o link, o email é confirmado.
4. Se ainda não houver senha, você define uma em `/auth/set-password`.
5. Depois disso, pode entrar com **email e senha**.

Credenciais de email locais ficam em `src/main/resources/application-local.properties` (arquivo gitignored). O perfil `local` já é o padrão.

### Google Books (sugestões de catálogo)

A API consulta o Google Books em `/book-suggestions/*` (JWT obrigatório) para pré-preencher metadados ao cadastrar livros.

| Endpoint | Uso |
|----------|-----|
| `GET /book-suggestions/search?q=` | busca livre |
| `GET /book-suggestions/isbn/{isbn}` | ISBN |
| `GET /book-suggestions/title/{title}` | título |
| `GET /book-suggestions/author/{author}` | autor |
| `GET /book-suggestions/details/{volumeId}` | detalhe do volume |
| `GET /book-suggestions/smart?q=` | ISBN se parecer ISBN; senão busca geral |

Configure `GOOGLE_BOOKS_API_KEY` (ou `librian.google-books.api-key`). Sem a key a API pública ainda funciona, com rate limit mais restrito. Veja `.env.example`.

---

## Licença

Este repositório é disponibilizado sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
