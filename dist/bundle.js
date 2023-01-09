var N=Object.defineProperty;var b=(i,t,e)=>t in i?N(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var l=(i,t,e)=>(b(i,typeof t!="symbol"?t+"":t,e),e),C=(i,t,e)=>{if(!t.has(i))throw TypeError("Cannot "+e)};var w=(i,t,e)=>{if(t.has(i))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(i):t.set(i,e)};var y=(i,t,e)=>(C(i,t,"access private method"),e);import{access as _,readFile as E,writeFile as O,constants as k}from"fs/promises";import{resolve as j}from"path";var g=j(process.cwd(),"config.json"),m,S,o=class{static async getConfig(){try{if(this.config)return this.config;let t=await E(g,"utf8");return JSON.parse(t)}catch(t){console.error("Setup#getConfig",{eventName:"SetupGetConfigError",error:t})}}static async setConfig(t){this.config=t;try{let e=JSON.stringify(this.config,null,2);await O(g,e,"utf8")}catch(e){console.error("Setup#setConfig",{eventName:"SetupSetConfigError",error:e})}}static async updateConfig(t){try{let e=await this.getConfig();await this.setConfig(Object.assign(e,t))}catch(e){console.error("Setup#updateConfig",{eventName:"SetupUpdateConfigError",error:e})}}static async init(){try{await _(g,k.F_OK)}catch{y(this,m,S).call(this)}}};m=new WeakSet,S=async function(){try{let t={host:"http://127.0.0.1",port:4003,aws_account_id:"",aws_region:"us-east-1"};await this.setConfig(t)}catch(t){console.error("Setup#createFileConfig",{eventName:"SetupCreateFileConfigError",error:t})}},w(o,m),l(o,"config");await o.init();import n from"chalk";import J from"figlet";import h from"inquirer";import T from"chalk";import{access as F,readFile as U,writeFile as P,constants as A}from"fs/promises";import{resolve as B}from"path";import x from"aws-sdk";var u=await o.getConfig(),c=class{#t;#e;constructor(t){this.#t=`arn:aws:sns:${u.aws_region}:${u.aws_account_id}:${t}`,this.#e=new x.SNS({endpoint:`${u.host}:${u.port}`})}async emit(t){try{return this.#e.publish({Message:t,TopicArn:this.#t}).promise()}catch(e){console.error("SNSTopic#emit",{eventName:"SNSTopicEmitError",error:e})}}};var f=B(process.cwd(),"topics.json"),a=class{static async listTopics(){try{let t=await U(f,"utf8");return JSON.parse(t)}catch(t){console.error("TopicUtils#listTopics",{eventName:"TopicUtilsListTopicsError",error:t})}}static async setTopic(t){try{let e=JSON.stringify(t,null,2);await P(f,e,"utf8")}catch(e){console.error("TopicUtils#setTopic",{eventName:"TopicUtilsSetTopicError",error:e})}}static async addTopic(t){try{let e=await this.listTopics();e.push(t),await this.setTopic(e)}catch(e){console.error("TopicUtils#addTopic",{eventName:"TopicUtilsAddTopicError",error:e})}}static async deleteTopic(...t){if(t?.length)try{let e=await this.listTopics();return await this.setTopic(e.filter(s=>!t.includes(s.name))),!0}catch(e){console.error("TopicUtils#deleteTopic",{eventName:"TopicUtilsDeleteTopicError",error:e})}}static prepare(t,e){this.topics=t.filter(({name:s})=>e.includes(s)).map(({name:s,request:r})=>({name:s,request:r,emitter:new c(s)}))}static async emit(){if(!this.topics.length){console.log(T.yellowBright(`
No items have been selected.`));return}try{let t=await Promise.all(this.topics.map(async({name:e,request:s,emitter:r})=>{let{MessageId:d}=await r.emit(s);return{TopicName:e,MessageId:d}}));console.log(T.greenBright(`
Topic(s) has been fired successfully!`)),console.table(t)}catch(t){console.error("TopicUtils#emit",{eventName:"TopicUtilsEmitError",...t.originalError})}}static async init(){try{await F(f,A.F_OK)}catch{this.setTopic([])}}};l(a,"topics",[]);await a.init();var p=class{constructor(t){this.version=t}async#t(){let t=h.createPromptModule(),{menu:e}=await t([{message:"Select what you wish from the menu:",name:"menu",type:"list",choices:[{value:"setup",name:"1. Setup SNS emitter"},{value:"show_settings",name:"2. Show my settings"},{value:"create_topic",name:"3. Create a new topic"},{value:"dispatch_topics",name:"4. Dispatch an topic(s)"},{value:"delete_topics",name:"5. Delete an topic(s)"},{value:"exit",name:"6. Exit"}]}]);await this.#e(e)}async#e(t){switch(t){case"setup":await this.#s();break;case"show_settings":await this.#o();break;case"create_topic":await this.#r();break;case"dispatch_topics":await this.#a();break;case"delete_topics":await this.#c();break;default:console.log(n.redBright("Thanks for use SNS Emitter! Bye."))}}async#s(){let t=h.createPromptModule();console.log(`
Fill in the fields to configure.`);let e=await t([{message:"Host:",name:"host",default:"http://127.0.0.1"},{message:"Port:",name:"port",default:4003},{message:"AWS account id",name:"aws_account_id"},{message:"AWS region",name:"aws_region",default:"us-east-1"}]);await o.updateConfig(e),await this.#t()}async#o(){let t=await o.getConfig();console.log(t),await this.#t()}async#r(){let e=await h.createPromptModule()([{message:"Topic name:",name:"name",validate:function(s){let r=this.async();if(!s){r("You need provide a name of topic.");return}r(null,!0)}},{message:"Topic request (JSON string format):",name:"request",default:'{"message":"SNS Emitter is awesome!"}',validate:function(s){let r=this.async();try{return JSON.parse(s),r(null,!0)}catch{r("You need provide a valid JSON string format.")}}}]);await a.addTopic(e),await this.#t()}async#a(){let t=await a.listTopics();if(!t.length)return console.log(n.yellowBright(`
No items found. Please, create an topic on main menu.`)),this.#t();let e=await this.#i("Select witch topics wish to dispatch:",t);a.prepare(t,e.topics),await a.emit(),await this.#t()}async#c(){let t=await a.listTopics(),e=await this.#i("Select witch topics wish to delete:",t);e.topics.length||console.log(n.yellowBright(`
No items have been selected.`)),await a.deleteTopic(...e.topics)&&console.log(n.greenBright(`
Topic(s) has been deleted successfully!`)),await this.#t()}async#i(t,e){return h.createPromptModule()([{message:t,name:"topics",type:"checkbox",choices:e.map(({name:r})=>({name:r,value:r}))}])}async run(){console.log(J.textSync("SNS Emitter")),console.log(n.redBright(`Welcome to SNS Emitter. A simple way to dispatch offline SNS events to serverless applications.
Version: ${this.version}
`)),await this.#t()}};import D from"aws-sdk";var v={name:"sns-emitter",version:"0.2.0",description:"Small library to emit SNS offline event",keywords:["sns","aws","serverless","sns-offline-sns"],author:"Tiago Guatierri <tiagovit@gmail.com",license:"MIT",type:"module",main:"dist/bundle.js",engines:{node:">=14.x"},bin:{"sns-emitter":"./bin/run.js"},publishConfig:{access:"public"},repository:{type:"git",url:"https://github.com/tiagoguatierri/sns-emitter.git"},issue:"https://github.com/tiagoguatierri/sns-emitter/issues",scripts:{preversion:"npx rimraf dist && node esbuild"},dependencies:{"aws-sdk":"2.1286.0",chalk:"5.2.0",figlet:"1.5.2",inquirer:"9.1.4"},devDependencies:{"esbuild-node-externals":"^1.6.0",glob:"^8.0.3",jest:"^29.3.1",rimraf:"^3.0.2"}};var I=await o.getConfig();D.config.update({region:I.aws_region});await new p(v.version).run();
