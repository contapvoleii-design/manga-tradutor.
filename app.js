const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let historyItems=JSON.parse(localStorage.getItem('mangaHistory')||'[]'), currentUrl='';
let currentPages=[];
function saveHistory(url,title){historyItems=historyItems.filter(x=>x.url!==url);historyItems.unshift({url,title,at:new Date().toLocaleDateString('pt-BR')});historyItems=historyItems.slice(0,20);localStorage.setItem('mangaHistory',JSON.stringify(historyItems));renderHistory()}
function renderHistory(){const html=historyItems.length?historyItems.map(x=>`<div class="history-item" data-url="${escapeAttr(x.url)}"><div class="history-thumb">✧</div><small>${escapeHtml(x.title)}</small></div>`).join(''):'<p class="muted">Seus mangás acessados aparecerão aqui.</p>';$('#historyList').innerHTML=html;$('#fullHistory').innerHTML=historyItems.length?historyItems.map(x=>`<div class="history-entry" data-url="${escapeAttr(x.url)}"><b>${escapeHtml(x.title)}</b><p class="muted">${escapeHtml(x.url)} · ${x.at}</p></div>`).join(''):'<p class="muted">Nenhum histórico ainda.</p>';$$('[data-url]').forEach(el=>el.onclick=()=>openReader(el.dataset.url))}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function escapeAttr(s){return escapeHtml(s)}
function show(id){$$('.view').forEach(v=>v.classList.add('hidden'));$('#'+id).classList.remove('hidden');$$('.bottom-nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$('#popupMenu').classList.add('hidden')}
function openReader(url,title){try{let raw=String(url||'').trim();if(!/^https?:\\/\\//i.test(raw))raw='https://'+raw;let u=new URL(raw);if(!['http:','https:'].includes(u.protocol))throw 0;currentUrl=u.href;$('#addressInput').value=u.href;$('#mangaUrl').value=u.href;title=title||u.hostname;$('#readerTitle').textContent=title;$('#readerAddress').textContent=u.href;$('#chapterFrame').src=u.href;$('#urlReader').classList.remove('hidden');$('#pageArea').classList.add('hidden');$('#readerMessage').textContent='Tentando abrir o capítulo nesta tela. Se o site bloquear a visualização, toque em “Abrir site original” ou adicione as imagens pelo menu.';saveHistory(u.href,title);show('readerView')}catch(e){alert('Não consegui reconhecer esse endereço. Confira o link e tente novamente.')}}
$('#urlForm').onsubmit=e=>{e.preventDefault();openReader($('#mangaUrl').value)};
$('#addressForm').onsubmit=e=>{e.preventDefault();if($('#addressInput').value)openReader($('#addressInput').value)};
$('#addressInput').addEventListener('focus',()=>$('#addressInput').select());
$('#toolbarHome').onclick=()=>show('homeView');$('#toolbarHistory').onclick=()=>show('historyView');$('#toolbarImages').onclick=()=>$('#imageFiles').click();$('#toolbarMenu').onclick=()=>$('#popupMenu').classList.toggle('hidden');$('#toolbarSettings').onclick=()=>show('settingsView');$('#toolbarHelp').onclick=()=>alert('Use o botão de imagens para importar páginas. Depois execute o OCR e a tradução.');$('#toolbarAuto').onclick=()=>{$('#autoTranslate').checked=!$('#autoTranslate').checked;$('#settingsAuto').checked=$('#autoTranslate').checked;$('#menuAuto').checked=$('#autoTranslate').checked};$('#toolbarFullscreen').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
$('#reloadBtn')?.addEventListener('click',()=>{if(currentUrl)openReader(currentUrl)});
$('#openSource').onclick=()=>{if(currentUrl)window.open(currentUrl,'_blank','noopener')};
$('#backHome').onclick=()=>show('homeView');$('#homeBtn').onclick=()=>show('homeView');
$('#menuBtn').onclick=()=>$('#popupMenu').classList.toggle('hidden');
$$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
$('#historyTop').onclick=()=>show('historyView');$('#seeHistory').onclick=()=>show('historyView');
$$('.bottom-nav [data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));
$('#navBack').onclick=()=>history.back();$('#navForward').onclick=()=>history.forward();
$$('[data-demo]').forEach(b=>b.onclick=()=>{alert('Adicione o endereço real deste mangá na barra de pesquisa para abrir o capítulo.');$('#mangaUrl').focus()});
$('#addImages').onclick=()=>{$('#imageFiles').click();$('#popupMenu').classList.add('hidden')};
$('#imageFiles').onchange=e=>{$('#urlReader').classList.add('hidden');$('#pageArea').classList.remove('hidden');$('#chapterFrame').src='about:blank';currentPages=[...e.target.files].map(file=>({file,src:URL.createObjectURL(file),ocr:'',translated:''}));renderPages();$('#translationResults').innerHTML='';$('#translationStatus').textContent=currentPages.length+' imagem(ns) carregada(s). Toque em Reconhecer texto (OCR).'};
$('#clearHistory').onclick=()=>{if(confirm('Deseja limpar todo o histórico?')){historyItems=[];localStorage.removeItem('mangaHistory');renderHistory()}};
$$('.choice').forEach(b=>b.onclick=()=>{document.body.classList.toggle('dark',b.dataset.theme==='dark');$$('.choice').forEach(x=>x.classList.toggle('selected',x===b));localStorage.setItem('mangaTheme',b.dataset.theme)});
const savedTheme=localStorage.getItem('mangaTheme');if(savedTheme==='dark'){document.body.classList.add('dark');$$('.choice').forEach(x=>x.classList.toggle('selected',x.dataset.theme==='dark'))}
$('#settingsAuto').onchange=e=>$('#autoTranslate').checked=e.target.checked;$('#autoTranslate').onchange=e=>$('#settingsAuto').checked=e.target.checked;
$('#nextChapter').onclick=()=>{if(currentUrl){let next=currentUrl.replace(/chapter-(\d+)/i,(m,n)=>'chapter-'+(Number(n)+1));if(next!==currentUrl)openReader(next);else alert('Não consegui identificar o número do capítulo nesta URL.')}};$('#prevChapter').onclick=()=>{if(currentUrl){let prev=currentUrl.replace(/chapter-(\d+)/i,(m,n)=>'chapter-'+Math.max(1,Number(n)-1));if(prev!==currentUrl)openReader(prev);else alert('Não consegui identificar o número do capítulo nesta URL.')}};
renderHistory();

// Opções rápidas do menu, sincronizadas com as Configurações.
const menuPrefs=['menuAuto','menuLanguage','menuEngine','menuFontSize','menuFontStyle','menuDesktop','menuAds'];
function syncMenuPrefs(){
  $('#menuAuto').checked=$('#settingsAuto').checked;
  $('#menuLanguage').value=$('#targetLanguage').value;
  $('#menuEngine').value=$('#engine').value.includes('Microsoft')?'Microsoft Translator':'Google Tradutor';
  $('#menuFontSize').value=$('#fontSize').value;
  $('#menuFontStyle').value=$('#fontStyle').value;
  $('#menuDesktop').checked=$('#desktopMode').checked;
  $('#menuAds').checked=localStorage.getItem('mangaAdPreference')==='on';
  applyReadingPrefs();
}
function applyReadingPrefs(){
  const size=parseInt($('#fontSize').value,10)||100;
  document.documentElement.style.setProperty('--reader-font-size',(size/100)+'em');
  const style=$('#fontStyle').value;
  document.body.style.fontFamily=style==='Serifada'?'Georgia,serif':style==='Monoespaçada'?'monospace':'Arial,Helvetica,sans-serif';
  document.body.classList.toggle('desktop-mode',$('#desktopMode').checked);
}
$('#newTab').onclick=()=>{$('#mangaUrl').value='';show('homeView');$('#mangaUrl').focus()};
$('#menuAuto').onchange=e=>{$('#settingsAuto').checked=e.target.checked;$('#autoTranslate').checked=e.target.checked};
$('#menuLanguage').onchange=e=>$('#targetLanguage').value=e.target.value;
$('#menuEngine').onchange=e=>$('#engine').value=e.target.value==='Microsoft Translator'?'Microsoft Translator (abrir externamente)':'Google Tradutor (abrir externamente)';
$('#menuFontSize').onchange=e=>{$('#fontSize').value=e.target.value;applyReadingPrefs()};
$('#menuFontStyle').onchange=e=>{$('#fontStyle').value=e.target.value;applyReadingPrefs()};
$('#menuDesktop').onchange=e=>{$('#desktopMode').checked=e.target.checked;applyReadingPrefs()};
$('#menuAds').onchange=e=>{localStorage.setItem('mangaAdPreference',e.target.checked?'on':'off');if(e.target.checked)alert('Preferência salva. Isso não bloqueia anúncios dentro de sites externos.')};
$('#targetLanguage').onchange=()=>$('#menuLanguage').value=$('#targetLanguage').value;
$('#engine').onchange=()=>$('#menuEngine').value=$('#engine').value.includes('Microsoft')?'Microsoft Translator':'Google Tradutor';
$('#fontSize').onchange=()=>{$('#menuFontSize').value=$('#fontSize').value;applyReadingPrefs()};
$('#fontStyle').onchange=()=>{$('#menuFontStyle').value=$('#fontStyle').value;applyReadingPrefs()};
$('#desktopMode').onchange=()=>{$('#menuDesktop').checked=$('#desktopMode').checked;applyReadingPrefs()};
$('#settingsAuto').onchange=()=>{$('#menuAuto').checked=$('#settingsAuto').checked;$('#autoTranslate').checked=$('#settingsAuto').checked};
syncMenuPrefs();


// OCR e tradução das páginas importadas.
function renderPages(){
  const area=$('#pageArea'); area.innerHTML='';
  currentPages.forEach((page,i)=>{const img=document.createElement('img');img.src=page.src;img.alt='Página '+(i+1)+' do mangá';area.appendChild(img)});
}

/* Leitura de páginas públicas a partir do URL usando o Cloudflare Worker do projeto.
   O Worker precisa estar publicado e configurado uma única vez neste dispositivo. */
const WORKER_KEY='mangaWorkerEndpoint';
function getWorkerEndpoint(){
  let endpoint=localStorage.getItem(WORKER_KEY)||'';
  if(!endpoint){
    endpoint=prompt('Cole a URL do Cloudflare Worker do Manga Tradutor (ex.: https://seu-worker.workers.dev):','')||'';
    endpoint=endpoint.trim().replace(/\\/$/,'');
    if(endpoint){localStorage.setItem(WORKER_KEY,endpoint);}
  }
  return endpoint;
}
async function loadPagesFromCurrentUrl(){
  if(!currentUrl){$('#translationStatus').textContent='Abra primeiro o endereço do capítulo.';return;}
  const endpoint=getWorkerEndpoint();
  if(!endpoint){$('#translationStatus').textContent='Para localizar páginas do site, publique o cloudflare-worker.js e informe o endereço do Worker.';return;}
  const btn=$('#loadUrlPagesBtn');if(btn)btn.disabled=true;
  $('#translationStatus').textContent='Analisando o HTML público do capítulo e procurando imagens…';
  try{
    const api=new URL(endpoint);
    api.searchParams.set('url',currentUrl);
    const response=await fetch(api.href,{headers:{'Accept':'application/json'}});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'O Worker não conseguiu ler esta página.');
    const images=(data.images||[]).filter(src=>/^https?:\\/\\//i.test(src));
    if(!images.length)throw new Error(data.note||'Nenhuma imagem pública foi encontrada. Este site pode carregar páginas por JavaScript.');
    currentPages=images.map(src=>({file:src,src,ocr:'',translated:''}));
    $('#urlReader').classList.add('hidden');$('#pageArea').classList.remove('hidden');
    renderPages();
    $('#readerTitle').textContent=data.pageTitle||'Leitor de mangá';
    $('#translationStatus').textContent=images.length+' imagem(ns) encontradas. Agora toque em “Reconhecer texto (OCR)”.';
    $('#readerMessage').textContent='Páginas públicas encontradas no URL. Alguns sites carregam imagens dinamicamente ou exigem sessão; nesses casos, use o site original ou importe as imagens.';
  }catch(err){
    $('#translationStatus').textContent='Não foi possível obter as páginas: '+(err.message||'erro de conexão')+'. Você ainda pode abrir o site original ou adicionar imagens manualmente.';
  }finally{if(btn)btn.disabled=false;}
}
const loadUrlPagesButton=$('#loadUrlPagesBtn');
if(loadUrlPagesButton)loadUrlPagesButton.onclick=loadPagesFromCurrentUrl;

async function recognizePages(){
  if(!currentPages.length){$('#translationStatus').textContent='Primeiro adicione imagens pelo menu ⋮ > Adicionar imagens do capítulo.';return}
  if(!window.Tesseract){$('#translationStatus').textContent='Não foi possível carregar o mecanismo OCR. Verifique a conexão e atualize a página.';return}
  const btn=$('#recognizeBtn');btn.disabled=true;
  try{
    const worker=await Tesseract.createWorker('eng+jpn',1,{logger:m=>{if(m.status==='recognizing text')$('#translationStatus').textContent='Reconhecendo texto: '+Math.round((m.progress||0)*100)+'%'}});
    for(let i=0;i<currentPages.length;i++){
      const result=await worker.recognize(currentPages[i].file);
      currentPages[i].ocr=(result.data.text||'').trim();
      $('#translationStatus').textContent='OCR: página '+(i+1)+' de '+currentPages.length;
    }
    await worker.terminate();renderTranslationResults();
    $('#translationStatus').textContent='Reconhecimento concluído. Agora toque em “Traduzir imagens”.';
  }catch(err){$('#translationStatus').textContent='Falha no OCR: '+(err.message||'erro desconhecido')+'. Tente novamente com uma imagem mais nítida.'}
  finally{btn.disabled=false}
}
async function translatePages(){
  if(!currentPages.length){$('#translationStatus').textContent='Adicione imagens antes de traduzir.';return}
  if(currentPages.some(p=>!p.ocr))await recognizePages();
  const btn=$('#translateBtn');btn.disabled=true;
  try{
    for(let i=0;i<currentPages.length;i++){
      const page=currentPages[i];if(!page.ocr)continue;
      const lang=/[\u3040-\u30ff\u3400-\u9fff]/.test(page.ocr)?'ja':'en';
      const chunks=page.ocr.match(/[\s\S]{1,450}/g)||[];
      const translated=[];
      for(const chunk of chunks){
        const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(chunk)+'&langpair='+lang+'|pt-BR';
        const response=await fetch(url);if(!response.ok)throw new Error('Serviço de tradução indisponível');
        const data=await response.json();translated.push(data.responseData?.translatedText||'');
      }
      page.translated=translated.join('\n');
      $('#translationStatus').textContent='Traduzindo página '+(i+1)+' de '+currentPages.length;
      renderTranslationResults();
    }
    $('#translationStatus').textContent='Tradução concluída. Você pode exportar as páginas com o texto traduzido.';
  }catch(err){$('#translationStatus').textContent='Não foi possível concluir a tradução: '+(err.message||'verifique sua conexão')+'.'}
  finally{btn.disabled=false}
}
function renderTranslationResults(){
  const root=$('#translationResults');
  root.innerHTML=currentPages.map((p,i)=>'<div class="translation-results"><h3>Página '+(i+1)+'</h3><div class="original">'+escapeHtml(p.ocr||'Nenhum texto reconhecido ainda.')+'</div><div class="translated">'+escapeHtml(p.translated||'Aguardando tradução.')+'</div></div>').join('');
}
async function exportTranslatedPages(){
  const ready=currentPages.filter(p=>p.translated);
  if(!ready.length){$('#translationStatus').textContent='Traduza pelo menos uma página antes de exportar.';return}
  for(let i=0;i<ready.length;i++){
    const p=ready[i],img=new Image();img.src=p.src;
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject});
    const width=img.naturalWidth,height=img.naturalHeight;
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height+Math.max(180,Math.ceil(p.translated.length/45)*30+40);
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,canvas.height);ctx.drawImage(img,0,0,width,height);
    ctx.fillStyle='#fff';ctx.fillRect(0,height,width,canvas.height-height);ctx.fillStyle='#20212a';ctx.font='bold 24px Arial';
    let y=height+36;ctx.fillText('Tradução — Português (Brasil)',20,y);ctx.font='20px Arial';y+=34;
    const words=p.translated.split(/\s+/);let line='';
    for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>width-40){ctx.fillText(line,20,y);line=word;y+=28}else line=test}
    if(line)ctx.fillText(line,20,y);
    const link=document.createElement('a');link.download='manga-traduzido-'+(i+1)+'.png';link.href=canvas.toDataURL('image/png');link.click();
  }
  $('#translationStatus').textContent='Exportação iniciada para '+ready.length+' página(s).';
}
$('#recognizeBtn').onclick=recognizePages;
$('#translateBtn').onclick=translatePages;
$('#exportBtn').onclick=exportTranslatedPages;
