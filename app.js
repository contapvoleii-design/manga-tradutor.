const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let historyItems=JSON.parse(localStorage.getItem('mangaHistory')||'[]'), currentUrl='', selectedChapterImages=[];
function saveHistory(url,title){historyItems=historyItems.filter(x=>x.url!==url);historyItems.unshift({url,title,at:new Date().toLocaleDateString('pt-BR')});historyItems=historyItems.slice(0,20);localStorage.setItem('mangaHistory',JSON.stringify(historyItems));renderHistory()}
function renderHistory(){const html=historyItems.length?historyItems.map(x=>`<div class="history-item" data-url="${escapeAttr(x.url)}"><div class="history-thumb">✧</div><small>${escapeHtml(x.title)}</small></div>`).join(''):'<p class="muted">Seus mangás acessados aparecerão aqui.</p>';$('#historyList').innerHTML=html;$('#fullHistory').innerHTML=historyItems.length?historyItems.map(x=>`<div class="history-entry" data-url="${escapeAttr(x.url)}"><b>${escapeHtml(x.title)}</b><p class="muted">${escapeHtml(x.url)} · ${x.at}</p></div>`).join(''):'<p class="muted">Nenhum histórico ainda.</p>';$$('[data-url]').forEach(el=>el.onclick=()=>openReader(el.dataset.url))}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function escapeAttr(s){return escapeHtml(s)}
function show(id){$$('.view').forEach(v=>v.classList.add('hidden'));$('#'+id).classList.remove('hidden');$$('.bottom-nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$('#popupMenu').classList.add('hidden')}
function openReader(url,title){try{let u=new URL(url);if(!['http:','https:'].includes(u.protocol))throw 0;currentUrl=u.href;title=title||u.hostname;$('#readerAddress').value=u.href;$('#pageArea').innerHTML='<iframe class="manga-frame" title="Leitor do site de mangá" referrerpolicy="no-referrer" allow="fullscreen" loading="eager"></iframe>';const frame=$('#pageArea iframe');frame.src=u.href;$('#readerMessage').textContent='Carregando capítulo...';saveHistory(u.href,title);show('readerView')}catch(e){alert('Digite um endereço válido começando com https://')}}
$('#urlForm').onsubmit=e=>{e.preventDefault();openReader($('#mangaUrl').value)};
$('#readerMenuBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();$('#popupMenu').classList.toggle('hidden')});$('#reloadPage').onclick=()=>{const f=$('#pageArea iframe');if(f)f.src=currentUrl};
$('#backHome').onclick=()=>show('homeView');$('#homeBtn').onclick=()=>show('homeView');
$('#menuBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();$('#popupMenu').classList.toggle('hidden')});
$$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
$('#historyTop').onclick=()=>show('historyView');$('#seeHistory').onclick=()=>show('historyView');
$('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));$('#bottomMenuBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();$('#popupMenu').classList.toggle('hidden')});
$('#navBack').onclick=()=>history.back();$('#navForward').onclick=()=>history.forward();
$$('[data-demo]').forEach(b=>b.onclick=()=>{alert('Adicione o endereço real deste mangá na barra de pesquisa para abrir o capítulo.');$('#mangaUrl').focus()});
$('#addImages').onclick=()=>{$('#imageFiles').click();$('#popupMenu').classList.add('hidden')};
$('#imageFiles').onchange=e=>{selectedChapterImages=[...e.target.files];const area=$('#pageArea');area.innerHTML='';selectedChapterImages.forEach(file=>{const img=document.createElement('img');img.src=URL.createObjectURL(file);img.alt='Página do mangá';area.appendChild(img)});$('#ocrResults').classList.add('hidden');};
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


// Botão de tradução da página atual pelo Google Tradutor.
$('#translateChapterBtn')?.addEventListener('click',()=>{
  if(!currentUrl){alert('Abra um capítulo primeiro.');return;}
  const translateUrl='https://translate.google.com/translate?sl=auto&tl=pt&u='+encodeURIComponent(currentUrl);
  window.open(translateUrl,'_blank','noopener');
});


// OCR: reconhece texto nas imagens escolhidas e traduz para português.
async function translateChapterImages(){
 if(!selectedChapterImages.length){$('#imageFiles').click();return;}
 if(!window.Tesseract){alert('O leitor de texto ainda está carregando. Tente novamente em alguns segundos.');return;}
 const btn=$('#translateImagesBtn'),out=$('#ocrResults');btn.disabled=true;btn.textContent='⏳ Lendo imagens...';out.classList.remove('hidden');out.innerHTML='<p>Reconhecendo os textos das páginas...</p>';
 try{
  const blocks=[];
  for(let i=0;i<selectedChapterImages.length;i++){
   btn.textContent='⏳ Página '+(i+1)+'/'+selectedChapterImages.length;
   const result=await Tesseract.recognize(selectedChapterImages[i],'eng');
   const original=(result.data.text||'').trim();
   if(!original)continue;
   const chunks=original.match(/[\\s\\S]{1,450}/g)||[original];
   const translated=[];
   for(const chunk of chunks){
    const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(chunk)+'&langpair=en|pt-BR';
    const response=await fetch(url);if(!response.ok)throw new Error('Falha no serviço de tradução');
    const data=await response.json();translated.push(data.responseData?.translatedText||'Não foi possível traduzir este trecho.');
   }
   blocks.push('<section><h3>Página '+(i+1)+'</h3><p><b>Original:</b><br>'+escapeHtml(original)+'</p><p><b>Português:</b><br>'+escapeHtml(translated.join(' '))+'</p></section>');
  }
  out.innerHTML=blocks.length?blocks.join(''):'<p>Não encontrei texto legível nas imagens.</p>';
 }catch(err){out.innerHTML='<p>Não foi possível concluir. Verifique sua internet e tente novamente.</p>';}
 finally{btn.disabled=false;btn.textContent='🖼️ Traduzir imagens';}
}
$('#translateImagesBtn')?.addEventListener('click',translateChapterImages);
