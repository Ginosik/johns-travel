# Roteiro da página Dev Social Preview

Este roteiro é apenas para a página interna `/dev/social`. A função dela é facilitar a revisão dos carrosséis do Instagram antes da exportação ou publicação manual.

## Marco 1 - Área de Revisão

Status: concluído para o Dia 1

Entregas:

- [x] Adicionar `/dev/social` como rota de desenvolvimento.
- [x] Carregar o `carousel.json` gerado em `public/social/day-1/`.
- [x] Mostrar todos os PNGs renderizados do carrossel.
- [x] Mostrar legenda e texto alternativo ao lado dos assets.
- [x] Linkar para a lição estática, o preview HTML gerado e os PNGs.

Critérios de aceite:

- [x] A página carrega o Dia 1 sem navegação manual por arquivos.
- [x] O preview usa a paleta do site Conversante.
- [x] A página funciona como superfície interna de revisão antes da publicação.

## Marco 2 - Comportamento Simulado do Instagram

Status: concluído

Entregas:

- [x] Adicionar um painel de roteiro/checklist dentro da página.
- [x] Adicionar um viewport de carrossel simulado.
- [x] Adicionar controles de slide anterior/próximo.
- [x] Mostrar a contagem do slide atual e os metadados do slide selecionado.
- [x] Adicionar navegação por teclado com setas esquerda/direita.
- [x] Adicionar navegação por swipe no mobile.
- [x] Adicionar uma área de legenda simulada, mais próxima do Instagram.
- [x] Adicionar um modo compacto de preview mobile.

Critérios de aceite:

- [x] A pessoa revisora consegue passar pelo carrossel um slide por vez.
- [x] O slide selecionado permanece visível e fácil de inspecionar.
- [x] O fluxo simulado se aproxima o suficiente do Instagram para avaliar ritmo.

## Marco 3 - Decisões de Revisão

Status: concluído

Entregas:

- [x] Adicionar checkboxes de aprovação por slide.
- [x] Adicionar estados de aprovação para legenda e texto alternativo.
- [x] Persistir o estado do checklist localmente em `localStorage`.
- [x] Adicionar botão para reiniciar a revisão.
- [x] Mostrar avisos quando assets estiverem ausentes ou desatualizados.

Critérios de aceite:

- [x] O status de revisão sobrevive ao refresh da página.
- [x] Um post gerado pode ser marcado como pronto sem sair de `/dev/social`.
- [x] Assets ausentes ficam óbvios antes da exportação.

## Marco 4 - Preview do Pacote de Exportação

Status: concluído

Entregas:

- [x] Mostrar todos os arquivos que entrariam em um pacote de upload manual para Instagram.
- [x] Adicionar botões para copiar legenda e texto alternativo.
- [x] Adicionar links de download para cada PNG.
- [x] Adicionar checklist de exportação para dimensões da imagem, legenda, texto alternativo e link de destino.
- [x] Adicionar pacote de exportação baixável em um clique.

Critérios de aceite:

- [x] A página mostra claramente tudo que é necessário para publicar manualmente.
- [x] A pessoa revisora consegue copiar textos sem abrir os arquivos gerados.
- [x] A pessoa revisora consegue baixar o pacote completo do post em uma ação.

## Marco 5 - Revisão de Múltiplos Posts e Contas

Status: concluído para John Dias 1-4

Entregas:

- [x] Adicionar mais posts ao seletor conforme os assets sociais forem gerados.
- [x] Dar suporte a variantes de conta para Conversante, John e Mariana.
- [x] Mostrar legendas, CTAs e variações visuais específicas por conta.
- [x] Comparar variantes lado a lado.

Critérios de aceite:

- [x] A página consegue revisar mais do que o Dia 1.
- [x] Versões específicas por conta são fáceis de comparar.

## Marco 6 - Página em Português e Copy com Conteúdo Real dos Dias

Status: em andamento

Entregas:

- [x] Traduzir a interface interna de `/dev/social` para português.
- [x] Atualizar o gerador para usar falas reais das conversas de cada dia.
- [x] Incluir cena do dia, trecho da conversa, frase de prática e vocabulário na legenda.
- [x] Atualizar `carousel.json`, `caption.txt` e `alt-text.txt` com conteúdo menos genérico.
- [ ] Revisar manualmente o tom final de cada legenda antes de publicar.
- [ ] Adicionar variantes de legenda por conta quando Conversante, John e Mariana precisarem de vozes diferentes.

Critérios de aceite:

- [x] A página interna aparece em português para a equipe revisar.
- [x] A legenda de cada dia usa detalhes do próprio dia, não apenas um template repetido.
- [x] O preview mostra trechos reais da conversa para julgar se o post está interessante.
- [ ] Cada conta pode futuramente receber uma versão de copy própria sem duplicar o fluxo de geração.

## Próximo Passo Atual

Revisar visualmente os carrosséis dos Dias 1-4 depois da nova geração, ajustar o tom das legendas em português e preparar metadados de agendamento por conta antes de avançar para uma integração com publicação no Meta.
