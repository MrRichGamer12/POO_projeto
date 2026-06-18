# FocusUp - POO_projeto-3

## Descrição

O **FocusUp** é uma aplicação web inclusiva para ajudar jovens com TDAH a melhorar foco, organização e produtividade.

A aplicação permite gerir tarefas, usar sessões Pomodoro, acompanhar conquistas, consultar estatísticas, editar perfil e aceder a uma área de administração. O projeto foi organizado com **HTML, CSS, JavaScript puro, Bootstrap via CDN, localStorage e JSON Server como Mock Server**.

## Tecnologias usadas

- HTML5
- CSS3
- Bootstrap 5 via CDN
- JavaScript ES Modules
- localStorage
- JSON Server
- MVC simplificado

## Arquitetura

O projeto segue uma organização inspirada no MVC simplificado:

- `model/` - classes principais e entidades da aplicação.
- `view/` - ficheiros que controlam a interface, eventos e DOM.
- `service/` - serviços auxiliares para autenticação, armazenamento, estatísticas, conquistas e Mock Server.

## Funcionalidades existentes

- Landing page pública.
- Login e registo de utilizadores.
- Área privada após login.
- Pomodoro e sessões de foco.
- Gestão de tarefas com prioridade, prazo, estado e histórico de versões.
- Eventos e Planeamento com data de início, data limite, estado e histórico de versões.
- Hábitos Diários com conclusão por data, estado de hoje, sequência atual e histórico.
- Calendário simples mensal com itens próprios e visualização de tarefas, eventos e hábitos por dia.
- Badges, troféus e conquistas.
- Estatísticas e gráficos simples em JavaScript puro.
- Perfil do utilizador.
- Modo administrador.
- Persistência principal em `localStorage`.
- Mock Server com `JSON Server` para simulação de dados.
- Login com fallback para utilizadores simulados no `db.json`, quando ainda não existem no `localStorage`.

## Dados de teste

### Administrador da aplicação local

- Email: `admin@admin.com`
- Password: `admin123`

O administrador é criado automaticamente pelo `StorageService` quando a aplicação é iniciada.

### Utilizador de teste no db.json

- Email: `teste@focusup.com`
- Password: `teste123`

Este utilizador existe no `db.json` para demonstrar dados simulados no JSON Server. A partir da mini-etapa 1.1, se este utilizador ainda não existir no `localStorage`, a aplicação tenta carregá-lo do Mock Server no primeiro login e guarda uma cópia local.

## Como instalar dependências

Na pasta principal do projeto, executar:

```bash
npm install
```

Isto instala o `json-server`, usado apenas como Mock Server.

## Como correr o JSON Server

Na pasta principal do projeto, executar:

```bash
npm run mock-server
```

O Mock Server fica disponível em:

```text
http://localhost:3000
```

Exemplos de endpoints:

```text
http://localhost:3000/users
http://localhost:3000/tasks
http://localhost:3000/habits
http://localhost:3000/events
http://localhost:3000/calendarItems
http://localhost:3000/pomodoroSessions
http://localhost:3000/achievements
http://localhost:3000/statistics
http://localhost:3000/notifications
http://localhost:3000/motivationLinks
```

## Como abrir a aplicação

1. Abrir a pasta `POO_PROJETO` no Visual Studio Code.
2. Usar a extensão **Live Server**.
3. Abrir o ficheiro `index.html`.

> Como o projeto usa JavaScript Modules (`type="module"`), é recomendado usar Live Server em vez de abrir diretamente o ficheiro no navegador.

## Como testar se o Mock Server está ativo

1. Executar:

```bash
npm run mock-server
```

2. Abrir no navegador:

```text
http://localhost:3000/users
```

3. Se aparecer uma lista de utilizadores em JSON, o Mock Server está ativo.

A aplicação também faz uma verificação simples no `init.js`. Se o Mock Server não estiver ativo, a aplicação continua funcional usando `localStorage`.

## Estrutura do projeto

```text
POO_projeto-3/
│
├── README.md
├── package.json
├── db.json
├── .vscode/
│   └── settings.json
└── POO_PROJETO/
    ├── index.html
    ├── css/
    │   └── styles.css
    ├── html/
    │   ├── about.html
    │   ├── admin.html
    │   ├── achievements.html
    │   ├── dashboard.html
    │   ├── home.html
    │   ├── login.html
    │   ├── pomodoro.html
    │   ├── profile.html
    │   ├── register.html
    │   ├── statistics.html
    │   └── tasks.html
    └── js/
        ├── init.js
        ├── model/
        │   ├── BadgeModel.js
        │   ├── FocusModel.js
        │   ├── GoalModel.js
        │   ├── EventModel.js
        │   ├── HabitModel.js
        │   ├── CalendarItemModel.js
        │   ├── TaskModel.js
        │   └── UserModel.js
        ├── service/
        │   ├── AchievementService.js
        │   ├── AuthService.js
        │   ├── MockApiService.js
        │   ├── StatsService.js
        │   └── StorageService.js
        └── view/
            ├── achievementView.js
            ├── adminView.js
            ├── authView.js
            ├── commonView.js
            ├── dashboardView.js
            ├── goalView.js
            ├── homeView.js
            ├── pomodoroView.js
            ├── profileView.js
            ├── publicView.js
            ├── statisticsView.js
            └── taskView.js
```

