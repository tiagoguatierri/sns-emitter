var _=Object.defineProperty;var E=(s,t,e)=>t in s?_(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var h=(s,t,e)=>(E(s,typeof t!="symbol"?t+"":t,e),e),j=(s,t,e)=>{if(!t.has(s))throw TypeError("Cannot "+e)};var y=(s,t,e)=>{if(t.has(s))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(s):t.set(s,e)};var T=(s,t,e)=>(j(s,t,"access private method"),e);import{access as O,readFile as k,writeFile as x,constants as U}from"fs/promises";import{resolve as F}from"path";var f=F(process.cwd(),"config.json"),d,S,a=class{static async getConfig(){try{if(this.config)return this.config;let t=await k(f,"utf8");return JSON.parse(t)}catch(t){console.error("Setup#getConfig",{eventName:"SetupGetConfigError",error:t})}}static async setConfig(t){this.config=t;try{let e=JSON.stringify(this.config,null,2);await x(f,e,"utf8")}catch(e){console.error("Setup#setConfig",{eventName:"SetupSetConfigError",error:e})}}static async updateConfig(t){try{let e=await this.getConfig();await this.setConfig(Object.assign(e,t))}catch(e){console.error("Setup#updateConfig",{eventName:"SetupUpdateConfigError",error:e})}}static async init(){try{await O(f,U.F_OK)}catch{T(this,d,S).call(this)}}};d=new WeakSet,S=async function(){try{let t={host:"http://127.0.0.1",port:4003,aws_account_id:"",aws_region:"us-east-1"};await this.setConfig(t)}catch(t){console.error("Setup#createFileConfig",{eventName:"SetupCreateFileConfigError",error:t})}},y(a,d),h(a,"config");await a.init();import n from"chalk";import q from"figlet";import u from"inquirer";import v from"chalk";import{access as B,readFile as N,writeFile as J,constants as A}from"fs/promises";import{resolve as M}from"path";import P from"aws-sdk";var p=await a.getConfig(),l=class{#t;#e;constructor(t){console.log(p.port),this.#t=`arn:aws:sns:${p.aws_region}:${p.aws_account_id}:${t}`,this.#e=new P.SNS({endpoint:`${p.host}:${p.port}`})}async emit(t){try{return this.#e.publish({Message:t,TopicArn:this.#t}).promise()}catch(e){console.error("SNSTopic#emit",{eventName:"SNSTopicEmitError",error:e})}}};var g=M(process.cwd(),"topics.json"),r=class{static async listTopics(){try{let t=await N(g,"utf8");return JSON.parse(t)}catch{return[]}}static async getTopic(t){try{let e=await N(g,"utf8");return JSON.parse(e).find(({name:o})=>o===t)}catch{}}static async updateTopic(t){try{let e=await this.listTopics(),i=e.findIndex(({name:o})=>o===t.name);e[i]=t,await this.setTopic(e)}catch(e){console.error("TopicUtils#updateTopic",{eventName:"TopicUtilsUpdateTopicError",error:e})}}static async setTopic(t){try{let e=JSON.stringify(t,null,2);await J(g,e,"utf8")}catch(e){console.error("TopicUtils#setTopic",{eventName:"TopicUtilsSetTopicError",error:e})}}static async addTopic(t){try{let e=await this.listTopics();e.push(t),await this.setTopic(e)}catch(e){console.error("TopicUtils#addTopic",{eventName:"TopicUtilsAddTopicError",error:e})}}static async deleteTopic(...t){if(t?.length)try{let e=await this.listTopics();return await this.setTopic(e.filter(i=>!t.includes(i.name))),!0}catch(e){console.error("TopicUtils#deleteTopic",{eventName:"TopicUtilsDeleteTopicError",error:e})}}static prepare(t,e){this.topics=t.filter(({name:i})=>e.includes(i)).map(({name:i,request:o})=>({name:i,request:o,emitter:new l(i)}))}static async emit(){if(!this.topics.length){console.log(v.yellowBright(`
No items have been selected.`));return}try{let t=await Promise.all(this.topics.map(async({name:e,request:i,emitter:o})=>{let{MessageId:c}=await o.emit(i);return{TopicName:e,MessageId:c}}));console.log(v.greenBright(`
Topic(s) has been fired successfully!`)),console.table(t)}catch(t){console.error("TopicUtils#emit",{eventName:"TopicUtilsEmitError",...t.originalError})}}static async init(){try{await B(g,A.F_OK)}catch{this.setTopic([])}}};h(r,"topics",[]);await r.init();var m=class{constructor(t){this.version=t}async#t(){let t=u.createPromptModule(),{menu:e}=await t([{message:"Select what you wish from the menu:",name:"menu",type:"list",choices:[{value:"setup",name:"1. Setup SNS emitter"},{value:"show_settings",name:"2. Show my settings"},{value:"create_topic",name:"3. Create a new topic"},{value:"edit_topic",name:"4. Edit a topic"},{value:"dispatch_topics",name:"5. Dispatch an topic(s)"},{value:"delete_topics",name:"6. Delete an topic(s)"},{value:"exit",name:"7. Exit"}]}]);await this.#e(e)}async#e(t){switch(t){case"setup":await this.#r();break;case"show_settings":await this.#a();break;case"create_topic":await this.#c();break;case"edit_topic":await this.#n();break;case"dispatch_topics":await this.#o();break;case"delete_topics":await this.#p();break;default:console.log(n.redBright("Thanks for use SNS Emitter! Bye.")),process.exit(0)}}async#r(){let t=u.createPromptModule();console.log(`
Fill in the fields to configure.`);let e=await t([{message:"Host:",name:"host",default:"http://127.0.0.1"},{message:"Port:",name:"port",default:4003},{message:"AWS account id",name:"aws_account_id"},{message:"AWS region",name:"aws_region",default:"us-east-1"}]);await a.updateConfig(e),await this.#t()}async#a(){let t=await a.getConfig();console.log(t),await this.#t()}async#c(){let e=await u.createPromptModule()([{message:"Topic name:",type:"input",name:"name",validate:function(i){let o=this.async();if(!i){o("You need provide a name of topic.");return}o(null,!0)}},{message:"Topic request:",name:"request",type:"editor",default:"",validate:function(i){let o=this.async();try{return JSON.parse(i),o(null,!0)}catch{o("You need provide a valid JSON string format.")}}}]);await r.addTopic(e),await this.#t()}async#n(){let t=await this.#s();if(!t.length)return t;let e=await this.#i("Select witch topic wish to edit:",t,"list"),i=await r.getTopic(e.topics),o=u.createPromptModule(),{request:c}=await o([{message:"Editor",type:"editor",name:"request",default:i.request,validate:function(C){let w=this.async();try{JSON.stringify(C),w(null,!0)}catch{w("You need provide a valid JSON.");return}}}]);return await r.updateTopic({...i,request:c}),console.log(n.greenBright(`
Topic has been updated successfully!`)),this.#t()}async#s(){let t=await r.listTopics();return t.length?t??[]:(console.log(n.yellowBright(`
No items found. Please, create an topic on main menu.`)),this.#t())}async#o(){let t=await this.#s();if(!t.length)return t;let e=await this.#i("Select witch topics wish to dispatch:",t);return e.topics.length?(r.prepare(t,e.topics),await r.emit(),this.#o()):this.#t()}async#p(){let t=await r.listTopics(),e=await this.#i("Select witch topics wish to delete:",t);e.topics.length||console.log(n.yellowBright(`
No items have been selected.`)),await r.deleteTopic(...e.topics)&&console.log(n.greenBright(`
Topic(s) has been deleted successfully!`)),await this.#t()}async#i(t,e,i="checkbox"){return u.createPromptModule()([{message:t,name:"topics",type:i,choices:e.map(({name:c})=>({name:c,value:c}))}])}async run(){console.log(q.textSync("SNS Emitter")),console.log(n.redBright(`Welcome to SNS Emitter. A simple way to dispatch offline SNS events to serverless applications.
Version: ${this.version}
`)),await this.#t()}};import D from"aws-sdk";var b={name:"sns-emitter",version:"1.0.0",description:"Small library to emit SNS offline event",keywords:["aws","aws-sdk","lambda","nodejs","serverless","sns","sns-offline-sns"],author:"Tiago Guatierri <tiagovit@gmail.com",license:"MIT",type:"module",main:"dist/bundle.js",engines:{node:">=14.x"},bin:{"sns-emitter":"./bin/index.js"},publishConfig:{access:"public"},repository:{type:"git",url:"https://github.com/tiagoguatierri/sns-emitter.git"},issue:"https://github.com/tiagoguatierri/sns-emitter/issues",scripts:{build:"npx rimraf dist && node esbuild",push:"npm version patch && git push","push-minor":"npm version minor && git push","push-major":"npm version major && git push",dev:"node --watch src/app.js"},files:["bin/**/*.js","dist/**/*.js"],dependencies:{"aws-sdk":"2.1286.0",chalk:"5.2.0",figlet:"1.5.2",inquirer:"9.1.4"},devDependencies:{"esbuild-node-externals":"^1.6.0",glob:"^8.0.3",jest:"^29.3.1",rimraf:"^3.0.2"}};var $=await a.getConfig();D.config.update({region:$.aws_region});await new m(b.version).run();
