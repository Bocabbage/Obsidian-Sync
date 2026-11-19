const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const model = require('./model.cjs');
const carry = require('../../../../../.obsidian/plugins/vault-daily-todos/model.cjs');
const date = '2026-10-21';
const a = 'workspace/tasks/TASK-202610-001.md', b = 'workspace/tasks/TASK-202610-002.md';
const path = 'workspace/task-groups/GROUP-20261021-life.md';
const daily = 'workspace/daily/2026/2026-10/2026-10-21.daily.md';
const raw = (data) => `---\n${JSON.stringify(data)}\n---\n\nUser content\n`;
const base = (extra = {}) => ({ type:'task-group',title:'Q4 LIFE',status:'open',created:date,start:'2026-10-01',end:'2026-12-31',tasks:[`[[${a.slice(0,-3)}]]`],...extra });
function fixture() {
 const files=new Map([[daily,raw({type:'daily',date,status:'open'})],[path,raw(base())],[a,raw({type:'task'})],[b,raw({type:'task'})]]), writes=[], folders=new Set(),events={},commands=[];
 let now=date,hook;
 const vault={adapter:{getBasePath:()=>'/vault'},getMarkdownFiles:()=>[...files.keys()].map(path=>({path})),getAbstractFileByPath:path=>files.has(path)||folders.has(path)?{path}:null,
 read:async f=>files.get(f.path), createFolder:async p=>folders.add(p), create:async(p,text)=>{if(files.has(p))throw Error('exists');files.set(p,text);writes.push(p);},
 process:async(f,fn)=>{if(hook){const h=hook;hook=null;h(f);}const text=fn(files.get(f.path));files.set(f.path,text);writes.push(f.path);},on:(event,fn)=>events[event]=fn};
 const sandbox={module:{exports:{}},require:name=>name==='obsidian'?{Modal:class{},Notice:class{},parseYaml:JSON.parse,stringifyYaml:d=>JSON.stringify(d)+'\n'}:{...model,today:()=>now},setTimeout,clearTimeout,crypto:{randomUUID:()=> 'new-group'}};
 vm.runInNewContext(readFileSync(require.resolve('../../../../../.obsidian/plugins/vault-daily-todos/task-groups.cjs'),'utf8'),sandbox);
 const plugin={app:{vault,workspace:{trigger(){},onLayoutReady(){},openLinkText(){},on(){}}},registerEvent(){},addCommand:c=>commands.push(c)};
 const {TaskGroups}=sandbox.module.exports(sandbox.require('obsidian'));
 return {files,writes,events,commands,service:new TaskGroups(plugin),setDate:d=>now=d,intercept:f=>hook=f};
}
test('parallel groups, future groups and end reminders',()=>{
 const groups=[model.group(base(),path),model.group(base({title:'Release',end:'2026-10-20'}),path.replace('life','release')),model.group(base({start:'2026-11-01'}),path.replace('life','future')),model.group(base({status:'closed',closed:date}),path.replace('life','closed'))];
 assert.deepEqual(model.activeGroups(groups,date).map(g=>g.title),['Q4 LIFE','Release']);
});
test('member normalization and strict invalid data checks',()=>{
 assert.deepEqual(model.group(base({tasks:[`[[${a}|A]]`,a]}),path).tasks,[a]);
 for(const change of [{end:'2026-02-30'},{tasks:['../../bad']},{status:'closed'},{closed:date},{tasks:'bad'},{start:'2026-12-31',end:'2026-10-01'}])assert.throws(()=>model.group(base(change),path));
});
test('full pool retains ungrouped and historically open tasks regardless of current status',()=>{
 const tasks=[{path:a,type:'task',created:date,status:'active'},{path:b,type:'task',created:date,status:'done',closed:'2026-10-22'},{path:'future',type:'task',created:'2026-10-22'},{path:'closed',type:'task',created:date,closed:date}];
 assert.deepEqual(model.eligibleTasks(tasks,date).map(t=>t.path),[a,b]);
});
test('snapshot freezes names/members and rejects wrong date/corruption',()=>{
 const g=model.group(base(),path),text=model.renderSnapshot(model.makeSnapshot([g],date));g.title='Changed';g.tasks=[];
 assert.equal(model.readSnapshot(text,date).groups[0].title,'Q4 LIFE');assert.deepEqual(model.readSnapshot(text,date).groups[0].tasks,[a]);
 assert.throws(()=>model.readSnapshot(text,'2026-10-22'));assert.throws(()=>model.readSnapshot('bad',date));
});
test('current snapshot is idempotent; member edits preserve Task/Daily/body',async()=>{
 const f=fixture(),d=f.files.get(daily),t=f.files.get(a);await f.service.snapshot();const count=f.writes.length;await f.service.snapshot();assert.equal(f.writes.length,count);
 await f.service.save((await f.service.readGroups())[0],{title:'Release',tasks:[`[[${b.slice(0,-3)}]]`]});
 const saved=model.readSnapshot(f.files.get(model.snapshotPath(date)),date);assert.equal(saved.groups[0].title,'Release');assert.deepEqual(saved.groups[0].tasks,[b]);
 assert.equal(f.files.get(daily),d);assert.equal(f.files.get(a),t);assert.ok(f.files.get(path).endsWith('User content\n'));
});
test('close retains members and Task state; closed groups cannot be edited',async()=>{
 const f=fixture(),before=f.files.get(a);await f.service.closeGroup(path);const r=(await f.service.readGroups())[0];
 assert.equal(r.data.status,'closed');assert.equal(r.data.closed,date);assert.equal(r.group.tasks[0],a);assert.equal(f.files.get(a),before);
 assert.equal(model.readSnapshot(f.files.get(model.snapshotPath(date)),date).groups.length,0);await assert.rejects(()=>f.service.save(r,{title:'reopen'}));
});
test('closed and past Daily snapshots remain byte-for-byte unchanged',async()=>{
 const f=fixture();await f.service.snapshot();const p=model.snapshotPath(date),old=f.files.get(p);
 f.files.set(daily,raw({type:'daily',date,status:'closed'}));await f.service.closeGroup(path);assert.equal(f.files.get(p),old);
 f.files.set(daily,raw({type:'daily',date,status:'open'}));f.setDate('2026-10-22');assert.equal(await f.service.snapshot(),false);assert.equal(f.files.get(p),old);
});
test('no invented historical snapshot or silent repair of corrupt snapshot',async()=>{
 const f=fixture();f.files.set(daily,raw({type:'daily',date,status:'closed'}));assert.equal(await f.service.snapshot(),false);assert.equal(f.files.has(model.snapshotPath(date)),false);
 f.files.set(daily,raw({type:'daily',date,status:'open'}));f.files.set(model.snapshotPath(date),'broken');await assert.rejects(()=>f.service.snapshot());assert.equal(f.files.get(model.snapshotPath(date)),'broken');
});
test('concurrent group and snapshot edits reject stale writes',async()=>{
 const f=fixture(),r=(await f.service.readGroups())[0];f.files.set(path,raw(base({title:'User edit'})));await assert.rejects(()=>f.service.save(r,{title:'Overwrite'}));assert.match(f.files.get(path),/User edit/);
 await f.service.snapshot();f.files.set(path,raw(base({title:'Next'})));f.intercept(file=>f.files.set(file.path,'Concurrent'));await assert.rejects(()=>f.service.snapshot());assert.equal(f.files.get(model.snapshotPath(date)),'Concurrent');
});
test('register lifecycle events and management commands',()=>{const f=fixture();f.service.install();assert.deepEqual(Object.keys(f.events),['create','modify','delete','rename']);assert.equal(f.commands.length,3);f.service.stop();});
test('ungrouped active Task still automatically continues',()=>{
 const task=carry.taskTodos(`---\ntype: task\nstatus: active\ntitle: Ungrouped\npriority: normal\ncreated: ${date}\n---\n## Todo\n- [ ] Next ➕ ${date} ^step-001\n`,b);
 const text=`---\ntype: daily\ndate: ${date}\nstatus: open\n---\n## 跨日任务\n${carry.MARKER}\n### 1. 高优先级\n#### WORK\n#### LIFE\n### 2. 低优先级\n#### WORK\n#### LIFE\n## 小任务\n`;
 const result=carry.planDaily({markdown:text,path:daily,date,tasks:[task],history:[]});assert.deepEqual(result.errors,[]);assert.equal(result.added.length,1);assert.ok(result.markdown.includes(b.slice(0,-3)));
});

