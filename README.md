# Foflux - POO_projeto-3

## Descrição

O **Foflux** é uma aplicação web inclusiva desenvolvida para a unidade curricular de **Programação Orientada a Objetos**. O objetivo é apoiar jovens com dificuldades de foco, organização, procrastinação e gestão de rotinas, com especial atenção ao contexto de TDAH.

A aplicação permite organizar tarefas, planear eventos, criar hábitos diários, consultar calendário, usar Pomodoro, receber notificações, acompanhar estatísticas, desbloquear conquistas, consultar conteúdos de motivação, gerir perfil, usar bloco de notas, ver ranking e aceder a uma área de administração.

## Objetivo da aplicação

Ajudar o utilizador a:

- organizar tarefas e prazos;
- dividir trabalho em ações mais pequenas;
- planear eventos e datas importantes;
- criar hábitos diários realistas;
- acompanhar progresso com estatísticas simples;
- usar sessões Pomodoro para foco;
- receber lembretes enquanto a app está aberta;
- manter motivação com frases, dicas e links informativos;
- registar notas rápidas;
- perceber a sua evolução através de gamificação.

## Público-alvo

O projeto foi pensado para jovens estudantes ou utilizadores que sentem dificuldade em manter foco, organizar tarefas, cumprir prazos ou criar rotinas. A app tem uma linguagem simples, visual claro, feedback frequente e funcionalidades que incentivam pequenos passos.

A aplicação não faz diagnóstico e não substitui apoio médico, psicológico ou profissional.

## Tecnologias usadas

- HTML5
- CSS3
- Bootstrap 5 via CDN
- JavaScript ES Modules
- Programação Orientada a Objetos com classes
- localStorage
- JSON Server como Mock Server
- Web Notifications API
- Live Server para execução local

## Arquitetura MVC simplificada

O projeto segue uma arquitetura MVC simplificada, organizada em três tipos principais de ficheiros:

### Models

Representam entidades da aplicação e concentram dados e regras principais.

Exemplos:

- `UserModel.js`
- `TaskModel.js`
- `EventModel.js`
- `HabitModel.js`
- `CalendarItemModel.js`
- `FocusModel.js`
- `BadgeModel.js`
- `MotivationModel.js`
- `NoteModel.js`

### Views

Controlam a interface, os eventos do utilizador e a renderização no DOM.

Exemplos:

- `taskView.js`
- `pomodoroView.js`
- `statisticsView.js`
- `adminView.js`
- `motivationView.js`
- `notesView.js`
- `rankingView.js`

### Services

Centralizam operações auxiliares, persistência, autenticação, estatísticas, notificações e acesso ao Mock Server.

Exemplos:

- `AuthService.js`
- `StorageService.js`
- `MockApiService.js`
- `StatsService.js`
- `NotificationService.js`
- `AchievementService.js`

## Estrutura principal

```text
POO_projeto-3/
│
├── README.md
├── package.json
├── db.json
├── .gitignore
├── .vscode/
│   └── settings.json
│
└── POO_PROJETO/
    ├── index.html
    ├── css/
    │   └── styles.css
    ├── html/
    │   ├── about.html
    │   ├── achievements.html
    │   ├── admin.html
    │   ├── dashboard.html
    │   ├── home.html
    │   ├── login.html
    │   ├── motivation.html
    │   ├── notes.html
    │   ├── pomodoro.html
    │   ├── profile.html
    │   ├── ranking.html
    │   ├── register.html
    │   ├── statistics.html
    │   └── tasks.html
    └── js/
        ├── init.js
        ├── model/
        ├── service/
        └── view/
```

## Como instalar dependências

Na pasta raiz do projeto:

```bash
npm install
```

## Como iniciar o JSON Server

```bash
npm run mock-server
```

O Mock Server fica disponível em:

```text
http://localhost:3000
```

Para confirmar se está ativo:

```text
http://localhost:3000/users
```

## Como abrir a aplicação

1. Abrir a pasta `POO_PROJETO` no Visual Studio Code.
2. Usar a extensão **Live Server**.
3. Abrir o ficheiro `index.html`.

É recomendado usar Live Server porque o projeto usa `type="module"` nos ficheiros JavaScript.

## Contas de teste

### Administrador

```text
Email: admin@admin.com
Password: admin123
```

### Utilizador de teste

