# CodeWear Mobile System

## Documentacao tecnica e evolucao do produto

O CodeWear e um sistema de comercio eletronico desenvolvido para a venda de roupas por meio de uma aplicacao mobile em React Native com TypeScript. A solucao e composta por um aplicativo mobile, localizado em `Mobile-CodeWear`, e por uma API backend, localizada em `Backend-CodeWear`. O aplicativo atende clientes e administradores, enquanto o backend concentra autenticacao, regras de negocio, acesso ao banco de dados e exposicao das APIs.

No estado atual, o cliente pode criar uma conta, realizar login, consultar o catalogo, visualizar os detalhes dos produtos, selecionar tamanho e quantidade, adicionar itens ao carrinho, alterar quantidades, remover produtos, informar o endereco de entrega, escolher a forma de pagamento e finalizar uma compra. O cliente tambem consegue consultar seu historico de pedidos, incluindo data, valor, endereco, forma de pagamento, status e itens adquiridos. O token de autenticacao e persistido no dispositivo por meio do AsyncStorage, e as rotas protegidas utilizam autenticacao Bearer.

O painel administrativo oferece consulta de indicadores de vendas, faturamento, quantidade de pedidos e clientes. Tambem permite consultar pedidos, visualizar clientes, gerenciar produtos e consultar registros de auditoria. O controle de acesso separa usuarios clientes de usuarios administradores, impedindo que operacoes administrativas sejam executadas por usuarios comuns.

A implementacao atual atende ao fluxo essencial de um e-commerce, mas ainda possui limitações para uma operacao comercial mais madura. O acompanhamento do pedido depende de consultas manuais, pois o cliente visualiza o status armazenado, mas nao recebe uma linha do tempo detalhada nem atualizacoes instantaneas. O painel administrativo apresenta indicadores e listagens, mas ainda nao oferece a geracao integrada de relatorios financeiros em PDF ou Excel. O sistema tambem possui uma implementacao inicial de cupons: o cliente informa um codigo no carrinho, o backend verifica se ele esta ativo e dentro do prazo e o desconto percentual e aplicado durante o checkout. Essa capacidade ainda deve evoluir para um motor completo, com valor minimo, limite de uso, limite por cliente, produtos elegiveis, historico e auditoria.

## Objetivo da versao 2.0

A versao 2.0 tem como objetivo transformar o CodeWear em uma plataforma de e-commerce mais rastreavel, segura e preparada para crescimento. A evolucao sera baseada no codigo existente e sera realizada de forma incremental, preservando o fluxo atual de cadastro, login, catalogo, carrinho, checkout, pedidos e administracao.

A primeira frente de evolucao sera o motor de cupons de desconto. O aplicativo continuara solicitando a validacao para apresentar ao cliente o desconto estimado, mas o backend permanecera como fonte oficial da regra. No momento do checkout, o cupom devera ser validado novamente dentro da mesma operacao transacional que verifica o estoque e cria o pedido. Essa revalidacao evita que um cupom expirado, desativado ou esgotado seja utilizado por causa de um valor antigo mantido na tela mobile.

O novo modelo de cupom devera permitir codigo, tipo de desconto, valor, data inicial, data final, valor minimo do pedido, limite total, limite por cliente, situacao ativa e restricoes por produto ou categoria. O pedido devera armazenar o cupom utilizado, o subtotal, o valor do desconto e o total final. Com isso, o sistema tera mais seguranca contra uso indevido, maior flexibilidade para campanhas promocionais e melhor capacidade de auditoria e analise financeira.

A segunda frente sera o rastreamento de pedidos em tempo real. Cada pedido devera possuir um status atual e um historico de alteracoes. Os estados previstos incluem pedido criado, pagamento confirmado, pedido em separacao, pedido enviado, pedido em transito, pedido entregue e pedido cancelado. Sempre que o administrador alterar o status, o backend devera salvar o evento e publicar uma notificacao para o cliente.