## Dados simulados no db.json

O ficheiro `db.json` contém dados simulados para:

- utilizadores;
- administrador;
- tarefas;
- hábitos diários;
- eventos de planeamento;
- calendário e itens próprios do calendário;
- sessões Pomodoro;
- conquistas;
- estatísticas;
- perfil;
- notificações;
- links de motivação.

## Observação importante sobre localStorage e JSON Server

Nesta versão, o `localStorage` continua a ser a persistência principal da aplicação, porque é requisito do trabalho e já estava integrado no projeto.

O `JSON Server` foi adicionado como Mock Server para simular dados externos e cumprir o requisito técnico da unidade curricular. A aplicação não depende dele para funcionar.

### Login com localStorage e fallback para Mock Server

A autenticação funciona da seguinte forma:

1. Primeiro, a aplicação procura o utilizador no `localStorage`.
2. Se encontrar, valida a password localmente e faz login normalmente.
3. Se não encontrar no `localStorage`, tenta procurar o utilizador no JSON Server através do `MockApiService`.
4. Se o email e a password existirem no `db.json`, a aplicação permite o login.
5. Depois desse primeiro login, o utilizador vindo do Mock Server é guardado também no `localStorage`.
6. A partir daí, esse utilizador passa a conseguir entrar mesmo que o JSON Server esteja desligado.

Isto permite testar, por exemplo:

```text
Email: teste@focusup.com
Password: teste123
```

Para este login funcionar pela primeira vez, o JSON Server deve estar ativo. Depois do primeiro login, o utilizador fica guardado localmente.

## Etapa 2 - Tarefas com prazos e versões

A página **Tarefas e Hábitos** foi melhorada nesta etapa. As tarefas continuam guardadas no `localStorage`, mas agora possuem mais informação e melhor organização visual.

### Novos campos da tarefa

Cada tarefa pode conter:

- título;
- prioridade: Baixa, Média ou Alta;
- data e horário de criação automáticos;
- data limite opcional;
- horário limite opcional;
- estado calculado automaticamente: Pendente, Concluída ou Atrasada;
- histórico de versões.

A data limite e o horário limite são opcionais. No entanto, se for definido um horário limite, deve existir também uma data limite.

### Filtros disponíveis

A lista de tarefas permite filtrar por:

- estado: Todos, Pendentes, Concluídas ou Atrasadas;
- prioridade: Todos, Baixa, Média ou Alta.

### Histórico de versões

Sempre que uma tarefa é criada, editada ou concluída, a aplicação regista uma entrada no histórico. O botão **Ver versões** mostra:

- data da alteração;
- tipo da alteração;
- valor anterior;
- valor novo.

O `db.json` também foi atualizado com exemplos de tarefas contendo `createdAt`, `dueDate`, `dueTime`, `status` e `versionHistory`. Estes dados servem como simulação para o Mock Server.

### Como testar a Etapa 2

1. Abrir a app com Live Server.
2. Fazer login com um utilizador existente ou criar uma nova conta.
3. Entrar em **Tarefas e Hábitos**.
4. Criar uma tarefa sem data limite.
5. Criar uma tarefa com data e horário limite.
6. Criar uma tarefa com prazo anterior à data atual para ver o estado **Atrasada**.
7. Filtrar por prioridade: Baixa, Média e Alta.
8. Filtrar por estado: Pendentes, Concluídas e Atrasadas.
9. Editar título, prioridade, data limite e horário limite.
10. Clicar em **Ver versões** para consultar o histórico da tarefa.
11. Concluir uma tarefa e confirmar que o estado e o histórico são atualizados.



## Etapa 3 - Eventos e Planeamento

A página **Tarefas e Hábitos** passou a incluir uma nova secção chamada **Eventos e Planeamento**. Esta funcionalidade foi adicionada sem remover as tarefas já existentes.

### Campos dos eventos

Cada evento de planeamento pode conter:

- título;
- descrição opcional;
- categoria: Faculdade, Trabalho, Estudo, Projeto, Pessoal ou Outro;
- data e horário de criação automáticos;
- data de início;
- horário de início opcional;
- data limite;
- horário limite opcional;
- estado calculado automaticamente;
- histórico de versões.

