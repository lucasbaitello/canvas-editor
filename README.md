# Canvas Editor

Conjunto de scripts para melhorar a funcionalidade e usabilidade de editores de canvas baseados em Fabric.js.

## Descrição

Este repositório contém uma coleção de scripts desenvolvidos para corrigir problemas e adicionar recursos em editores de canvas que utilizam a biblioteca Fabric.js. Os scripts foram criados para funcionar de forma independente, permitindo que você escolha quais funcionalidades deseja adicionar ao seu projeto.

## Funcionalidades

### 🔄 Correção de Undo/Redo
- **undo-redo-fix.js**: Corrige problemas com os botões de desfazer/refazer que pararam de funcionar após atualizações.
- **inline-undo-redo.js**: Implementação alternativa que adiciona botões de undo/redo diretamente no HTML.

### 📋 Menus e Interface
- **menu-fix.js**: Corrige problemas de exibição dos menus de configuração quando elementos são selecionados.
- **order-menu-fix.js**: Implementa um menu dropdown para ordenação de objetos (frente, trás, topo, fundo).

### 🖌️ Melhorias para Objetos de Caminho (Path)
- **path-fill-fix.js**: Adiciona funcionalidades para controlar o preenchimento de objetos do tipo path.

### 🔤 Melhorias para Texto
- **text-shadow-fix.js**: Implementa controles para sombra e alinhamento em objetos de texto.

## Como Usar

1. Adicione a biblioteca Fabric.js ao seu projeto
2. Escolha os scripts que deseja utilizar
3. Inclua os scripts selecionados após o carregamento da biblioteca Fabric.js

```html
<!-- Exemplo de uso -->
<script src="fabric.js"></script>
<script src="undo-redo-fix.js"></script>
<script src="menu-fix.js"></script>
<script src="path-fill-fix.js"></script>
```

## Compatibilidade

Os scripts foram projetados para funcionar com a maioria das versões do Fabric.js, e incluem verificações e fallbacks para garantir a compatibilidade. No entanto, recomendamos testes em seu ambiente específico.

## Características Técnicas

- Scripts independentes que podem ser usados separadamente
- Comentários detalhados em português para fácil compreensão
- Implementação de tratamento de erros para uma execução robusta
- Verificações de compatibilidade entre diferentes versões do Fabric.js