class Element {
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.classList={add(){}};this.style={};}
 appendChild(child){this.children.push(child);}
 addEventListener(){}
 get text(){return [this.textContent||'',...this.children.map(c=>c.text)].join(' ');}
}
async function renderView({groups=[],snapshot=null,day=model.today(),status='open',manage=false}={}) {
 const root=new Element('root');let reads=0;
 const tasks=[a,b].map((path,i)=>({file:{path,name:path},type:'task',title:`Task ${i+1}`,created:'2026-01-01',priority:'normal',status:'active'}));
 const dv={container:root,current:()=>({type:'daily',date:day,status,file:{path:daily}}),pages:()=>tasks,
 app:{plugins:{getPlugin:()=>({taskGroups:{readGroups:async()=>{reads++;return groups.map(group=>({group}));}}})},workspace:{openLinkText(){}},vault:{adapter:{read:async()=>readFileSync(require.resolve('./model.cjs'),'utf8')},getAbstractFileByPath:()=>snapshot?{path:'snapshot'}:null,read:async()=>snapshot}}};
 const run=new (Object.getPrototypeOf(async function(){}).constructor)('dv','input','document',readFileSync(require.resolve('./view.js'),'utf8'));
 await run(dv,manage?{mode:'manage'}:undefined,{createElement:tag=>new Element(tag)});return {root,reads};
}
test('view shows parallel groups first and folds full pool including ungrouped task',async()=>{
 const today=model.today(),g=model.group(base({created:today,start:today}),path);
 const {root}=await renderView({groups:[g]});const sections=root.children.filter(c=>c.tag==='details');
 assert.equal(sections.length,2);assert.equal(sections[0].open,true);assert.equal(sections[1].open,false);assert.match(sections[1].text,/Task 2/);
});
test('no groups expands full pool; management mode is reachable',async()=>{
 const {root}=await renderView();assert.equal(root.children.find(c=>c.tag==='details').open,true);
 const managed=await renderView({manage:true});assert.match(managed.root.text,/还没有关注组/);
});
test('past view reads frozen group data only and never present membership',async()=>{
 const old=model.group(base(),path),snapshot=model.renderSnapshot(model.makeSnapshot([old],date));
 const {root,reads}=await renderView({groups:[],snapshot,day:date,status:'closed'});
 assert.equal(reads,0);assert.match(root.text,/Q4 LIFE/);assert.match(root.text,/只读/);assert.doesNotMatch(root.text,/创建关注组/);
});
test('missing historical snapshot leaves full pool visible with explicit notice',async()=>{
 const {root,reads}=await renderView({day:date,status:'closed'});assert.equal(reads,0);assert.match(root.text,/未保存关注组记录/);assert.match(root.text,/Task 2/);
});

