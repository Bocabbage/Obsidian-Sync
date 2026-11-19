const module = {exports:{}};
new Function('module', await dv.app.vault.adapter.read('agents/views/overview/_views/exercise-history/model.cjs'))(module);
const model=module.exports, current=dv.current(), records=[], issues=[];
const paths=dv.app.vault.getMarkdownFiles().filter(f=>/^workspace\/daily\/\d{4}\/\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}\.daily\.md$/.test(f.path));
for(const file of paths){
  const text=await dv.app.vault.read(file), parsed=model.parse(text);
  const date=file.basename.replace('.daily','');
  for(const issue of parsed.issues)issues.push(`${file.basename}：${issue}`);
  // Link identity is authoritative. Unreviewed plain names are resolved only during review.
  for(const row of parsed.rows)if(row.path===current.file.path)records.push({...row,date,source:file.path});
}
records.sort((a,b)=>b.date.localeCompare(a.date)||a.line-b.line);
if(records.length)dv.table(['日期','当日序号','动作','重量','组数 × 次数 / 时间','休息间隔'],records.map((r)=>[
  dv.fileLink(r.source,false,r.date),r.order, r.name,r.weight||'—',r.volume||'—',r.rest||'—'
]));
else dv.paragraph('暂无已整理的训练记录。Daily review 后自动汇总；同一天的每条记录分别保留。');
if(issues.length)dv.paragraph(`有 ${issues.length} 处 Daily 锻炼表格格式问题，部分记录可能未显示：\n`+issues.join('\n'));
