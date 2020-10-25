# I Blue It Analytics

Este é o repositório que contém a página de acesso da aplicação *web* I Blue It Analytics. Esta aplicação realiza as suas requisições a para a [API do I Blue It](https://github.com/LiserLine/BlueApiFunctions).

## Sobre

Esta aplicação *web* foi desenvolvida baseando-se na arquitetura SPA (Single-Page Application) utilizando algumas bibliotecas auxiliares e sem framework.

## Tecnologias Utilizadas

- [page.js](https://github.com/visionmedia/page.js) (roteamento das páginas)
- [Bootstrap 4.5.0](https://getbootstrap.com/docs/4.5/getting-started/introduction/)
- [JQuery 3.5.1](https://jquery.com/download/)
- [Highcharts](https://www.highcharts.com)
- Javascript
- [Microsoft Static Web Apps](https://azure.microsoft.com/pt-br/services/app-service/static/)

As páginas desenvolvidas utilizaram do template [SB Admin 2](https://startbootstrap.com/themes/sb-admin-2/)

## Como rodar

Como foi utilizado uma arquitetura SPA sem *framework*, a aplicação apenas necessita de um servidor http para que permita o host de uma página estática.
Durante o desenvolvimento foi utilizado a biblioteca [serve](https://www.npmjs.com/package/serve), porém existem outras bibliotecas que possuem esta funcionalidade como, por exemplo, o [http-server](https://www.npmjs.com/package/http-server).

Para rodar com o *serve*, entre com um terminal de comando na pasta raíz do projeto e digite o seguinte comando:
> npx serve

Desta forma, a biblioteca será "instalada" na memória e executará um servidor http para a aplicação;

## Mais informações

A aplicação web utiliza uma API para busca/envio de informações (API I Blue It). A definição do endereço que aplicação irá utilizar está definido como uma variável global (*window*) através do JS no arquivo principal (*app.js*). Portanto, as requisições serão feitas para as rotas que se iniciem com o endereço fornecido por esta variável global. O restante do endereço está definido em cada um dos arquivos JS que realizam os processamentos de cada uma das páginas. Ex:

    window.API_ENDPOINT = "http://localhost:7071/api"; (app.js)
    [...]$ajax({ url: url: window.API_ENDPOINT+"/token"[...] (token.js)

***Para que se consiga utilizar a aplicação (visualizar/enviar dados) é necessário que tenha-se uma instância (local ou remota) da API I Blue It e que esta contenha os dados que a aplicação web utiliza.***

*O armazenamento de dados do usuário são armazenados em variáveis de sessão.*

Para que se consiga enviar/buscar dados para a API I Blue It, por favor, verifique o seu repositório para mais informações.

### Implantação

Este projeto foi implantado na arquitetura da Static Web Apps da Microsoft. Esta arquitetura permite que a implantação seja automática a cada código novo inserido no repositório.

Porém, a implantação pode ser feita em qualquer servidor configurado para disponibilizar o arquivo *index.html* como página estática, fazendo com que a biblioteca *page.js* lide com o roteamento.
    
