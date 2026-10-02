# Dream Gym

Projeto pessoal de desenvolvimento web, atualmente em desenvolvimento.

## Sobre

Plataforma para criação de perfil e apresentação de planos e recomendações de treino com base nas informações e preferências indicadas pelo utilizador.

## Funcionalidades presentes na versão atual

- Páginas de apresentação, criação de perfil e início de sessão.
- Registo e autenticação de utilizadores através do Supabase Auth.
- Recolha e gravação de dados de perfil na tabela `profiles`.
- Recomendações iniciais e apresentação de planos no painel, conforme as respostas do perfil.
- Sessão de autenticação guardada no `sessionStorage` do navegador.

O projeto continua em desenvolvimento; o painel apresenta planos e contagens demonstrativas, sem registo completo de treinos realizados.

## Tecnologias

HTML, CSS, JavaScript e Supabase (Auth e base de dados).

## Executar localmente

1. Crie um projeto Supabase e configure a tabela `public.profiles` com uma coluna `id` compatível com o ID do utilizador autenticado e os campos de perfil usados pelo formulário: `nome`, `idade`, `sexo`, `peso`, `altura`, `biotipo` e `status_treino`.
2. Copie `supabase-config.example.js` para `supabase-config.js` e preencha o URL do projeto e a chave publicável.
3. Execute o script `supabase-rls.sql` no SQL Editor do Supabase para aplicar as políticas de acesso aos perfis.
4. Abra `index.html` através de um servidor web local.

A chave publicável do Supabase é concebida para uso no cliente. Nunca coloque chaves secretas ou `service_role` neste repositório.