```text
Email: teste@focusup.com
Password: teste123
```

O email do utilizador de teste foi mantido para preservar compatibilidade com dados simulados e testes anteriores, mesmo após a mudança visual do nome da aplicação para Foflux.

## Estratégia de dados: JSON Server e localStorage

O projeto usa duas camadas de dados:

### JSON Server

O `db.json` simula uma API/backend. Ele contém dados iniciais de demonstração, como:

- utilizadores;
- tarefas;
- eventos;
- hábitos;
- itens de calendário;
- sessões Pomodoro;
- conquistas;
- notificações;
- frases e links de motivação;
- notas.

O `MockApiService.js` centraliza chamadas `fetch` para o JSON Server.

### localStorage

O `localStorage` é usado como persistência principal da aplicação durante a execução local. Ele guarda:

- utilizadores registados;
- utilizador em sessão;
- dados criados pelo utilizador;
- tarefas, eventos, hábitos, calendário, notas e configurações Pomodoro.

Quando o utilizador existe no JSON Server mas ainda não existe no `localStorage`, o login pode carregar esse utilizador do Mock Server e guardá-lo localmente.

### Observação importante sobre segurança

Este é um projeto académico de front-end. As passwords aparecem em texto simples no `db.json` e no `localStorage` apenas para fins de simulação e demonstração.

Numa aplicação real:

- passwords nunca deveriam ser guardadas no localStorage;
- o backend deveria guardar passwords com hash seguro;
- o browser deveria guardar no máximo um token de sessão;
- operações sensíveis deveriam ser validadas no servidor.

## Funcionalidades implementadas

### Página pública

- Landing page com explicação da aplicação.
- Botões para login e registo.
- Página Sobre.

### Autenticação

- Registo de utilizador.
- Login com localStorage.
- Fallback de login via JSON Server.
- Logout.
- Proteção de páginas privadas.
- Proteção da área Admin.

### Tarefas

- Criar, editar, concluir e remover tarefas.
- Prioridade: Baixa, Média e Alta.
- Data/hora limite opcional.
- Estado: Pendente, Concluída ou Atrasada.
- Filtros por estado e prioridade.
- Histórico de versões.
- Lembretes simples.

### Eventos e Planeamento

- Criar, editar, concluir, reabrir e remover eventos.
- Data/hora de início.
- Data/hora limite.
- Estado: Planeado, Em andamento, Concluído ou Atrasado.
- Botão “Começar agora”.
- Histórico de versões.
- Filtros por estado e categoria.
- Lembretes de início e limite.

### Hábitos Diários

- Criar, editar e remover hábitos.
- Marcar como feito hoje.
- Desmarcar hábito feito hoje.
- Estado diário: Feito hoje ou Pendente hoje.
- Histórico por data.
- Sequência atual.
- Filtro por estado de hoje.

### Calendário

- Visualização mensal.
- Navegação entre meses.
- Destaque do dia atual.
- Destaque de dias com itens.
- Itens próprios de calendário.
- Exibição de tarefas, eventos e hábitos no calendário.
- Filtros simples por categoria e tipo.

### Notificações

- Toasts visuais internos.
- Web Notifications API quando o utilizador autoriza.
- Lembretes para tarefas, eventos e calendário.
- Notificações do Pomodoro.
- Fallback visual se o navegador bloquear notificações.

### Pomodoro

- Perfis padrão.
- Configurações personalizadas.
- Tempo de foco em horas, minutos e segundos.
- Tempo de pausa em horas, minutos e segundos.
- Número de ciclos.
- Guardar, selecionar e remover configurações personalizadas.
- Pausar, retomar e reiniciar.
- Registo de sessões concluídas.

### Motivação

- Frase motivacional do dia.
- Frases aleatórias.
- Sugestões práticas.
- Links úteis por categoria.
- Nota de responsabilidade.
- Fallback local se o JSON Server estiver desligado.
- Conquista “Primeira visita à Motivação”.

### Bloco de Notas

- Criar nota.
- Editar nota.
- Remover nota.
- Pesquisar por título ou conteúdo.
- Guardar data de criação e atualização.

### Ranking

- Ranking simples de utilizadores.
- Pontuação calculada com base em uso da app.
- Indicadores de tarefas, eventos, hábitos, Pomodoro, foco e conquistas.
- Não mostra passwords nem dados sensíveis.