Para essa comunicacao, a recomendacao e utilizar WebSocket ou Socket.IO. O cliente permanecera conectado ao canal do proprio pedido e atualizara a interface quando receber uma nova mensagem. O banco de dados continuara sendo a fonte de verdade, portanto o aplicativo devera consultar novamente o pedido quando reconectar depois de uma falha de internet. Essa combinacao oferece atualizacao imediata sem comprometer a consistencia dos dados.

A terceira frente sera a exportacao de relatorios financeiros. O administrador devera poder informar periodo, status e forma de pagamento e solicitar um relatorio com faturamento bruto, descontos, faturamento liquido, quantidade de pedidos, ticket medio, formas de pagamento, produtos vendidos, cancelamentos e utilizacao de cupons. O backend sera responsavel por consultar os pedidos e calcular os valores. O arquivo podera ser gerado em PDF para apresentacao e arquivamento ou em Excel para analise e manipulacao dos dados.

A geracao devera criar um registro de relatorio com usuario responsavel, periodo, formato, status, data e local do arquivo. A operacao sera protegida por perfil administrativo e registrada em auditoria. Os calculos sempre serao realizados no backend, evitando que valores alterados no aplicativo influenciem o resultado financeiro.

## Arquitetura recomendada

Para esta etapa, a recomendacao tecnica e manter o backend como um monolito modular, e nao iniciar diretamente uma arquitetura de microservicos. O projeto ainda possui um dominio relativamente concentrado, e a divisao prematura em varios servicos aumentaria a complexidade de deploy, monitoramento, comunicacao, autenticacao entre servicos e tratamento de falhas de rede.

O monolito devera ser reorganizado internamente em modulos de autenticacao e usuarios, catalogo e estoque, carrinho e checkout, cupons, pedidos e rastreamento, relatorios e auditoria. Cada modulo devera concentrar seus controllers, services, validacoes e modelos, mantendo contratos de API claros. A aplicacao continuara sendo executada como um backend principal, mas as regras deixarao de ficar concentradas em controllers extensos ou na camada mobile.

Microservicos poderao ser considerados em uma etapa posterior, caso o volume de pedidos, conexoes em tempo real ou geracao de relatorios exija escalabilidade independente. O primeiro candidato a separacao seria o modulo de relatorios, por poder consumir mais CPU e memoria durante a geracao de arquivos. O modulo de notificacoes tambem poderia ser isolado se o numero de conexoes WebSocket crescer significativamente. Essa decisao devera ser baseada em metricas reais, e nao apenas em uma escolha arquitetural antecipada.

Como melhoria futura adicional, o catalogo podera receber suporte a cores e variacoes de produtos. Nesse modelo, um produto podera possuir cores, tamanhos e estoques independentes. Essa funcionalidade nao faz parte do estado atual e devera ser tratada como uma expansao posterior, depois que os modulos prioritarios estiverem estabilizados.

## MVP da versao 2.0

Sim, e possivel criar um MVP da versao 2.0. O MVP devera representar a menor entrega capaz de validar as tres melhorias com usuarios reais, mantendo o escopo controlado e sem introduzir complexidade desnecessaria.

O primeiro bloco do MVP sera o motor de cupons. A primeira versao devera suportar codigo unico, desconto percentual, validade, situacao ativa, valor minimo opcional e limite total de utilizacoes. O cliente devera validar o cupom na tela do carrinho, e o backend devera revalidar o codigo no checkout, registrar o desconto no pedido e impedir o uso quando a regra nao for atendida.

O segundo bloco sera o rastreamento de pedidos. O MVP devera possuir uma tabela de historico de status, uma rota administrativa para alterar o status e uma tela do cliente com a linha do tempo do pedido. Para a primeira entrega, a atualizacao podera ser implementada com Socket.IO. O aplicativo devera tambem consultar o pedido ao abrir a tela, garantindo que o recurso continue funcionando mesmo quando a conexao em tempo real estiver indisponivel.

