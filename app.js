const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let historyItems=JSON.parse(localStorage.getItem('mangaHistory')||'[]'), currentUrl='', selectedChapterImages=[];
function saveHistory(url,title){historyItems=historyItems.filter(x=>x.url!==url);historyItems.unshift({url,title,at:new Date().toLocaleDateString('pt-BR')});historyItems=historyItems.slice(0,20);localStorage.setItem('mangaHistory',JSON.stringify(historyItems));renderHistory()}
function renderHistory(){const html=historyItems.length?historyItems.map(x=>`<div class="history-item" data-url="${escapeAttr(x.url)}"><div class="history-thumb">✧</div><small>${escapeHtml(x.title)}</small></div>`).join(''):'<p class="muted">Seus mangás acessados aparecerão aqui.</p>';$('#historyList').innerHTML=html;$('#fullHistory').innerHTML=historyItems.length?historyItems.map(x=>`<div class="history-entry" data-url="${escapeAttr(x.url)}"><b>${escapeHtml(x.title)}</b><p class="muted">${escapeHtml(x.url)} · ${x.at}</p></div>`).join(''):'<p class="muted">Nenhum histórico ainda.</p>';$$('[data-url]').forEach(el=>el.onclick=()=>openReader(el.dataset.url))}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function escapeAttr(s){return escapeHtml(s)}
function show(id){$$('.view').forEach(v=>v.classList.add('hidden'));$('#'+id).classList.remove('hidden');$$('.bottom-nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$('#popupMenu').classList.add('hidden')}
function openReader(url,title){try{const u=new URL(url);if(!['http:','https:'].includes(u.protocol))throw 0;currentUrl=u.href;title=title||u.hostname;$('#readerAddress').value=u.href;$('#pageArea').innerHTML='<div class="empty-reader"><span>🌐</span><b>Capítulo externo</b><p>Por segurança, sites externos não podem ser traduzidos dentro desta página. Abra o capítulo no site original e adicione capturas/imagens aqui para usar o OCR e a tradução.</p><a class="secondary-btn" href="'+escapeAttr(u.href)+'" target="_blank" rel="noopener noreferrer">Abrir capítulo no site</a></div>';$('#readerMessage').textContent='Para traduzir, carregue as imagens do capítulo. Alguns sites bloqueiam leitura automática por outros aplicativos.';saveHistory(u.href,title);show('readerView')}catch(e){alert('Digite um endereço válido começando com https://')}}
function openTranslatedPage(url){$('#readerMessage').textContent='A tradução automática de páginas externas foi desativada: o site de origem impede acesso seguro pelo navegador integrado. Abra o capítulo e adicione as imagens para traduzir.';}
$('#urlForm').onsubmit=e=>{e.preventDefault();openReader($('#mangaUrl').value)};
$('#readerMenuBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();$('#popupMenu').classList.toggle('hidden')});$('#reloadPage').onclick=()=>{if(currentUrl)window.open(currentUrl,'_blank','noopener,noreferrer')};
$('#backHome').onclick=()=>show('homeView');$('#homeBtn').onclick=()=>show('homeView');
$('#menuBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();$('#popupMenu').classList.toggle('hidden')});
$$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
$('#historyTop').onclick=()=>show('historyView');$('#seeHistory').onclick=()=>show('historyView');
$('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));$('#bottomMenuBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();$('#popupMenu').classList.toggle('hidden')});
$('#navBack').onclick=()=>history.back();$('#navForward').onclick=()=>history.forward();
$$('[data-demo]').forEach(b=>b.onclick=()=>{alert('Adicione o endereço real deste mangá na barra de pesquisa para abrir o capítulo.');$('#mangaUrl').focus()});
$('#addImages').onclick=()=>{$('#imageFiles').click();$('#popupMenu').classList.add('hidden')};
$('#imageFiles').onchange=e=>{selectedChapterImages=[...e.target.files];if(!selectedChapterImages.length)return;const area=$('#pageArea');area.innerHTML='';selectedChapterImages.forEach(file=>{const img=document.createElement('img');img.src=URL.createObjectURL(file);img.alt='Página do mangá';area.appendChild(img)});$('#ocrResults').classList.remove('hidden');$('#ocrResults').innerHTML='<p>Imagens carregadas. Toque em Traduzir capítulo para reconhecer e traduzir os textos.</p>';};
$('#clearHistory').onclick=()=>{if(confirm('Deseja limpar todo o histórico?')){historyItems=[];localStorage.removeItem('mangaHistory');renderHistory()}};
$$('.choice').forEach(b=>b.onclick=()=>{document.body.classList.toggle('dark',b.dataset.theme==='dark');$$('.choice').forEach(x=>x.classList.toggle('selected',x===b));localStorage.setItem('mangaTheme',b.dataset.theme)});
const savedTheme=localStorage.getItem('mangaTheme');if(savedTheme==='dark'){document.body.classList.add('dark');$$('.choice').forEach(x=>x.classList.toggle('selected',x.dataset.theme==='dark'))}

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
$('#menuAuto').onchange=e=>{$('#settingsAuto').checked=e.target.checked};
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
$('#settingsAuto').onchange=()=>{$('#menuAuto').checked=$('#settingsAuto').checked};
syncMenuPrefs();


// Tradução OCR: reconhece cada imagem e traduz o texto detectado.
$('#translateChapterBtn')?.addEventListener('click',()=>{
  if(selectedChapterImages.length){translateChapterImages();}
  else{
    $('#readerMessage').textContent='Primeiro escolha as imagens do capítulo. Depois toque em Traduzir imagens.';
    $('#imageFiles').click();
  }
});
const autoMode=$('#autoTranslateMode');
if(autoMode){
  autoMode.checked=localStorage.getItem('mangaAutoTranslateMode')==='on';
  autoMode.addEventListener('change',()=>{
    localStorage.setItem('mangaAutoTranslateMode',autoMode.checked?'on':'off');
    if(autoMode.checked&&currentUrl)openTranslatedPage(currentUrl);
  });
}
function splitForTranslation(text,maxLength=400){
  const parts=[];
  const paragraphs=text.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  for(const paragraph of paragraphs){
    if(paragraph.length<=maxLength){parts.push(paragraph);continue;}
    const sentences=paragraph.match(/[^.!?。！？]+[.!?。！？]?/g)||[paragraph];
    let current='';
    for(const sentence of sentences){
      if((current+' '+sentence).trim().length>maxLength&&current){
        parts.push(current.trim());current='';
      }
      let rest=sentence.trim();
      while(rest.length>maxLength){
        if(current){parts.push(current.trim());current='';}
        parts.push(rest.slice(0,maxLength));rest=rest.slice(maxLength);
      }
      current=(current+' '+rest).trim();
    }
    if(current)parts.push(current);
  }
  return parts;
}
async function requestTranslation(text,source,target){
  const endpoint='https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+encodeURIComponent(source+'|'+target);
  const response=await fetch(endpoint,{method:'GET',headers:{'Accept':'application/json'}});
  if(!response.ok)throw new Error('O serviço de tradução respondeu com erro HTTP '+response.status+'.');
  const data=await response.json();
  if(data.quotaFinished)throw new Error('A cota diária gratuita de tradução foi atingida. Tente novamente amanhã.');
  if(data.responseStatus!==200)throw new Error(data.responseDetails||'O serviço não conseguiu traduzir este trecho.');
  const translated=data.responseData?.translatedText;
  if(!translated)throw new Error('O serviço de tradução retornou um texto vazio.');
  return translated;
}
async function translateChapterImages(){
  if(!selectedChapterImages.length){$('#imageFiles').click();return;}
  if(!window.Tesseract){
    $('#readerMessage').textContent='O OCR ainda está carregando. Verifique sua internet e tente novamente.';
    return;
  }
  const btn=$('#translateImagesBtn');
  const chapterBtn=$('#translateChapterBtn');
  const out=$('#ocrResults');
  const originalLabel=btn.textContent;
  btn.disabled=true;
  chapterBtn.disabled=true;
  out.classList.remove('hidden');
  out.innerHTML='<p>Preparando o reconhecimento das páginas...</p>';
  try{
    const sourceCode=$('#ocrLanguage')?.value||'eng';
    const sourceMap={eng:'en',jpn:'ja',kor:'ko',chi_sim:'zh-CN',spa:'es',fra:'fr',deu:'de'};
    const targetMap={'Português (Brasil)':'pt-BR','English':'en','Español':'es','日本語':'ja'};
    const source=sourceMap[sourceCode]||'en';
    const target=targetMap[$('#targetLanguage').value]||'pt-BR';
    const blocks=[];
    for(let i=0;i<selectedChapterImages.length;i++){
      const file=selectedChapterImages[i];
      btn.textContent='⏳ OCR página '+(i+1)+'/'+selectedChapterImages.length;
      out.innerHTML='<p>Reconhecendo o texto da página '+(i+1)+' de '+selectedChapterImages.length+'...</p>';
      const result=await Tesseract.recognize(file,sourceCode,{
        logger:message=>{
          if(message.status==='recognizing text'){
            const percent=Math.round((message.progress||0)*100);
            out.innerHTML='<p>Reconhecendo página '+(i+1)+' de '+selectedChapterImages.length+': '+percent+'%</p>';
          }
        }
      });
      const original=(result.data.text||'').trim();
      if(!original){
        blocks.push('<section><h3>Página '+(i+1)+'</h3><p>Não encontrei texto legível. Confira se o idioma do OCR está correto.</p></section>');
        continue;
      }
      const chunks=splitForTranslation(original);
      const translated=[];
      for(let j=0;j<chunks.length;j++){
        btn.textContent='🌐 Traduzindo página '+(i+1)+'/'+selectedChapterImages.length;
        translated.push(await requestTranslation(chunks[j],source,target));
      }
      blocks.push('<section><h3>Página '+(i+1)+'</h3><p><b>Texto reconhecido:</b><br>'+escapeHtml(original).replace(/\n/g,'<br>')+'</p><p><b>Tradução:</b><br>'+escapeHtml(translated.join('\n')).replace(/\n/g,'<br>')+'</p></section>');
      out.innerHTML=blocks.join('');
    }
    out.innerHTML=blocks.length?blocks.join(''):'<p>Nenhum texto foi encontrado nas imagens.</p>';
    $('#readerMessage').textContent='Processamento concluído. Confira o texto reconhecido e a tradução abaixo das páginas.';
  }catch(err){
    out.innerHTML='<p>Não foi possível concluir a tradução: '+escapeHtml(err.message||'verifique sua internet e tente novamente')+'</p>';
    $('#readerMessage').textContent='A tradução foi interrompida. Confira a mensagem exibida abaixo.';
  }finally{
    btn.disabled=false;
    chapterBtn.disabled=false;
    btn.textContent=originalLabel||'🖼️ Traduzir imagens';
  }
}
$('#translateImagesBtn')?.addEventListener('click',translateChapterImages);