test('readonly snapshot CLI and review enforce latest data, preserve historical bytes, reject missing history',t=>{
 const {mkdtempSync,mkdirSync,writeFileSync,rmSync,copyFileSync}=require('node:fs'),{tmpdir}=require('node:os'),{join,dirname,resolve}=require('node:path'),{spawnSync}=require('node:child_process');
 const root=mkdtempSync(join(tmpdir(),'task-group-review-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 const today=model.today(),dayPath=`workspace/daily/${today.slice(0,4)}/${today.slice(0,7)}/${today}.daily.md`;
 const write=(p,text)=>{mkdirSync(dirname(join(root,p)),{recursive:true});writeFileSync(join(root,p),text);};
 mkdirSync(join(root,'agents/schema'),{recursive:true});
 write('agents/views/overview/_views/task-pool/model.cjs',readFileSync(require.resolve('./model.cjs'),'utf8'));
 const dailyText=`---\ntype: daily\ndate: ${today}\nstatus: open\n---\n> [!note] 今日心情\n> 平静\n\n## 任务池\n\`\`\`dataviewjs\nawait dv.view("agents/views/overview/_views/task-pool");\n\`\`\`\n## 跨日任务\n## 小零碎\n`;
 write(dayPath,dailyText);
 const script=resolve(__dirname,'../../../../../.agents/skills/daily/scripts/task-group-snapshot.mjs');
 const check=resolve(__dirname,'../../../../../.agents/skills/daily/scripts/daily-review-check.mjs');
 const cli=()=>spawnSync(process.execPath,[script,'--file',join(root,dayPath)],{encoding:'utf8'});
 const review=()=>JSON.parse(spawnSync(process.execPath,[check,'--file',join(root,dayPath),'--format','json'],{encoding:'utf8'}).stdout);
 assert.equal(review().taskGroupIssues.length,1);
 const initial=cli();assert.equal(initial.status,0,initial.stderr);write(model.snapshotPath(today),initial.stdout);assert.equal(review().closeable,true);
 write(path,raw(base({created:today,start:today})));
 assert.equal(review().taskGroupIssues.length,1);
 const latest=cli();assert.equal(latest.status,0,latest.stderr);write(model.snapshotPath(today),latest.stdout);assert.equal(review().closeable,true);
 write(dayPath,dailyText.replace('status: open','status: closed'));
 write(path,raw(base({title:'Later edit',created:today,start:today,tasks:[]})));
 assert.equal(cli().stdout,latest.stdout);
 rmSync(join(root,model.snapshotPath(today)));const missing=cli();assert.equal(missing.status,1);assert.match(missing.stderr,/不能用当前分组补造历史/);
 assert.equal(readFileSync(join(root,dayPath),'utf8'),dailyText.replace('status: open','status: closed'));
});
