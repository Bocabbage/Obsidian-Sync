"use strict";
const HEADERS = ["动作", "重量", "组数 × 次数 / 时间", "休息间隔"];
function cells(line) {
  return line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(s => s.trim().replace(/\\\|/g, '|'));
}
function parse(markdown) {
  const rows = [], issues = [], lines = markdown.split(/\r?\n/);
  const visible = markdown.replace(/<!--[\s\S]*?-->/g, s=>s.replace(/[^\r\n]/g,' ')).split(/\r?\n/);
  let section = false, fence = '', table = false, count = 0;
  for (let i=0;i<lines.length;i++) {
    const line=visible[i], token=line.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if(token){if(!fence)fence=token;else if(token[0]===fence[0]&&token.length>=fence.length)fence='';continue;}
    if(fence)continue;
    if(/^#{1,2} /.test(line)){section=line.trim()==='## 锻炼';table=false;if(section&&++count>1)issues.push('重复的锻炼栏目');continue;}
    if(!section)continue;
    if(!line.trim().startsWith('|')){if(line.trim())table=false;continue;}
    const values=cells(line);
    if(values[0]==='动作'){
      table=values.length===4&&values[1]==='重量'&&['组数 × 次数 / 时间','组数/时间','组数 / 时间'].includes(values[2])&&values[3]==='休息间隔';
      if(!table)issues.push(`L${i+1}：锻炼表头须为四个约定维度`);continue;
    }
    if(values.every(v=>/^:?-+:?$/.test(v)))continue;
    if(values.every(v=>!v))continue;
    if(!table){issues.push(`L${i+1}：缺少有效锻炼表头`);continue;}
    if(values.length!==4||!values[0]){issues.push(`L${i+1}：记录须有动作名称和四个单元格`);continue;}
    const link=values[0].match(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/);
    if(values[0].includes('[[')&&!link){issues.push(`L${i+1}：动作链接格式无效`);continue;}
    const path=link?link[1].replace(/\.md$/,'')+'.md':null;
    if(path&&!/^workspace\/exercises\/[^/#\[\]|]+\.md$/.test(path)){issues.push(`L${i+1}：动作须链接 workspace/exercises 下的页面`);continue;}
    rows.push({order:rows.length+1,line:i+1,index:i,action:values[0],name:link?(link[2]||link[1].split('/').pop()):values[0],path,weight:values[1],volume:values[2],rest:values[3]});
  }
  return {rows,issues};
}
function page(title,date) {
  return `---\ntype: exercise\ntitle: ${JSON.stringify(title)}\ncreated: "${date}"\naliases: []\n---\n\n# ${title}\n\n## 动作笔记\n\n## 学习资料\n\n## 训练记录\n\n\`\`\`dataviewjs\nawait dv.view("agents/views/overview/_views/exercise-history");\n\`\`\`\n`;
}
function plan(markdown,date,exercises=[],occupied=[],createdDate=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())) {
  const parsed=parse(markdown),issues=[...parsed.issues],creates=[], replacements=[];
  if(issues.length||!parsed.rows.length)return {markdown,creates,issues,records:parsed.rows.length};
  const byPath=new Map(exercises.map(e=>[e.path,e])), names=new Map(),taken=new Set(occupied);
  function add(e){for(const n of new Set([e.title,e.path.split('/').pop().replace(/\.md$/,''),...(e.aliases||[])])){
    if(typeof n!=='string'||!n.trim())continue;
    const key=n.trim(), list=names.get(key)||[];list.push(e);names.set(key,list);
  }}
  exercises.forEach(add);
  for(const row of parsed.rows){
    let exercise;
    if(row.path){exercise=byPath.get(row.path);if(!exercise){issues.push(`L${row.line}：动作链接不存在或页面不是 exercise：${row.path}`);continue;}}
    else {
      const matches=names.get(row.name.trim())||[];
      if(matches.length>1){issues.push(`L${row.line}：动作名称有歧义：${row.name}`);continue;}
      exercise=matches[0];
      if(!exercise){
        const name=row.name.trim();
        if(!name||/[\\/:*?"<>|#\[\]\n\r]/.test(name)||/^\./.test(name)||/[. ]$/.test(name)){issues.push(`L${row.line}：请为动作指定可用的页面名称：${name}`);continue;}
        const path=`workspace/exercises/${name}.md`;
        if([...taken].some(p=>p.toLowerCase()===path.toLowerCase())){issues.push(`L${row.line}：目标路径已占用：${path}`);continue;}
        exercise={path,title:name,aliases:[]};taken.add(path);byPath.set(path,exercise);add(exercise);creates.push({path,markdown:page(name,createdDate)});
      }
    }
    replacements.push({row,path:exercise.path});
  }
  if(issues.length)return {markdown,creates:[],issues,records:parsed.rows.length};
  const lines=markdown.split(/\r?\n/);
  for(const {row,path} of replacements){
    // Replace only the action cell; retain every measurement, spacing and duplicate row.
    if(!row.path)lines[row.index]=lines[row.index].replace(/^(\s*\|\s*)[^|]*?(\s*\|)/,(_,prefix,suffix)=>`${prefix}[[${path.slice(0,-3)}\\|${row.name}]]${suffix}`);
  }
  return {markdown:lines.join(markdown.includes('\r\n')?'\r\n':'\n'),creates,issues,records:parsed.rows.length};
}
module.exports={HEADERS,cells,parse,page,plan};
