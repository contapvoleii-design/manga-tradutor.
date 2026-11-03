# Manga & Comic Translator — protótipo

Aplicativo web responsivo inspirado nas referências enviadas.

## Como usar
1. Abra `index.html` no navegador ou publique no GitHub Pages.
2. Cole a URL de um capítulo na barra de pesquisa.
3. Use **Abrir site original** para visitar o capítulo.
4. No menu ⋮, escolha **Adicionar imagens do capítulo** para carregar imagens locais e ler em sequência.
5. As configurações de tema e o histórico ficam salvos neste dispositivo.

## Limitações importantes
Este é um protótipo front-end. Sites de mangá frequentemente bloqueiam incorporação e leitura automática por políticas de segurança do navegador (CORS, CSP e proteção anti-bot). Por isso, inserir uma URL não garante que o aplicativo consiga extrair as páginas ou traduzir automaticamente o capítulo. Para tradução real de texto dentro das imagens é necessário integrar um serviço de OCR/tradução e um backend/proxy autorizado, respeitando os direitos e termos do site de origem.

## Publicar no GitHub Pages
Envie `index.html`, `style.css`, `app.js` e `README.md` para a raiz do repositório. Em Settings → Pages, selecione a branch `main` e a pasta `/ (root)`.
