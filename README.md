# ACME Assessoria Financeira Empréstimos

Este projeto tem por objetivo implementar o domínio de **gerenciamento de empréstimos** de um sistema financeiro, desenvolvido para a matéria de "Engenharia de Software" do curso de Ciências da Computação da Universidade Estadual Paulista - Unesp, ministrada pelo Prof. Dr. Erik Aceiro Antonio.

## 1. Tecnologias Utilizadas
  - NodeJS
  - MYSQL
  - Docker
  - RabbitMQ
  - Express

## 2. Pré-requisitos
  - Docker
  - WSL2
  - Insomnia
  - SQL client software application (como o DBeaver, por exemplo)


## 3. Instruções para execução
 - Acesse a pasta raiz do projeto
 - Execute o comando ```docker-compose up``` na pasta ./api
 
 ### 3.1. Para iniciar serviços externos:
 - Execute ```cd external-services/```
 - Execute ```npm i```
 - Execute ```node creditAnalysis-consumer.js```
 - Execute ```node creditAnalysis-producer.js```
 - Execute ```node financial-consumer.js```

### 3.2. Para importar a coleção de requisições e JWT da API
  - Acesse o Insomnia > configurações > data > import data
  - Importe o arquivo [imsomnia-request.json](./imsomnia-requests.json)
 

## 4. Diagramas
Os diagramas desenvolvidos podem ser acessados em visualizados em:
[diagramas](./diagramas)