### Estados dos eventos

O estado é calculado pela aplicação com base nas datas e na conclusão:

- **Planeado**: ainda não chegou à data/hora de início;
- **Em andamento**: já chegou à data/hora de início e ainda não passou o prazo;
- **Atrasado**: a data/hora limite passou e o evento ainda não foi concluído;
- **Concluído**: o utilizador marcou o evento como concluído.

### Mensagem de reflexão

Quando é criado um evento com data de início futura, a aplicação mostra uma mensagem de reflexão:

```text
Tens certeza de que não queres começar esta tarefa agora? Às vezes subestimamos o tempo necessário.
```

Também é apresentado o botão **Começar agora**, que atualiza a data e a hora de início do evento para o momento atual.

### Histórico de versões dos eventos

O botão **Ver versões** mostra alterações como:

- criação do evento;
- alteração de título;
- alteração de descrição;
- alteração de data/hora de início;
- alteração de data/hora limite;
- alteração de categoria;
- uso do botão Começar agora;
- alteração de estado;
- remoção do evento, registada antes da eliminação.

### Como testar a Etapa 3

1. Abrir a app com Live Server.
2. Fazer login com um utilizador existente ou criar uma nova conta.
3. Entrar em **Tarefas e Hábitos**.
4. Criar um evento com data de início futura e data limite.
5. Confirmar que aparece a mensagem de reflexão.
6. Clicar em **Começar agora** e verificar se a data/hora de início muda para o momento atual.
7. Criar um evento com prazo já ultrapassado para ver o estado **Atrasado**.
8. Editar título, descrição, categoria, data de início e data limite.
9. Clicar em **Ver versões** para consultar o histórico.
10. Marcar o evento como concluído e confirmar que o estado muda para **Concluído**.
11. Reabrir o evento e confirmar que o histórico regista a alteração.

O `db.json` foi atualizado com exemplos de eventos contendo `createdAt`, `startDate`, `startTime`, `dueDate`, `dueTime`, `category`, `status` e `versionHistory`. Estes dados servem como simulação para o Mock Server.


## Etapa 4 - Hábitos Diários

A página **Tarefas e Hábitos** passou a incluir uma nova secção chamada **Hábitos Diários**. Esta funcionalidade foi adicionada por cima da Etapa 3, sem remover tarefas, eventos, login, registo, JSON Server ou localStorage.

### Campos dos hábitos

Cada hábito diário pode conter:

- título;
- descrição opcional;
- data e horário de criação automáticos;
- estado do dia atual: Feito ou Pendente;
- lista de datas concluídas;
- histórico de alterações e ações diárias.

### Regra principal

O hábito não é uma tarefa concluída para sempre. Ele repete-se todos os dias:

- se o utilizador marcar o hábito como feito hoje, ele fica feito apenas na data atual;
- no dia seguinte, o mesmo hábito volta a aparecer como pendente;
- as conclusões anteriores ficam guardadas no histórico por data.

### Ações disponíveis

Na lista de hábitos, o utilizador pode:

- criar hábito diário;
- editar título e descrição;
- remover hábito;
- marcar como feito hoje;
- desmarcar o dia atual;
- consultar total de dias concluídos;
- consultar sequência atual;
- clicar em **Ver histórico** para ver conclusões por data e alterações do hábito.

### Como testar a Etapa 4

1. Abrir a app com Live Server.
2. Fazer login com um utilizador existente ou criar uma nova conta.
3. Entrar em **Tarefas e Hábitos**.
4. Criar um hábito diário, por exemplo: `Estudar 30 minutos`.
5. Confirmar que o hábito aparece como **Pendente hoje**.
6. Clicar em **Marcar como feito hoje**.
7. Confirmar que o estado muda para **Feito hoje**.
8. Clicar em **Desmarcar hoje** e confirmar que volta a ficar pendente.
9. Editar o título ou a descrição.
10. Clicar em **Ver histórico** para consultar datas concluídas e alterações.
11. Confirmar que o painel de estatísticas de hábitos atualiza os totais.

O `db.json` foi atualizado com exemplos de hábitos contendo `createdAt`, `completedDates`, `history` e `statusToday`. Estes dados servem como simulação para o Mock Server.


## Etapa 5 - Calendário simples

A página **Tarefas e Hábitos** passou a incluir uma secção final chamada **Calendário**. Esta funcionalidade foi adicionada por cima da Etapa 4, sem remover tarefas, eventos, hábitos, login, registo, JSON Server ou localStorage.

### O que o calendário mostra

O calendário apresenta uma vista mensal simples e permite navegar entre meses. Cada dia pode destacar a existência de itens associados a essa data.

