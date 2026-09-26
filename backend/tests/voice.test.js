import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../../frontend/js/zetabot-voice.js',import.meta.url),'utf8');
function fixture({recognition=true,speech=true}={}){
 const elements={};
 for(const name of ['input','mic','enabled','replay','stop','status']) {
  elements[name]={value:'',textContent:'',checked:false,disabled:false,attributes:{},events:{},
   setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this.events[k]=v;},
   removeEventListener(k){delete this.events[k];}};
 }
 const instances=[],spoken=[];
 let cancels=0;
 class Recognition {
  constructor(){instances.push(this);}
  start(){this.started=true;}
  stop(){this.onend?.();}
  abort(){this.aborted=true;}
 }
 const window={events:{},
  addEventListener(k,v){this.events[k]=v;},removeEventListener(k){delete this.events[k];},
  ...(recognition?{SpeechRecognition:Recognition}:{}),
  ...(speech?{SpeechSynthesisUtterance:class {constructor(text){this.text=text;}},
   speechSynthesis:{getVoices:()=>[{lang:'es-CL'}],speak:v=>spoken.push(v),cancel:()=>cancels++}}:{})
 };
 vm.runInNewContext(source,{window});
 const controller=window.createZetabotVoice(elements);
 return {elements,instances,spoken,window,controller,get cancels(){return cancels;}};
}
test('no activa micrófono ni voz sin interacción; dicta español y conserva borrador',()=>{
 const f=fixture();
 assert.equal(f.instances.length,0);
 f.controller.reply('Hola');
 assert.equal(f.spoken.length,0);
 f.elements.input.value='Consulta:';
 f.elements.mic.events.click();
 const r=f.instances[0];
 assert.equal(r.started,true);assert.equal(r.lang,'es-CL');
 const result=[{transcript:'mis rutas'}];result.isFinal=true;
 r.onresult({results:[result]});r.onend();
 assert.equal(f.elements.input.value,'Consulta: mis rutas');
 assert.match(f.elements.status.textContent,/Revisa/);
 assert.equal(f.elements.mic.attributes['aria-pressed'],'false');
});
test('permiso denegado informa sin borrar texto ni bloquear chat',()=>{
 const f=fixture();
 f.elements.input.value='borrador';
 f.elements.mic.events.click();
 const r=f.instances[0];r.onerror({error:'not-allowed'});r.onend();
 assert.match(f.elements.status.textContent,/denegado/);
 assert.equal(f.elements.input.value,'borrador');
 assert.equal(f.elements.mic.disabled,false);
});
test('sin soporte desactiva solamente controles incompatibles',()=>{
 const f=fixture({recognition:false,speech:false});
 assert.equal(f.elements.mic.disabled,true);
 assert.equal(f.elements.enabled.disabled,true);
 assert.equal(f.elements.input.disabled,false);
 assert.doesNotThrow(()=>f.controller.reply('Respuesta'));
});
test('lee respuesta online o local solo al activar; permite repetir y detener',()=>{
 const f=fixture();
 f.elements.enabled.checked=true;f.elements.enabled.events.change();
 f.controller.reply('**Zetabot:** **Hola**, revisa [rutas](https://example.com)');
 assert.equal(f.spoken.length,1);
 assert.equal(f.spoken[0].lang,'es-CL');
 assert.equal(f.spoken[0].text,'Hola, revisa rutas');
 f.elements.stop.events.click();
 assert.equal(f.cancels,1);
 f.elements.replay.events.click();
 assert.equal(f.spoken.length,2);
 f.elements.enabled.checked=false;f.elements.enabled.events.change();
 f.controller.reply('IA LOCAL');
 assert.equal(f.spoken.length,2);
});
test('enviar aborta dictado; navegar cancela voz y descarta eventos atrasados',()=>{
 const f=fixture();
 f.elements.mic.events.click();
 const r=f.instances[0],late=r.onresult;
 f.controller.setBusy(true);
 assert.equal(r.aborted,true);assert.equal(f.elements.mic.disabled,true);
 const result=[{transcript:'no insertar'}];result.isFinal=true;late({results:[result]});
 assert.equal(f.elements.input.value,'');
 f.controller.setBusy(false);
 f.elements.enabled.checked=true;f.controller.reply('Hola');
 f.controller.dispose();
 assert.equal(f.cancels,1);
 f.controller.reply('respuesta atrasada');
 assert.equal(f.spoken.length,1);
 assert.equal(f.window.events.pagehide,undefined);
});
test('al comenzar a dictar detiene la lectura para evitar realimentación',()=>{
 const f=fixture();f.elements.enabled.checked=true;
 f.controller.reply('Hola');f.elements.mic.events.click();
 assert.equal(f.cancels,1);assert.equal(f.instances.length,1);
});
