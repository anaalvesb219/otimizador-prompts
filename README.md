# Otimizador de Prompts para Imagens

Aplicação React + TypeScript + Vite com Tailwind CSS que permite otimizar prompts para geração de imagens usando a API da OpenAI. Esta ferramenta ajuda artistas e entusiastas a criar prompts mais eficazes para geradores de imagens baseados em IA como DALL-E, Midjourney e Stable Diffusion.

## Funcionalidades

- Interface com tema escuro (dark mode) para melhor experiência visual
- Campo para descrição do enredo da história
- Campo para descrição dos personagens
- Lista dinâmica de prompts para otimização (adicione quantos prompts quiser)
- Otimização de prompts usando a API da OpenAI GPT-3.5 ou GPT-4
- Design responsivo para uso em desktop e dispositivos móveis
- Feedback visual durante o processo de otimização

## Tecnologias Utilizadas

- React 18
- TypeScript
- Vite
- Tailwind CSS
- OpenAI API

## Como Executar

1. Clone este repositório
2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com sua chave da API da OpenAI:

```
VITE_OPENAI_API_KEY=sua_chave_da_api_aqui
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Acesse a aplicação em [http://localhost:5173](http://localhost:5173)

## Como Usar

1. Escreva o enredo da sua história no campo "Enredo" - seja detalhado sobre o contexto, ambiente e situação
2. Descreva seus personagens no campo "Características dos Personagens" - inclua aparência, personalidade, roupas, etc.
3. Adicione um ou mais prompts básicos para otimização - estes são seus prompts iniciais que a IA irá melhorar
4. Clique no botão "Otimizar Prompts"
5. Os prompts otimizados serão exibidos na seção inferior da página

## Como Funciona a Otimização

A aplicação envia os dados de enredo, características dos personagens e prompts iniciais para a API da OpenAI, solicitando que o modelo:

1. Analise o contexto e os personagens fornecidos
2. Identifique oportunidades para melhorar cada prompt
3. Adicione detalhes relevantes, estilos artísticos e parâmetros técnicos
4. Formate o prompt de maneira ideal para geradores de imagens

O resultado é um conjunto de prompts otimizados que tendem a produzir resultados muito melhores quando usados em geradores de imagens baseados em IA.

## Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist` e podem ser servidos em qualquer servidor web estático.

## Criando um HTML Standalone

Se você precisar de uma versão portátil da aplicação em um único arquivo HTML, siga estes passos:

1. Gere a versão de produção com `npm run build`
2. Os arquivos essenciais serão gerados na pasta `dist`:
   - `index.html` - Arquivo HTML principal
   - `assets/index-[hash].js` - JavaScript compilado
   - `assets/index-[hash].css` - CSS compilado

3. Para criar um único arquivo HTML standalone:
   - Abra o arquivo `index.html` na pasta `dist`
   - Copie o conteúdo CSS do arquivo `assets/index-[hash].css` e coloque-o dentro de uma tag `<style>` no cabeçalho do arquivo HTML
   - Copie o conteúdo JavaScript do arquivo `assets/index-[hash].js` e coloque-o dentro de uma tag `<script>` no final do arquivo HTML, antes do fechamento da tag `</body>`
   - Agora você tem um único arquivo HTML que contém toda a aplicação

4. Este arquivo HTML standalone pode ser aberto diretamente no navegador ou compartilhado sem necessidade de um servidor web.

## Personalizando a Versão Standalone

Para embutir sua chave de API na versão standalone (útil para distribuição):

1. Localize no código JavaScript a função responsável por fazer a requisição para a API da OpenAI
2. Substitua a referência à variável de ambiente por sua chave de API diretamente
   ```javascript
   // Encontre algo como:
   const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
   
   // Substitua por:
   const apiKey = "sua_chave_da_api_aqui";
   ```

Para personalizar a aparência da versão standalone:
1. Modifique as classes CSS relevantes na seção `<style>` do arquivo
2. Você pode ajustar cores, espaçamentos e fontes conforme necessário

> **Importante**: Tenha cuidado ao distribuir versões com sua chave de API embutida, pois isso pode levar a uso não autorizado e cobranças inesperadas.

## Limitações da Versão Standalone

- O arquivo HTML pode ser grande devido ao JavaScript e CSS embutidos
- Você ainda precisará de uma chave de API da OpenAI para que a funcionalidade de otimização funcione
- A chave da API deve ser configurada diretamente no arquivo se você quiser distribuí-lo já configurado
- Algumas características do React, como hot-reloading, não funcionarão na versão standalone

## Dicas de Uso

- **Detalhes importam**: Quanto mais detalhes você fornecer no enredo e descrição dos personagens, melhores serão os resultados
- **Comece simples**: Prompts iniciais podem ser simples, deixe a IA adicionar os detalhes técnicos e artísticos
- **Experimente estilos**: Mencione estilos artísticos em seus prompts iniciais para ver como a IA os desenvolve
- **Compare resultados**: Tente diferentes variações de prompts iniciais para ver como a IA os otimiza de maneiras diferentes

## Licença

Este projeto está licenciado sob a licença MIT.
