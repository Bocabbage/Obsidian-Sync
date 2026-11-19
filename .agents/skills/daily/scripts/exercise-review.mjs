#!/usr/bin/env node
// Read-only review plan: Agent creates missing pages, then applies the Daily-only link edits.
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
try {
  const args=process.argv.slice(2);
  if(args.length!==2||args[0]!=='--file')throw Error('Usage: exercise-review.mjs --file <daily.md>');
  const file=resolve(args[1]),markdown=readFileSync(file,'utf8');let root=dirname(file);
  while(!existsSync(join(root,'agents/schema'))||!existsSync(join(root,'workspace'))){if(root===dirname(root))throw Error('Cannot locate Vault');root=dirname(root);}
  const model=createRequire(import.meta.url)(join(root,'agents/views/overview/_views/exercise-history/model.cjs'));
  const header=markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]||'';
  if(!/^type:\s*["']?daily["']?\s*$/m.test(header))throw Error('Expected type: daily');
  const date=header.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m)?.[1];
  if(!date||isNaN(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||file.slice(root.length+1)!==`workspace/daily/${date.slice(0,4)}/${date.slice(0,7)}/${date}.daily.md`)throw Error('Invalid Daily date/path');
  const parsed=model.parse(markdown);
  let result={markdown,creates:[],issues:parsed.issues,records:parsed.rows.length};
  // Empty days need neither dependency lookup nor action pages.
  if(parsed.rows.length&&!parsed.issues.length){
    const folder=join(root,'workspace/exercises');
    const entries=existsSync(folder)?readdirSync(folder,{withFileTypes:true}):[];
    const paths=entries.filter(e=>e.isFile()&&e.name.endsWith('.md')).map(e=>`workspace/exercises/${e.name}`);
    const records=paths.length?JSON.parse(execFileSync('python3',['-c',`
import sys,json,re,yaml
out=[]
for path in sys.argv[1:]:
    with open(path,encoding='utf-8') as f: text=f.read()
    match=re.match(r'^---\\r?\\n([\\s\\S]*?)\\r?\\n---',text)
    out.append((yaml.load(match.group(1),Loader=yaml.BaseLoader) or {}) if match else {})
print(json.dumps(out,ensure_ascii=False))
`,...paths.map(p=>join(root,p))],{encoding:'utf8'})):[];
    const exercises=records.flatMap((d,i)=>{
      if(d.type!=='exercise')return [];
      if(d.aliases!=null&&(!Array.isArray(d.aliases)||d.aliases.some(a=>typeof a!=='string')))throw Error(`Invalid exercise aliases: ${paths[i]}`);
      return [{path:paths[i],title:d.title||paths[i].split('/').pop().slice(0,-3),aliases:d.aliases||[]}];
    });
    result=model.plan(markdown,date,exercises,entries.map(e=>`workspace/exercises/${e.name}`));
    if(/^status:\s*["']?closed["']?\s*$/m.test(header)&&(result.creates.length||result.markdown!==markdown))
      result={markdown,creates:[],records:parsed.rows.length,issues:['已关闭 Daily 不自动补链接或创建动作页；历史修正须明确授权']};
  }
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.issues.length)process.exitCode=2;
} catch(error){process.stderr.write(error.message+'\n');process.exitCode=1;}