O terceiro bloco sera o relatorio financeiro. O MVP devera permitir que um administrador selecione periodo e formato, solicite um relatorio e baixe um arquivo PDF ou XLSX. A primeira versao devera apresentar faturamento, quantidade de pedidos, descontos e total liquido. Filtros mais avançados e relatorios por produto ou categoria poderao ser adicionados depois da validacao inicial.

O MVP devera incluir testes de unidade para as regras de cupons, testes de integracao para checkout e relatorios e testes de autorizacao para garantir que apenas administradores possam alterar status e exportar dados. Tambem devera incluir tratamento de erro, estados de carregamento, reconexao do canal de rastreamento e registros de auditoria para operacoes sensiveis.

## Beneficios esperados

A evolucao devera aumentar a conversao por meio de campanhas promocionais mais confiaveis, reduzir inconsistencias no checkout, oferecer maior transparencia durante a entrega e diminuir a necessidade de contatos para consulta de pedidos. Para a administracao, os ganhos esperados sao maior controle operacional, melhor acompanhamento das vendas, reducao de consolidacoes manuais e disponibilidade de dados para decisoes comerciais.

A abordagem modular tambem reduz o risco tecnico. O sistema podera evoluir sem uma reescrita completa, aproveitando a autenticacao, o catalogo, o carrinho, o checkout e o painel que ja existem. A arquitetura permanecera simples o suficiente para a equipe manter, mas organizada o suficiente para receber novos modulos.

## Escopo resumido do MVP

O MVP da versao 2.0 sera considerado concluido quando o cliente conseguir aplicar um cupom valido e finalizar a compra com o desconto registrado, quando o administrador conseguir alterar o status e o cliente visualizar a atualizacao do pedido, e quando um administrador conseguir gerar e baixar um relatorio financeiro em PDF ou Excel. A entrega tambem devera garantir revalidacao no backend, controle de autorizacao, auditoria das operacoes e testes automatizados dos fluxos principais.

## Tecnologias atuais e previstas

A aplicacao mobile utiliza React Native, Expo, TypeScript, React Navigation, Axios e AsyncStorage. O backend utiliza Node.js, Express, TypeScript, Sequelize, MySQL, JWT, bcrypt e Multer. Para o MVP, recomenda-se adicionar Socket.IO para atualizacoes em tempo real, uma biblioteca de PDF, uma biblioteca de geracao XLSX e uma organizacao modular de services. O banco continuara sendo MySQL, com novas tabelas para cupons, utilizacoes de cupons, historico de rastreamento e relatorios.

A estrategia final sera evolutiva: primeiro consolidar o monolito modular, implementar e testar o MVP, acompanhar metricas de uso e somente depois avaliar a necessidade de separar modulos em microservicos. Essa decisao oferece equilibrio entre velocidade de entrega, custo de manutencao, qualidade tecnica e capacidade futura de escala.

## Como executar os projetos

Para iniciar o backend, entre no diretorio `Backend-CodeWear`, instale as dependencias e execute o modo de desenvolvimento:

```powershell
cd Backend-CodeWear
npm install
npm run dev
```

Para iniciar o aplicativo mobile, entre no diretorio `Mobile-CodeWear`, instale as dependencias e execute o Expo:

```powershell
cd Mobile-CodeWear
npm install
npm start
```

O backend utiliza a porta 3000 por padrao. A URL configurada no aplicativo deve apontar para o endereco acessivel pelo dispositivo ou emulador utilizado durante o desenvolvimento.


Ver imagens dos Diagramas: https://drive.google.com/drive/folders/1yjGMrJEw2GgVYdN2iuuPQcr1JTTY4Hty?usp=drive_link

Slides sobre Requisitos Funcionais e Não Funcionais dentro do projeto: https://canva.link/903b72320l6x5a3