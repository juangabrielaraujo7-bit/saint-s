const track=document.querySelector('.services-track');
for(const [selector,direction] of [['.carousel-prev',-1],['.carousel-next',1]])document.querySelector(selector).onclick=()=>{
  const width=track.querySelector('li').offsetWidth+parseFloat(getComputedStyle(track).gap);
  const end=track.scrollLeft+track.clientWidth>=track.scrollWidth-8;
  track.scrollTo({left:direction>0&&end?0:track.scrollLeft+direction*width,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
};
const content=document.querySelector('#guided-content');
const heading=document.querySelector('#guided-title');
const description=document.querySelector('#guided-description');
const back=document.querySelector('#guided-back');
const next=document.querySelector('#guided-next');
const progress=document.querySelector('.guided-progress');
const state={step:0,brand:'',model:'',issues:[],answers:{},notes:'',name:'',phone:'',source:'',returning:''};
const titles=['Qual aparelho você precisa consertar?','Qual é a marca?','Qual é o modelo?','O que aconteceu?','Conte um pouco mais','Revise seu atendimento'];
const subtitles=['Escolha uma categoria para começar.','Selecione a marca do seu celular.','Primeiro escolha seu modelo ou informe manualmente.','Descreva com suas palavras — depois refinamos apenas o necessário.','Adicione alguma observação importante.','Confira as informações antes de continuar para o WhatsApp.'];
function node(tag,text,css){const n=document.createElement(tag);n.textContent=text??'';if(css)n.className=css;return n;}
function grid(parent=content){const g=node('div','','choice-grid');parent.append(g);return g;}
function choice(parent,title,detail,action,selected=false){
  const b=node('button','','guided-choice');b.type='button';b.setAttribute('aria-pressed',selected);
  const text=node('span');text.append(node('strong',title));if(detail)text.append(node('small',detail));
  b.append(text);b.onclick=action;parent.append(b);return b;
}
function input(label,key,tag='input'){
  const l=node('label',label),f=node(tag);f.value=state[key];f.oninput=()=>state[key]=f.value;
  l.append(f);content.append(l);return f;
}
function go(step){state.step=step;render();heading.focus({preventScroll:true});}
function diagnose(category){
  content.replaceChildren();const all=node('button','Todos os defeitos','button secondary');all.onclick=render;content.append(all,node('h3',category,'problem-heading'));
  for(const question of guideQuestions[category]){
    content.append(node('p',question.prompt,'problem-heading'));const options=grid();
    for(const answer of question.options)choice(options,answer,'',()=>{state.answers[category]??={};state.answers[category][question.prompt]=answer;diagnose(category);},state.answers[category]?.[question.prompt]===answer);
  }
  const add=node('button','Adicionar outro defeito','button secondary');add.onclick=render;content.append(add);
}
function render(){
  content.replaceChildren();heading.textContent=titles[state.step];description.textContent=subtitles[state.step];
  back.hidden=state.step===0;next.hidden=state.step<3;
  next.textContent=state.step===5?'Continuar para o WhatsApp':state.step===4?'Ver resumo':'Continuar';
  progress.setAttribute('aria-valuenow',state.step+1);progress.firstElementChild.style.width=(state.step+1)/6*100+'%';
  if(state.step===0)choice(grid(),'Celular','iPhone, Samsung, Motorola e mais',()=>go(1));
  if(state.step===1){const g=grid();for(const brand of ['Apple','Samsung','Motorola','Xiaomi','Outra marca'])choice(g,brand,'',()=>{if(state.brand!==brand)state.model='';state.brand=brand;go(2);},state.brand===brand);}
  if(state.step===2){
    const label=node('label','Pesquisar modelo'),search=node('input');search.placeholder='Ex.: iPhone 13, A55 ou SM-A556';label.append(search);content.append(label);
    const list=grid();list.classList.add('model-list');
    const names=[...new Set((guideModels[state.brand]??[]).map(m=>m.name))].filter(n=>!/iPad|Watch|Tablet|Tab /i.test(n));
    function filter(){list.replaceChildren();const q=search.value.toLowerCase().replace(/\s/g,'');for(const name of names.filter(n=>n.toLowerCase().replace(/\s/g,'').includes(q)))choice(list,name,'',()=>{state.model=name;go(3);},state.model===name);}
    search.oninput=filter;filter();
    const buttons=node('div','','guided-manual');content.append(buttons);
    choice(buttons,'Não sei o modelo','',()=>{state.model='Não sei o modelo';go(3);});
    choice(buttons,'Informar modelo manualmente','',()=>{content.replaceChildren();const f=input('Modelo do celular','model');f.maxLength=100;next.hidden=false;f.focus();});
  }
  if(state.step===3){
    const note=input('Modelo e o que aconteceu','notes');note.placeholder=state.brand+' · '+state.model;note.maxLength=1000;
    const descriptions=['Quebras, manchas, linhas ou toque','Dura pouco, aquece ou não liga','Não carrega ou há mau contato','Imagem, foco ou lente danificada','Microfone, alto-falante ou auricular','Lentidão, travamentos ou sistema','Molhou, umidade ou oxidação','Conte o que aconteceu'];
    const g=grid();Object.keys(guideQuestions).forEach((category,i)=>choice(g,category,descriptions[i],()=>{if(!state.issues.includes(category))state.issues.push(category);diagnose(category);},state.issues.includes(category)));
    if(state.issues.length){content.append(node('p','Selecionados: '+state.issues.join(', '),'problem-heading'));const clear=node('button','Limpar seleção','button secondary');clear.onclick=()=>{state.issues=[];state.answers={};render();};content.append(clear);}
  }
  if(state.step===4){const notes=input('Observações adicionais','notes','textarea');notes.rows=4;notes.maxLength=1000;}
  if(state.step===5){
    for(const [label,value,step] of [['APARELHO','Celular · '+state.brand+' · '+state.model,1],['PROBLEMAS RELATADOS',state.issues.join(', ')||state.notes,3],['OBSERVAÇÕES',state.notes||'Não informado',4]]){
      const row=node('div','','summary-row'),text=node('span'),edit=node('button','Editar','button secondary');
      text.append(node('small',label),node('p',value));edit.onclick=()=>go(step);row.append(text,edit);content.append(row);
    }
    const name=input('Seu nome *','name');name.autocomplete='name';name.maxLength=100;
    const phone=input('Telefone (opcional)','phone');phone.type='tel';phone.autocomplete='tel';phone.maxLength=30;
    for(const [label,key,options] of [['Já fez serviço com a Saint’s?','returning',['Sim','Não','Não lembro']],['Como conheceu a Saint’s? *','source',['Google / Pesquisa na internet','Instagram','Facebook','Indicação de amigos ou familiares','Já conhecia a Saint’s','Passei em frente à loja','Outro']]]){
      const select=input(label,key,'select');select.append(new Option('Selecione',''),...options.map(v=>new Option(v,v)));select.value=state[key];select.onchange=()=>state[key]=select.value;
    }
  }
}
next.onclick=()=>{
  content.querySelector('.guided-error')?.remove();
  const error=state.step===2&&!state.model.trim()?'Informe o modelo ou selecione “Não sei o modelo”.':state.step===3&&!state.issues.length&&!state.notes.trim()?'Selecione um problema ou conte o que aconteceu.':state.step===5&&(!state.name.trim()||!state.source)?'Informe seu nome e como conheceu a Saint’s.':'';
  if(error){content.append(node('p',error,'guided-error'));return;}
  if(state.step===5){
    const issues=state.issues.map(issue=>[issue,...Object.values(state.answers[issue]??{})].join(' · '));
    const message=['Olá, Saint’s! Vim pelo site e preciso de atendimento.','Aparelho: Celular · '+state.brand+' · '+state.model,'Problemas relatados: '+issues.join('; '),state.notes&&'Observações: '+state.notes,'Nome: '+state.name,state.phone&&'Telefone: '+state.phone,state.returning&&'Já sou cliente: '+state.returning,'Como conheci: '+state.source].filter(Boolean).join('\n');
    window.location.href='https://wa.me/5515988120518?text='+encodeURIComponent(message);return;
  }
  go(state.step+1);
};
back.onclick=()=>go(state.step-1);
for(const trigger of document.querySelectorAll('[data-start],[data-service]'))trigger.onclick=event=>{
  event.preventDefault();const mapping={Tela:'Tela e imagem',Bateria:'Bateria e energia'};const issue=mapping[trigger.dataset.service]??trigger.dataset.service;
  if(issue&&!state.issues.includes(issue))state.issues.push(issue);
  document.querySelector('#configurador').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});heading.focus({preventScroll:true});
};
render();
