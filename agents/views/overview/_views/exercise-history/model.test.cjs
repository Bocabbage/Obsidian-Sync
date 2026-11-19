const test=require('node:test'),assert=require('node:assert/strict'),m=require('./model.cjs');
const table='## 锻炼\n| 动作 | 重量 | 组数 × 次数 / 时间 | 休息间隔 |\n|---|---|---|---|\n';
const row='| 哑铃卧推 | 单只 10 kg | 3 × 10 次 | 90 秒 |\n';
const e={path:'workspace/exercises/哑铃卧推.md',title:'哑铃卧推',aliases:['哑铃平板卧推']};
test('same-day repeated action and identical rows all survive review',()=>{
 const text='用户正文\n'+table+row+row+row.replace('10 kg','8 kg')+'\n## 小零碎\n原文';
 const plan=m.plan(text,'2026-10-27');assert.equal(plan.creates.length,1);assert.equal(plan.records,3);assert.deepEqual(plan.issues,[]);
 const parsed=m.parse(plan.markdown);assert.equal(parsed.rows.length,3);assert.deepEqual(parsed.rows.map(r=>r.weight),['单只 10 kg','单只 10 kg','单只 8 kg']);
 assert.deepEqual(parsed.rows.map(r=>r.order),[1,2,3]);assert.ok(plan.markdown.endsWith('## 小零碎\n原文'));
 const again=m.plan(plan.markdown,'2026-10-27',[e],[e.path]);assert.equal(again.markdown,plan.markdown);assert.deepEqual(again.creates,[]);
});
test('empty day skips without creating any pages',()=>{for(const text of ['## 小零碎\n',table,table+'| | | | |\n']){const p=m.plan(text,'2026-10-27');assert.equal(p.records,0);assert.deepEqual(p.creates,[]);assert.deepEqual(p.issues,[]);}});
test('explicit alias reuses existing page without changing measurements',()=>{const p=m.plan(table+row.replace('哑铃卧推','哑铃平板卧推'),'2026-10-27',[e]);assert.equal(p.creates.length,0);assert.ok(p.markdown.includes('哑铃卧推\\|哑铃平板卧推'));assert.equal(m.parse(p.markdown).rows[0].volume,'3 × 10 次');});
test('ambiguous aliases, occupied files and unsafe names reject entire plan',()=>{
 for(const [text,ex,occupied] of [[table+row,[e,{...e,path:'workspace/exercises/其他.md'}],[]],[table+row,[],[e.path]],[table+row.replace('哑铃卧推','A/B'),[],[]]]){const p=m.plan(text,'2026-10-27',ex,occupied);assert.ok(p.issues.length);assert.deepEqual(p.creates,[]);assert.equal(p.markdown,text);}
});
test('similar names remain distinct and missing values remain blank',()=>{const p=m.plan(table+'| 卧推 | | | |\n'+row,'2026-10-27',[e]);assert.equal(p.creates.length,1);assert.equal(p.creates[0].path,'workspace/exercises/卧推.md');assert.equal(m.parse(p.markdown).rows[0].weight,'');});
test('broken links, unnamed measurements and wrong column counts are visible errors',()=>{for(const r of ['| | 10kg | 3 | 60s |','| 动作A | 10kg | 3 | 60s | extra |','| [[workspace/tasks/A]] | | | |','| [[workspace/exercises/不存在]] | | | |']){assert.ok(m.plan(table+r,'2026-10-27').issues.length);}});
test('code examples/comments are ignored; repeated real sections rejected',()=>{assert.equal(m.parse('```md\n'+table+row+'```\n<!--\n'+table+row+'-->').rows.length,0);assert.ok(m.parse(table+row+table+row).issues.length);});
test('CRLF and original non-action cell formatting stay intact',()=>{const text=(table+row).replaceAll('\n','\r\n');const p=m.plan(text,'2026-10-27');assert.ok(p.markdown.includes('\r\n'));assert.ok(p.markdown.includes('| 单只 10 kg | 3 × 10 次 | 90 秒 |'));});
test('action page creation date is independent from workout date',()=>{const p=m.plan(table+row,'2026-10-01',[],[],'2026-10-27');assert.match(p.creates[0].markdown,/created: "2026-10-27"/);});
test('readonly CLI supports no-record skip and create/apply/review roundtrip',t=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'exercise-review-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(p,s)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
 fs.mkdirSync(path.join(root,'agents/schema'),{recursive:true});write('agents/views/overview/_views/exercise-history/model.cjs',fs.readFileSync(require.resolve('./model.cjs'),'utf8'));
 const file='workspace/daily/2026/2026-10/2026-10-27.daily.md',header='---\ntype: daily\ndate: "2026-10-27"\nstatus: open\n---\n';
 const script=path.resolve(__dirname,'../../../../../.agents/skills/daily/scripts/exercise-review.mjs');
 const run=()=>spawnSync(process.execPath,[script,'--file',path.join(root,file)],{encoding:'utf8'});
 write(file,header+table);assert.equal(JSON.parse(run().stdout).records,0);
 write(file,header+table+row+row);const output=run();assert.equal(output.status,0,output.stderr);const plan=JSON.parse(output.stdout);assert.equal(plan.records,2);assert.equal(fs.existsSync(path.join(root,'workspace/exercises')),false);
 for(const f of plan.creates)write(f.path,f.markdown);write(file,plan.markdown);
 const repeated=JSON.parse(run().stdout);assert.equal(repeated.markdown,plan.markdown);assert.equal(repeated.creates.length,0);
 write(file,(header+table+row).replace('status: open','status: closed'));assert.equal(run().status,2);
});
test('history view preserves every row across dates and ignores unreviewed plain names',async()=>{
 const fs=require('node:fs');const p='workspace/exercises/哑铃卧推.md';
 const linked=m.plan(table+row+row,'2026-10-27',[e]).markdown;
 const files=[{path:'workspace/daily/2026/2026-10/2026-10-27.daily.md',basename:'2026-10-27.daily',text:linked},{path:'workspace/daily/2026/2026-10/2026-10-26.daily.md',basename:'2026-10-26.daily',text:linked+row}];
 let result;
 const dv={current:()=>({file:{path:p}}),app:{vault:{adapter:{read:async()=>fs.readFileSync(require.resolve('./model.cjs'),'utf8')},getMarkdownFiles:()=>files,read:async f=>f.text}},table:(h,r)=>result={h,r},fileLink:(p,embed,label)=>label,paragraph(){}};
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 await new AsyncFunction('dv',fs.readFileSync(require.resolve('./view.js'),'utf8'))(dv);
 assert.equal(result.r.length,4);assert.deepEqual(result.r.map(r=>r[0]),['2026-10-27','2026-10-27','2026-10-26','2026-10-26']);assert.deepEqual(result.r.map(r=>r[1]),[1,2,1,2]);
});
test('Daily close check requires exercise links only for nonempty records',t=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'exercise-close-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const write=(p,s)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
 fs.mkdirSync(path.join(root,'agents/schema'),{recursive:true});write('agents/views/overview/_views/exercise-history/model.cjs',fs.readFileSync(require.resolve('./model.cjs'),'utf8'));
 const file='workspace/daily/2026/2026-10/2026-10-27.daily.md';
 const header='---\ntype: daily\ndate: "2026-10-27"\nstatus: open\n---\n> [!note] 今日心情\n> 平静\n\n';
 const script=path.resolve(__dirname,'../../../../../.agents/skills/daily/scripts/daily-review-check.mjs');
 const run=()=>JSON.parse(spawnSync(process.execPath,[script,'--file',path.join(root,file),'--format','json'],{encoding:'utf8'}).stdout);
 write(file,header+table);assert.equal(run().closeable,true);
 write(file,header+table+row+row);assert.equal(run().exerciseIssues.length,1);
 const plan=m.plan(header+table+row+row,'2026-10-27');
 for(const e of plan.creates)write(e.path,e.markdown+'\n用户补充的动作知识\n');write(file,plan.markdown);
 assert.equal(run().closeable,true);assert.equal(m.parse(fs.readFileSync(path.join(root,file),'utf8')).rows.length,2);
 assert.ok(fs.readFileSync(path.join(root,plan.creates[0].path),'utf8').endsWith('用户补充的动作知识\n'));
});
