# Blog de Notícias

Aplicação web dinâmica voltada para cobertura de notícias nas áreas de esporte, saúde, política e tecnologia, permitindo o gerenciamento de conteúdos em tempo real.  

A plataforma foi desenvolvida com foco em performance e responsividade, oferecendo uma experiência fluida ao usuário.  

Conta com funcionalidades como sistema de busca e categorização por temas, tornando-se um ambiente ideal para centralizar informações e facilitar o acesso às notícias.

🔗 *Repositório:* https://github.com/Carlos2326-jpg/LaboratorioES_P1.git

<img width="1591" height="791" alt="image" src="https://github.com/user-attachments/assets/1e5173cc-c909-4704-b599-168ca5d261d3" />

## 🛠️ Tecnologias

- HTML5 e CSS3  
- JavaScript
- Node.js 
- MySQL Workbench  

## 🚀 Como executar localmente

1. Clone o repositório:  
   git clone https://github.com/Carlos2326-jpg/LaboratorioES_P1.git  

2. Abra a pasta no editor:  
   cd LaboratorioES_P1  

3. Configure o banco de dados no MySQL Workbench.  

4. Baixe e instale pelo site oficial:

   https://nodejs.org/

6. Verifique se o Node.js e o npm foram instalados

   node -v

   npm -v

7. Instale os pacotes necessários

   npm install

9. Execute o projeto

   npm run dev

## Estrutura do projeto
```text
src
├── Config
├── Controllers
├── Middlewares
├── Models
├── Routes
├── Services
├── Views
├── .env
├── .env.example
├── .gitignore
├── blogAulasDB.sql
├── package.json
├── readme.md
└── server.js
```
## 🏗️ Arquitetura MVC

O projeto foi desenvolvido utilizando a arquitetura MVC (Model-View-Controller), um padrão amplamente utilizado no desenvolvimento web para organizar e separar as responsabilidades da aplicação.  

- **Models** → responsáveis pela comunicação com o banco de dados e manipulação dos dados.  
- **Views** → responsáveis pela interface visual e interação com o usuário.  
- **Controllers** → responsáveis por receber as requisições, processar as regras da aplicação e retornar as respostas adequadas.  
- **Services** → camada utilizada para centralizar regras de negócio e validações do sistema.  
- **Middlewares** → utilizados para autenticação, permissões e tratamento de requisições.  
- **Routes** → definem as rotas/endpoints da aplicação.  
- **Config** → armazena configurações gerais do projeto, como conexão com banco de dados.  

Essa estrutura torna o sistema mais organizado, escalável e facilita a manutenção do código em equipe.

## 👥 Autores

- Andre Luis - [@Andre63359](https://github.com/Andre63359)  
- João Carlos - [@Carlos2326-jpg](https://github.com/Carlos2326-jpg)  
- Marcio Henrique - [@MarcioTheodoro](https://github.com/MarcioTheodoro)
