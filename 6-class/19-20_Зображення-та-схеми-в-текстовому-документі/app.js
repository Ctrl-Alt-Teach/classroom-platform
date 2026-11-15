/* Навчальний редактор для індивідуальної роботи у 6-В. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),ed=$("document"),key="word6v-notebook-v2";
let lastRange=null,img=null,node=null,flow=null,task="";
const validClasses=["6-А","6-Б","6-В"];
let selectedClass="6-В";
const initialDocument=ed.innerHTML;
const draftsByClass=Object.create(null);
const checksByClass={"6-А":[],"6-Б":[],"6-В":[]};
function tip(s){let t=$("toast");t.textContent=s;t.hidden=false;clearTimeout(t.timer);t.timer=setTimeout(()=>t.hidden=true,3900)}
function go(tab){document.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===tab)));document.querySelectorAll(".page").forEach(p=>p.hidden=p.id!==tab+"-page");window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>go(b.dataset.tab));
function serialize(){let copy=ed.cloneNode(true);copy.querySelectorAll(".picked,.active").forEach(x=>x.classList.remove("picked","active"));return copy.innerHTML}
function activeChecks(){return [...document.querySelectorAll(selectedClass==="6-В"?"#tasks-standard [data-done]":"#tasks-easy [data-done]")]}
function captureClassWork(){
  draftsByClass[selectedClass]={html:serialize(),name:$("docTitle").value,task};
  checksByClass[selectedClass]=activeChecks().filter(c=>c.checked).map(c=>c.dataset.done);
}
function save(){
  captureClassWork();
  try{
    localStorage.setItem(key,JSON.stringify({selectedClass,documents:draftsByClass,checksByClass}));
    $("saveState").textContent="✓ Автозбережено на цьому пристрої";
  }catch(e){$("saveState").textContent="⚠ Пам’ять браузера заповнена — завантаж документ"}
  counter();
}
function counter(){let s=ed.innerText.trim();$("wordCount").textContent="Слів: "+(s?s.split(/\s+/).length:0)}
function progress(){let a=activeChecks();$("progress").textContent="Виконано місій: "+a.filter(x=>x.checked).length+" із "+a.length}
function activeTask(){$("currentTask").textContent=task?"Поточна місія: "+task:""}
function showClass(cls,initial=false){
  if(!validClasses.includes(cls))return;
  if(!initial)captureClassWork();
  selectedClass=cls;
  img=null;node=null;flow=null;lastRange=null;
  $("imageOptions").hidden=true;$("flowOptions").hidden=true;
  const draft=draftsByClass[cls]||{html:initialDocument,name:"Мій документ",task:""};
  ed.innerHTML=draft.html||initialDocument;
  $("docTitle").value=draft.name||"Мій документ";
  task=draft.task||"";
  const easy=cls!=="6-В";
  $("tasks-standard").hidden=easy;
  $("tasks-easy").hidden=!easy;
  document.querySelectorAll("[data-class-choice]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.classChoice===cls)));
  document.querySelectorAll("[data-done]").forEach(c=>c.checked=false);
  activeChecks().forEach(c=>c.checked=(checksByClass[cls]||[]).includes(c.dataset.done));
  $("classDescription").textContent=easy?cls+": три короткі місії на один урок (45 хвилин).":"6-В: шість місій на два уроки (19 і 20).";
  $("studentClass").value=cls;
  counter();progress();activeTask();
  if(!initial)save();
}
try{
  const x=JSON.parse(localStorage.getItem(key)||"null");
  if(x){
    if(x.documents&&typeof x.documents==="object"){
      validClasses.forEach(cls=>{
        if(x.documents[cls]&&typeof x.documents[cls]==="object")draftsByClass[cls]=x.documents[cls];
      });
    }else{
      // Зберігаємо всі раніше створені роботи 6-В після оновлення сайту.
      draftsByClass["6-В"]={html:x.html||initialDocument,name:x.name||"Мій документ",task:x.task||""};
    }
    if(x.checksByClass&&typeof x.checksByClass==="object"){
      validClasses.forEach(cls=>checksByClass[cls]=Array.isArray(x.checksByClass[cls])?x.checksByClass[cls]:[]);
    }else if(Array.isArray(x.checks))checksByClass["6-В"]=x.checks;
    selectedClass=validClasses.includes(x.selectedClass)?x.selectedClass:"6-В";
  }
}catch(e){}
showClass(selectedClass,true);
ed.querySelectorAll(".picked,.active").forEach(x=>x.classList.remove("picked","active"));
ed.addEventListener("input",save);$("docTitle").addEventListener("input",save);
document.querySelectorAll("[data-class-choice]").forEach(b=>b.addEventListener("click",()=>showClass(b.dataset.classChoice)));
document.querySelectorAll("[data-done]").forEach(c=>c.addEventListener("change",()=>{progress();save()}));
document.querySelectorAll("[data-start]").forEach(b=>b.addEventListener("click",()=>{task=b.dataset.start;activeTask();save();go("editor");tip("Місію обрано. Створюй документ самостійно!")}));
document.addEventListener("selectionchange",()=>{let s=window.getSelection();if(s&&s.rangeCount&&ed.contains(s.anchorNode)&&!s.anchorNode.parentElement?.closest(".flowchart"))lastRange=s.getRangeAt(0).cloneRange()});
function caret(){ed.focus();let s=window.getSelection();if(lastRange){try{s.removeAllRanges();s.addRange(lastRange);return}catch(e){}}let r=document.createRange();r.selectNodeContents(ed);r.collapse(false);s.removeAllRanges();s.addRange(r)}
function command(k,v){caret();document.execCommand(k,false,v===undefined?null:v);save()}
document.querySelectorAll("[data-cmd]").forEach(b=>{b.addEventListener("pointerdown",e=>e.preventDefault());b.addEventListener("click",()=>command(b.dataset.cmd))});
$("fontFamily").onchange=e=>command("fontName",e.target.value);
$("textSize").onchange=e=>command("fontSize",e.target.value);
$("textColor").oninput=e=>command("foreColor",e.target.value);
$("blockType").onchange=e=>command("formatBlock",e.target.value);
function insert(s){caret();document.execCommand("insertHTML",false,s);save()}
function clearSelection(){if(img)img.classList.remove("picked");if(node)node.classList.remove("active");img=null;node=null;flow=null;$("imageOptions").hidden=true;$("flowOptions").hidden=true}
function pickImage(x){clearSelection();img=x;img.classList.add("picked");$("imageOptions").hidden=false;$("imageWidth").value=String(parseInt(img.style.width,10)||50)}
function pickNode(x){clearSelection();node=x;flow=x.closest(".flowchart");x.classList.add("active");$("flowOptions").hidden=false;$("nodeLabel").value=x.querySelector(".flow-shape")?.textContent||""}
ed.addEventListener("click",e=>{const n=e.target.closest(".flow-node");if(n){pickNode(n);return}if(e.target.tagName==="IMG"){pickImage(e.target);return}clearSelection()});
$("pickImage").onclick=()=>$("imageInput").click();
function makeImage(f){return new Promise((res,rej)=>{let fr=new FileReader();fr.onerror=rej;fr.onload=()=>{let i=new Image();i.onerror=rej;i.onload=()=>{try{let ratio=Math.min(1,1150/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(i.width*ratio));c.height=Math.max(1,Math.round(i.height*ratio));let ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(i,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.78))}catch(e){rej(e)}};i.src=fr.result};fr.readAsDataURL(f)})}
$("imageInput").onchange=async e=>{let f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith("image/")||f.size>20e6){tip("Оберіть фото або малюнок до 20 МБ");e.target.value="";return}tip("Додаємо зображення…");try{let src=await makeImage(f);insert('<img alt="Ілюстрація" src="'+src+'" style="width:50%;max-width:100%;height:auto;display:inline-block;margin:5px">&nbsp;');tip("Торкнись зображення, щоб змінити розмір і розташування")}catch(e){tip("Не вдалось обробити зображення")}e.target.value=""};
$("imageWidth").onchange=e=>{if(img){img.style.width=e.target.value+"%";save()}};
document.querySelectorAll("[data-img-align]").forEach(b=>b.onclick=()=>{if(!img)return;let m=b.dataset.imgAlign;img.style.float="none";img.style.display="inline-block";img.style.margin="5px";if(m==="center"){img.style.display="block";img.style.margin="10px auto"}if(m==="left"){img.style.display="block";img.style.margin="10px auto 10px 0"}if(m==="right"){img.style.display="block";img.style.margin="10px 0 10px auto"}if(m==="wrapright"){img.style.float="right";img.style.margin="4px 0 12px 15px"}if(m==="wrapleft"){img.style.float="left";img.style.margin="4px 15px 12px 0"}save()});
$("deleteImage").onclick=()=>{if(img){img.remove();clearSelection();save()}};
function shape(kind,label){let d=document.createElement("div");d.className="flow-node";d.dataset.kind=kind;let x=document.createElement("div");x.className="flow-shape "+kind;x.textContent=label;d.append(x);return d}
function rebuild(f,arr){f.replaceChildren();arr.forEach((n,k)=>{if(k){let arrow=document.createElement("div");arrow.className="flow-arrow";arrow.textContent="↓";f.append(arrow)}f.append(n)});let hint=document.createElement("p");hint.className="flowhint";hint.textContent="Натисни на фігуру, щоб змінити напис";f.append(hint)}
$("insertFlow").onclick=()=>{insert('<div class="flowchart" contenteditable="false"><div class="flow-node" data-kind="oval"><div class="flow-shape oval">Початок</div></div><div class="flow-arrow">↓</div><div class="flow-node" data-kind="rect"><div class="flow-shape rect">Перша дія</div></div><p class="flowhint">Натисни на фігуру, щоб змінити напис</p></div><p><br></p>');tip("Схема готова. Натисни на фігуру для редагування")};
$("renameNode").onclick=()=>{if(!node)return;let label=$("nodeLabel").value.trim().slice(0,80);if(!label){tip("Впиши назву фігури");return}node.querySelector(".flow-shape").textContent=label;save();tip("Напис змінено")};
document.querySelectorAll("[data-add-node]").forEach(b=>b.onclick=()=>{if(!flow){tip("Спочатку натисни на фігуру в схемі");return}let kind=b.dataset.addNode,labels={oval:"Кінець",rect:"Наступна дія",diamond:"Умова?"},n=shape(kind,labels[kind]);let a=[...flow.querySelectorAll(".flow-node")],idx=a.indexOf(node);a.splice(idx+1,0,n);rebuild(flow,a);pickNode(n);save()});
function moveStep(dir){if(!node)return;let a=[...flow.querySelectorAll(".flow-node")],i=a.indexOf(node),j=i+dir;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];const f=flow,n=node;rebuild(f,a);pickNode(n);save()}
$("moveNodeUp").onclick=()=>moveStep(-1);$("moveNodeDown").onclick=()=>moveStep(1);
$("removeNode").onclick=()=>{if(!node)return;let f=flow;node.remove();clearSelection();let a=[...f.querySelectorAll(".flow-node")];if(a.length)rebuild(f,a);else f.remove();save()};
$("deleteFlow").onclick=()=>{if(flow&&confirm("Видалити всю схему?")){flow.remove();clearSelection();save()}};
$("addTable").onclick=()=>insert("<table><tbody>"+Array.from({length:3},()=>"<tr><td> </td><td> </td></tr>").join("")+"</tbody></table><p><br></p>");
$("newDoc").onclick=()=>{if(!confirm("Почати новий документ? Поточний буде очищено. За потреби спершу завантаж його."))return;ed.innerHTML="<h1>Мій документ</h1><p>Напиши тут текст…</p>";$("docTitle").value="Мій документ";clearSelection();lastRange=null;save();tip("Новий документ створено")};
function downloadable(){const clone=ed.cloneNode(true);clone.querySelectorAll(".picked,.active").forEach(x=>x.classList.remove("picked","active"));const title=($("docTitle").value.trim()||"Мій документ").replace(/[<>]/g,""),style='body{font:16px Arial;line-height:1.6;color:#223;max-width:820px;margin:35px auto;padding:20px}img{max-width:100%;height:auto}table{border-collapse:collapse;width:100%}td,th{border:1px solid #777;padding:7px}.flowchart{border:1px dashed #aac;border-radius:12px;padding:18px;display:flex;align-items:center;flex-direction:column;gap:2px;clear:both}.flow-node{text-align:center}.flow-shape{display:inline-flex;align-items:center;justify-content:center;min-width:140px;min-height:50px;padding:12px 18px;border:2px solid #4c77bc;background:#e3edff;color:#234}.oval{border-radius:50px;background:#d7f5e5}.rect{border-radius:8px}.diamond{clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);border:0;background:#ffefbf;padding:25px 35px}.flow-arrow{font-size:25px;color:#467}.flowhint{display:none}';return '<!doctype html><html lang="uk"><meta charset="utf-8"><title>'+title+'</title><style>'+style+'</style><body>'+clone.innerHTML+'</body></html>'}
function file(){return new File([downloadable()],($("docTitle").value.trim()||"Мій документ").replace(/[\\/:*?"<>|]/g,"_")+".html",{type:"text/html"})}
function download(f){let u=URL.createObjectURL(f),a=document.createElement("a");a.href=u;a.download=f.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1200)}
$("downloadDoc").onclick=()=>{download(file());tip("Документ завантажено як HTML")};
$("shareDoc").onclick=async()=>{let f=file();if(navigator.canShare?.({files:[f]})&&navigator.share){try{await navigator.share({files:[f],title:"Мій документ"});return}catch(e){if(e.name==="AbortError")return}}download(f);tip("Файл збережено. Надішли його вчителю звичним способом.")};
/* Надсилання роботи через зовнішній сервіс FormSubmit після підтвердження учнем. */
const sendDialog=$("sendDialog"),sendForm=$("sendForm"),nameField=$("studentName"),studentClass=$("studentClass");
try{nameField.value=localStorage.getItem("word6v-student-name")||""}catch(e){}
function closeSend(){sendDialog.hidden=true;$("sendToTeacher").focus()}
function openSend(){
  studentClass.value=selectedClass;
  const f=file();
  $("sendFileSize").textContent="Вкладення: "+f.name+" · "+(f.size/1024).toFixed(0)+" КБ";
  if(f.size>9.5*1024*1024){tip("Файл завеликий (до 10 МБ). Видали або заміни важкі зображення.");return}
  sendDialog.hidden=false;
  setTimeout(()=>nameField.focus(),0);
}
$("sendToTeacher").onclick=openSend;
$("closeSendDialog").onclick=closeSend;
$("cancelSendDialog").onclick=closeSend;
sendDialog.addEventListener("click",e=>{if(e.target===sendDialog)closeSend()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!sendDialog.hidden)closeSend()});
nameField.oninput=()=>nameField.setCustomValidity("");
sendForm.addEventListener("submit",e=>{
  e.preventDefault();
  const student=nameField.value.trim().replace(/[\r\n<>]/g," ").slice(0,100);
  const cls=studentClass.value.trim().replace(/[\r\n<>]/g," ").slice(0,20);
  if(student.length<3){nameField.setCustomValidity("Укажи ім’я та прізвище");nameField.reportValidity();return}
  nameField.setCustomValidity("");
  if(!cls){studentClass.reportValidity();return}
  const f=file();
  if(f.size>9.5*1024*1024){tip("Файл завеликий (до 10 МБ). Зменши кількість зображень.");return}
  try{
    const dt=new DataTransfer();
    dt.items.add(f);
    $("mailAttachment").files=dt.files;
    if(!$("mailAttachment").files.length)throw Error("Файл не прикріплено");
  }catch(err){
    download(f);
    tip("Не вдалось прикріпити файл. Документ завантажено — надішли його через свою пошту.");
    return;
  }
  const title=($("docTitle").value.trim()||"Мій документ").replace(/[\r\n<>]/g," ").slice(0,100);
  const checked=activeChecks().filter(x=>x.checked).map(x=>x.dataset.done).join(", ");
  $("mailSubject").value="Інформатика "+selectedClass+" · Зображення і схеми · "+student;
  $("mailDocTitle").value=title;
  $("mailProgress").value=checked||"Немає відміток";
  nameField.value=student;
  studentClass.value=cls;
  try{localStorage.setItem("word6v-student-name",student)}catch(e){}
  // HTML-форма відкриває відповідь FormSubmit у новій вкладці.
  // Лише відповідь сервісу підтвердить прийняття. Не показуємо хибного "Надіслано".
  HTMLFormElement.prototype.submit.call(sendForm);
  sendDialog.hidden=true;
  tip("Відкриється сторінка сервісу. Перевір підтвердження надсилання. Якщо його немає — повідом учителю.");
});
$("printDoc").onclick=()=>{go("editor");window.print()};
document.querySelectorAll("[data-guide]").forEach(b=>b.onclick=()=>{go("guide");document.getElementById(b.dataset.guide)?.scrollIntoView({behavior:"smooth",block:"center"})});
if(!ed.innerHTML.trim())ed.innerHTML="<h1>Мій документ</h1><p>Напиши тут текст…</p>";
})();