### Estatísticas

- Cards principais.
- Tarefas por prioridade e estado.
- Eventos por estado e categoria.
- Hábitos concluídos por dia e semana.
- Calendário por categoria e tipo.
- Pomodoro por dia e semana.
- Conquistas desbloqueadas e progresso geral.
- Filtro de período: geral, hoje, últimos 7 dias e últimos 30 dias.

### Admin

- Acesso apenas para role `admin`.
- Cards gerais da aplicação.
- Lista de utilizadores.
- Pesquisa por nome, email ou role.
- Filtro por role.
- Métricas por utilizador.
- Editar nome, bio e role.
- Remover utilizador com confirmação.
- Proteção contra apagar a própria conta admin.
- Proteção contra apagar o último administrador.

## Perguntas prováveis na defesa

### Onde está a persistência?

- `StorageService.js` guarda e lê dados no localStorage.
- `MockApiService.js` comunica com o JSON Server.

### Onde está o MVC simplificado?

- Models em `js/model/`.
- Views em `js/view/`.
- Services em `js/service/`.

### Como a view comunica com os dados?

As views importam Models e Services. Exemplo: `taskView.js` usa `TaskModel`, `EventModel`, `HabitModel`, `CalendarItemModel`, `AuthService` e `NotificationService`.

### Como funciona o login com JSON Server?

`AuthService.js` tenta primeiro o localStorage. Se o utilizador não existir localmente, tenta procurar no Mock Server via `MockApiService.js`. Se encontrar e a password estiver correta, guarda o utilizador no localStorage.

### Como são calculadas as estatísticas?

`StatsService.js` concentra os cálculos usados por Estatísticas, Admin e Ranking.

### Como funcionam as notificações?

`NotificationService.js` gere permissões do navegador, toasts internos e verificação periódica de lembretes enquanto a app está aberta.

### Como funciona o ranking?

`StatsService.getUserRanking()` calcula uma pontuação simples com tarefas concluídas, eventos concluídos, hábitos realizados, sessões Pomodoro, minutos de foco, conquistas, notas e variedade de utilização.

## Checklist de teste final

- [ ] Abrir com Live Server.
- [ ] Iniciar JSON Server com `npm run mock-server`.
- [ ] Testar login admin.
- [ ] Testar login utilizador comum.
- [ ] Testar registo.
- [ ] Criar, editar, concluir e remover tarefa.
- [ ] Criar, editar, concluir, reabrir e remover evento.
- [ ] Criar, editar, marcar e desmarcar hábito.
- [ ] Criar, editar e remover item de calendário.
- [ ] Testar notificações visuais.
- [ ] Testar notificações do navegador.
- [ ] Criar Pomodoro customizado.
- [ ] Concluir sessão Pomodoro.
- [ ] Abrir Motivação.
- [ ] Criar e pesquisar notas.
- [ ] Consultar Ranking.
- [ ] Consultar Estatísticas.
- [ ] Entrar no Admin.
- [ ] Confirmar que utilizador comum não acede ao Admin.
- [ ] Desligar JSON Server e confirmar que a app continua funcional com dados locais já guardados.
- [ ] Confirmar que `node_modules/` não vai para o GitHub.

## `.gitignore`

O projeto inclui `.gitignore` com:

```text
node_modules/
.DS_Store
.env
.vscode/.history/
```

## Limitações conhecidas

- O projeto é front-end académico, sem backend real.
- O JSON Server é apenas Mock Server.
- O localStorage é usado para persistência local e não é adequado para guardar passwords numa aplicação real.
- As notificações só funcionam enquanto a aplicação está aberta.
- Não existe Service Worker nem Push API.
- Os gráficos são simples, feitos com HTML/CSS/JS puro.
- O ranking é uma métrica gamificada simples, não uma avaliação real de produtividade.
- Alguns diálogos simples ainda usam `confirm()` por segurança e simplicidade.

## Observações finais para entrega

O Foflux cumpre os requisitos principais do trabalho:

- HTML, CSS e JavaScript;
- Bootstrap para estilização;
- JSON Server como Mock Server;
- localStorage para persistência;
- arquitetura MVC simplificada;
- classes e objetos em JavaScript;
- funcionalidades dinâmicas para utilizador autenticado;
- área pública para visitante;
- área Admin;
- gamificação;
- notificações;
- design responsivo básico.