O calendário mostra dados vindos de quatro fontes:

- itens próprios de calendário criados pelo utilizador;
- tarefas com data limite;
- eventos com data de início e/ou data limite;
- hábitos concluídos numa data específica.

As tarefas, eventos e hábitos aparecem apenas como informação no calendário. A edição direta dessas entidades continua a ser feita nas respetivas secções da página, para evitar duplicação de lógica e preservar o funcionamento já testado.

### Itens próprios do calendário

Cada item próprio do calendário pode conter:

- título;
- descrição opcional;
- categoria: Faculdade, Trabalho, Estudo, Teste, Apresentação, Projeto, Pessoal ou Outro;
- tipo: Aula, Trabalho, Teste, Apresentação, Projeto, Estudo, Evento pessoal ou Outro;
- data;
- horário opcional;
- data/hora de criação automática;
- histórico simples de alterações.

### Ações disponíveis

Na secção Calendário, o utilizador pode:

- navegar para o mês anterior;
- navegar para o mês seguinte;
- voltar ao dia atual;
- clicar num dia para ver os itens desse dia;
- criar item próprio de calendário;
- editar item próprio de calendário;
- remover item próprio de calendário.

### Como testar a Etapa 5

1. Abrir a app com Live Server.
2. Fazer login com um utilizador existente ou criar uma nova conta.
3. Entrar em **Tarefas e Hábitos**.
4. Descer até à secção **Calendário**.
5. Navegar entre meses com **Mês anterior** e **Mês seguinte**.
6. Clicar em **Hoje** para voltar ao mês atual.
7. Criar um item próprio, por exemplo: `Teste de JavaScript`.
8. Confirmar que o dia fica destacado no calendário.
9. Clicar no dia e confirmar que o item aparece no painel lateral.
10. Editar o item próprio de calendário.
11. Remover o item próprio de calendário.
12. Criar uma tarefa com data limite e confirmar que aparece nesse dia no calendário.
13. Criar um evento com data de início e data limite e confirmar que aparece pelo menos nesses dois dias.
14. Marcar um hábito como feito hoje e confirmar que aparece no dia atual.

O `db.json` foi atualizado com exemplos de itens de calendário contendo `id`, `userEmail`, `title`, `description`, `category`, `type`, `date`, `time`, `createdAt` e `history`. Estes dados servem como simulação para o Mock Server.

## Próximas melhorias recomendadas

- Integrar progressivamente tarefas, eventos e calendário com o `MockApiService`, se for necessário demonstrar CRUD completo no Mock Server.
- Evoluir o calendário simples para incluir notificações personalizadas e visualização mais avançada.
- Adicionar notificações com Web Notifications API.
- Criar Pomodoro totalmente customizável com horas, minutos, segundos e ciclos.
- Criar página de Motivação.
- Melhorar estatísticas com hábitos, eventos, tarefas atrasadas e calendário.

## Etapa 6 - Notificações

Nesta etapa foi adicionada uma base simples e segura de notificações para a aplicação.

### O que foi acrescentado

- Novo serviço `NotificationService.js` para centralizar:
  - pedido de permissão ao navegador;
  - notificações visuais internas;
  - notificações do navegador através da Web Notifications API;
  - leitura de lembretes guardados no utilizador;
  - verificação periódica de lembretes;
  - marcação de lembretes como enviados para evitar repetições.
- Área de notificações na página `Tarefas e Hábitos`.
- Lembretes simples para tarefas com data/hora limite.
- Lembretes simples para eventos, antes do início e antes da data limite.
- Lembretes simples para itens próprios do calendário.
- Exemplos de lembretes no `db.json`.

### Como funcionam as notificações

A aplicação usa duas camadas:

1. Notificação visual interna, em formato toast, dentro da própria aplicação.
2. Notificação do navegador, apenas se o utilizador der permissão.

As notificações do navegador funcionam enquanto a aplicação estiver aberta numa aba do navegador. Não foi usado Service Worker nem Push API, porque isso ficaria fora do objetivo desta etapa.

### Como testar

1. Abrir a aplicação com Live Server.
2. Fazer login.
3. Entrar em `Tarefas e Hábitos`.
4. Clicar em `Permitir notificações`.
5. Criar uma tarefa com data e horário limite próximos.
6. Escolher um lembrete, por exemplo `10 minutos antes` ou `No momento do prazo`.
7. Aguardar o momento do lembrete.
8. Confirmar que aparece uma notificação visual dentro da app.
9. Se o navegador tiver permissão, confirmar também a notificação do navegador.
10. Repetir o teste com eventos e itens próprios do calendário.

### Observação importante

Se a permissão do navegador for negada, a aplicação continua funcional e usa apenas as notificações visuais internas.

