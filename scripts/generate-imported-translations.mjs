import fs from 'node:fs';
import ts from 'typescript';
const data={...JSON.parse(fs.readFileSync('src/domain/importedScreens.json','utf8')),...JSON.parse(fs.readFileSync('src/domain/staffScreens.json','utf8')),...JSON.parse(fs.readFileSync('src/domain/languageScreens.json','utf8'))};
const strings=new Set();
for(const path of ['src/components/ImportedNumericSection.tsx','src/components/MunicipalityFinancingTable.tsx','src/components/ImportedWorkflowSection.tsx','src/components/ImportedQuestionTable.tsx','src/components/importedQuestionLayout.ts','src/components/FieldAvailability.tsx','src/domain/importedReporting.ts','src/domain/languageCollections.ts','src/components/LanguageCollectionTable.tsx']){
 const text=fs.readFileSync(path,'utf8');
 const ast=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,path.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 function visit(node){if(ts.isStringLiteral(node)&&node.text.length>1&&!/[{};=]|^\.\.?\//.test(node.text))strings.add(node.text);ts.forEachChild(node,visit)}
 visit(ast);
}
for(const [section,screen]of Object.entries(data)){
 for(const group of screen.groups){strings.add(group.title);if(group.description)strings.add(group.description);for(const header of group.columnGroups??[]){strings.add(header.title);for(const column of header.columns)strings.add(column.label);}for(const table of group.tables??[])strings.add(`${group.title} – ${table}`);}
 for(const field of screen.fields){strings.add(field.label); if(field.rowLabel)strings.add(field.rowLabel);if(field.column)strings.add(field.column);if(field.table)strings.add(field.table);const name=field.key.replace(/^GG_\d+_/, '');if(section==='3'){const grade=name.match(/(?:Trinn|Sum)(\d+(?:_\d+)?)/i)?.[1];if(grade)strings.add(`${field.readOnly?'Sum ':''}${grade.replace('_','–')}. trinn`);}
 if(section==='3'&&field.group==='A'){const grade=name.match(/Trinn(\d+(?:_\d+)?)/)?.[1];strings.add(grade?`${grade.replace('_','–')}. trinn`:'Sum');}
 else {const grade=name.match(/(?:Trinn|Sum)(\d+(?:_\d+)?)/i)?.[1]??name.match(/_(1_(?:7|10))$/)?.[1];strings.add(grade?`${grade.replace('_','–')}. trinn`:'Sum');strings.add(name.replace(/_?(?:Trinn|Sum)\d+(?:_\d+)?/gi,'').replace(/^Sum_/,'').replace(/_1_(?:7|10)$/,'').replaceAll('_',' ').toLocaleLowerCase('nb').replaceAll('aarstimer','årstimer').replaceAll('opplaering','opplæring'));}}
}
const translations={'Fyll ut et heltall.':'Fyll ut eit heiltal.','Spørsmål':'Spørsmål','Ikke registrert':'Ikkje registrert','Beregning ikke tilgjengelig':'Utrekning ikkje tilgjengeleg','Fullfør':'Fullfør','Kontroller':'Kontroller','Elever og timer':'Elevar og timar','Antall elever':'Tal på elevar','Gå til del':'Gå til del','Skolens merknader':'Merknadene frå skulen','Kommunens merknader':'Merknadene frå kommunen','Ingen data sendes til BOGIAPI.':'Ingen data blir sende til BOGIAPI.','Bekreft':'Stadfest','Bekreft simulert handling':'Stadfest simulert handling','Bruk mine demoopplysninger':'Bruk demoopplysningane mine','Kontroll er ikke kjørt.':'Kontroll er ikkje køyrd.','Ikke implementert':'Ikkje implementert','Uavklarte kontroller':'Uavklarte kontrollar','Lokale feil':'Lokale feil','Lokal feil':'Lokal feil'};
Object.assign(translations, {
 'Hvorfor er feltet utilgjengelig?': 'Kvifor er feltet utilgjengeleg?',
 'Valgt rolle eller rapporteringsstatus gir ikke redigeringstilgang.': 'Vald rolle eller rapporteringsstatus gir ikkje redigeringstilgang.',
 'Velg finansierende kommune i del 3 E før du fyller ut antall elever.': 'Vel finansierande kommune i del 3 E før du fyller ut talet på elevar.',
});
fs.writeFileSync('src/locales/importedUi.ts','// Generated fallback labels; authoritative nfViewSprak/ColTekstDiverse tables were not supplied.\nexport const importedUi: Record<string, string> = '+JSON.stringify(Object.fromEntries([...strings].sort().map(s=>[s,translations[s]??s])),null,2)+'\n');
