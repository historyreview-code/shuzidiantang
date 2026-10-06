// Original code-native miniature system. Shapes summarize identifiable features,
// not measured architectural elevations. All city maps use this same vocabulary.
const P=(d,fill,stroke='',w=2)=>`<path d="${d}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`:''}/>`;
const R=(x,y,w,h,c,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}"/>`;
const C=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const stone='#c9b797',light='#eadfc7',dark='#667a7b',brick='#b77862',green='#8da893',blue='#94bdc5',gold='#cfaa6f';
const W=(xs,y,h=12)=>xs.map(x=>P(`M${x} ${y+h}V${y+4}q4-8 8 0v${h-4}Z`,dark)).join('');
const tree=(x,y)=>P(`M${x} ${y+10}v24`,'none','#ae9574',3)+`<ellipse cx="${x}" cy="${y}" rx="13" ry="19" fill="${green}"/>`;
const wave=P('M4 101q17-6 34 0t34 0t40 0','none',blue,4);
const steps=P('M10 104h100M16 99h88','none',stone,4);
const columns=(color=light)=>[24,39,74,89].map(x=>R(x,52,7,42,color)).join('');
const hall=(color=stone)=>R(16,46,90,51,color)+P('M10 46 61 23 112 46Z',light)+columns()+P('M50 98V69q10-11 20 0v29',dark)+steps;
const arch=(x,y,w,h,color=dark)=>P(`M${x} ${y+h}V${y+11}q${w/2}-${22} ${w} 0v${h-11}Z`,color);
const church=(towers=2,color=stone)=>R(23,47,76,53,color)+R(49,24,23,76,color)+P('M48 25 60 5 73 25Z',dark)+(towers===2?R(18,28,20,72,color)+R(84,28,20,72,color)+P('M15 28h26L28 9ZM81 28h26L94 9Z',dark):'')+W([24,89],45)+arch(49,72,24,28)+C(61,53,9,blue)+P('M61 44v18m-9-9h18','none',light,2)+steps;
const townhouse=(color=brick)=>R(21,29,81,68,color)+P('M15 29 60 8 108 29Z',dark)+W([30,52,76],39)+W([30,76],65)+arch(51,71,19,26)+steps;
const museum=hall();
export const bodies={
minster:church(2)+R(20,19,5,10,stone)+R(32,19,5,10,stone)+R(86,19,5,10,stone)+R(98,19,5,10,stone),
walls:P('M8 101V51h16V42h13v10h14v-9h13v9h16V34h13v10h14v57Z',stone)+arch(38,64,27,37)+P('M81 45v52M14 71h17M80 69h25','none',light,3),
shambles:R(8,38,36,61,light)+R(79,38,33,61,light)+P('M4 38 27 17 49 38ZM75 38 94 15 116 38Z',brick)+P('M9 40h35M9 62h35M26 39v60M9 40 43 64M80 40h31M80 65h31M96 40v59M80 41 111 64','none',dark,4)+P('M48 109 55 67H71L77 109Z','#d7c9ad')+R(11,75,13,24,dark)+R(98,77,12,22,dark),
jorvik:wave+P('M18 76q40 22 85 0l-9 18H30Z',brick)+P('M21 77q-15-2-7-15m88 16q15-6 8-17M58 77V13','none',dark,4)+P('M61 17q-25 3-28 37h29Z',light)+P('M64 17q32 10 25 37H64Z',gold)+C(38,82,6,gold)+C(57,86,6,gold)+C(78,84,6,gold),
railway:P('M11 81V55q18-16 50-8l14 8h28v27Z',dark)+P('M19 54h47l-9-19H39Z',blue)+R(27,19,13,28,brick)+P('M22 19h23M9 90h108','none',dark,4)+C(28,83,12,brick)+C(63,83,12,brick)+C(91,83,8,brick)+P('M29 83h61','none',gold,3)+P('M35 11q-10-8 0-11','none','#c6cebf',5),
gardens:tree(19,65)+P('M37 99V26h54V17h9v81M42 32h45v54M43 63q19-29 38 0','none',stone,7)+P('M43 34 63 52 83 34','none',stone,5)+P('M10 108q47-18 102 0',green),
yorkshire:hall()+C(60,43,8,gold)+P('M50 85q10-27 20 0','none',gold,3),
art:hall(light)+R(45,50,32,36,blue)+P('M53 69q-2-17 8-17t8 17v12H53Z',brick)+P('M49 69h24','none',gold,3),
merchant:R(10,43,101,55,light)+P('M4 44 37 16 64 43 87 23 117 45Z',brick)+P('M14 46h92M14 69h92M27 45v52M52 45v52M78 45v52M102 45v52M15 49 50 69M53 70 79 94M79 48 103 69','none',dark,4)+arch(39,74,21,24),
clifford:P('M3 108q55-51 114 0Z',green)+P('M24 88V41q-5-20 16-22q12-12 23-2q15-10 27 3q20 0 16 23v45Z',stone)+P('M24 43h79M37 30v54M89 28v57','none',light,3)+arch(49,61,25,31)+W([37,78],36,13),
castle:hall(stone)+R(48,12,27,34,light)+C(61,26,8,dark)+P('M61 21v6l5 3','none',light,2),
treasurer:townhouse(light)+P('M12 45 34 25 52 45M72 42 91 21 110 42',stone,dark,2)+R(92,10,7,18,brick)+tree(13,78),
fairfax:townhouse(brick)+R(18,58,87,5,light)+P('M47 78q14-21 28 0','none',light,5),
chocolate:R(21,23,71,82,brick,5)+R(27,29,59,51,'#704f45',2)+[31,49,67].map(x=>R(x,34,14,17,'#967158',2)+R(x,55,14,17,'#967158',2)).join('')+P('M18 83h78l-9 24H26Z',gold)+C(58,96,6,light),
ouse:wave+P('M9 86q52-52 103 0M10 84h102','none',stone,8)+P('M27 82v15m33-28v27m32-16v16','none',stone,4)+tree(18,38),
rowntree:tree(23,55)+tree(97,53)+P('M37 84h49m-46 4v13m40-13v13','none',brick,5)+P('M30 74h63','none',gold,7)+wave,
kings:R(15,40,90,58,stone)+P('M13 41 61 21 108 41Z',light)+[15,38,80,100].map(x=>R(x,20,6,79,light)+P(`M${x-2} 21l5-13 5 13Z`,dark)).join('')+W([27,48,67,88],53,33)+steps,
trinity:townhouse(stone)+R(39,12,43,69,brick)+P('M35 13h51M42 8v10m13-10v10m14-10v10m11-10v10','none',stone,5)+arch(49,58,24,40)+C(60,36,9,blue),
johns:townhouse(brick)+R(41,16,39,81,brick)+R(35,21,7,78,light)+R(80,21,7,78,light)+P('M36 20V7h6v13M81 20V7h6v13','none',stone,4)+arch(47,63,29,36)+C(61,40,9,gold),
queens:wave+P('M7 88Q59 35 114 88M9 78 112 78M16 86 40 55 66 74 89 56 109 84M38 61v32M89 61v32','none',gold,5),
backs:tree(19,49)+tree(102,46)+wave+R(38,49,48,40,stone)+P('M31 49 61 28 92 49Z',dark)+W([46,66],59,23)+P('M7 94q20-15 37-4','none',green,6),
punting:wave+P('M12 88 104 66 112 75 22 99Z',gold)+P('M35 85 104 11','none',dark,3)+C(73,57,7,brick)+P('M73 65 76 81M74 67 57 63','none',dark,6),
fitz:hall(light)+[24,38,52,68,82,96].map(x=>R(x,50,5,42,stone)).join('')+P('M4 109h112M9 104h102','none',stone,4),
kettle:R(8,48,38,52,light)+R(47,30,30,70,stone)+R(79,43,34,57,light)+P('M5 48 27 29 48 48M43 31 62 13 81 31M76 43 95 25 116 43',dark)+R(16,61,22,25,blue)+R(87,59,18,21,blue)+C(64,80,10,gold),
round:P('M19 96V54q42-23 83 0v42Z',stone)+P('M11 54 60 11 111 54Z',dark)+W([27,50,76],61,30)+P('M17 98h91','none',gold,4),
stmary:R(34,21,54,79,stone)+P('M28 24h64M33 12v14m18-14v14m20-14v14m17-14v14','none',stone,6)+C(61,41,12,dark)+P('M61 31v11l7 4','none',light,2)+arch(47,72,28,28)+steps,
market:[5,45,85].map(x=>R(x,54,30,42,light)+P(`M${x-3} 54l8-18h20l8 18Z`,x===45?green:brick)+R(x+4,75,22,6,gold)).join('')+P('M8 100h106','none',stone,4),
botanic:P('M12 99V59l25-28h47l24 28v40Z',blue)+P('M12 60h96M37 31v68M61 31v68M84 31v68M13 61l24 17 24-17 23 17 24-17','none',light,3)+tree(24,79)+tree(91,79)+P('M54 99V72q7-10 14 0v27Z',dark),
zoology:P('M7 45Q41 16 90 42L113 31 105 49 113 65 93 56Q45 71 7 45Z',light,dark,2)+P('M18 45h78M32 35v25m12-28v32m12-32v30m12-28v26m12-23v20','none',stone,3)+P('M35 9v22M88 9v28M17 90h89M24 84h72','none',dark,3)+C(14,44,2,dark),
maa:R(14,30,95,72,stone)+P('M8 30 60 10 115 30Z',dark)+R(26,40,25,47,light)+P('M31 77 39 46 47 77Z',brick)+R(63,40,31,47,light)+P('M68 58q11-20 21 0v19H68Z',gold)+steps,
sedgwick:P('M16 48q28-26 55 2l19-24 16 4-3 13-12 2-8 24-35 1-29 14M24 53l-12 25M45 63l-9 30m26-29 4 30m13-34 7 28','none',stone,7)+P('M27 44v18m11-25v29m12-27v27m13-23v25M5 101h111','none',dark,2)+C(99,32,2,dark),
polar:P('M5 100 25 53 44 72 64 25 88 70 108 56 120 101Z','#c7dde0')+P('M46 100 67 68 93 100Z',gold)+P('M67 70v30M39 49V16h27l-8 9 8 10H39','none',dark,3)+C(99,21,12,light),
kelvingrove:R(14,51,96,46,brick)+R(23,34,19,64,brick)+R(83,34,19,64,brick)+P('M17 36 33 9 47 36ZM77 36 93 9 108 36Z',dark)+P('M44 51q17-26 36 0Z',gold)+W([24,49,68,86],62,21)+arch(52,78,19,20)+steps,
university:R(12,58,96,41,stone)+R(49,30,25,69,stone)+P('M47 30 61 1 77 30Z',dark)+[18,40,80,99].map(x=>arch(x,73,13,25)).join('')+W([55],40,15)+P('M8 62h104','none',light,3),
hunterian:hall(stone)+R(47,43,29,42,light)+P('M53 78 61 51 69 78Z',blue)+P('M51 87h20M60 47v-8','none',dark,3)+C(29,71,5,gold),
ashton:R(8,43,31,55,brick)+R(85,35,28,63,stone)+P('M39 32Q61 52 85 32','none',dark,2)+[44,55,68,79].map((x,i)=>C(x,38+(i===1||i===2?6:0),3,gold)).join('')+P('M44 110 50 63h23l8 47Z','#c7ba9e')+W([17,94],58,27)+P('M50 87h23m-27 12h32','none',light,3),
riverside:P('M7 97V52L23 20 41 48 57 17 78 49 95 25 116 55v42Z',blue)+P('M10 97V56L25 34 42 58 58 31 78 63 94 40 111 62v35Z',dark)+P('M25 35v61m33-62v62m36-53v53','none',light,2)+wave,
tallship:wave+P('M12 83q48 22 99-1L96 99H25Z',dark)+P('M36 83V19m27 63V7m23 75V26M21 36h27M48 24h30M72 43h28','none',brick,3)+P('M37 22 22 59h14ZM65 12 45 65h18ZM88 29 74 65h13Z',light)+P('M39 38 57 75M68 34 84 76','none',gold,2),
science:wave+P('M13 94Q8 54 55 42Q100 26 112 82L103 96Z',blue)+P('M18 80Q58 41 107 71M29 91Q63 60 109 83','none',light,3)+P('M17 63V8m-7 17h14','none',dark,4)+C(81,65,10,gold),
goma:hall(light)+R(53,59,18,28,brick)+C(61,72,7,blue)+P('M6 108h110','none',dark,3),
buchanan:R(6,45,27,54,stone)+R(40,29,34,70,brick)+R(83,47,29,52,light)+P('M3 46 19 26 36 46M36 30 58 8 79 30M79 48 98 29 116 48',dark)+W([13,46,59,91],54,27)+P('M9 108h104','none',stone,4),
mackintosh:R(25,14,21,70,dark)+R(70,14,21,70,dark)+P('M22 86h30m15 0h30M28 87v20m15-20v20m30-20v20m15-20v20','none',dark,4)+R(48,54,19,6,gold)+P('M57 60v43','none',gold,3)+C(57,45,8,light)+P('M34 21v37m45-37v37','none',light,2)+C(35,67,4,'#b08591')+C(80,67,4,'#b08591'),
cathedral:church(1,dark)+R(20,53,24,47,stone)+R(79,53,22,47,stone)+W([25,86],65,22),
necropolis:P('M2 109q58-53 116 0Z',green)+R(49,39,24,54,stone)+P('M45 39 61 15 78 39Z',light)+P('M24 88V62m-8 9h16M96 92V69m-8 9h16','none',stone,6)+P('M43 95h37','none',dark,3),
green:tree(17,62)+tree(105,65)+P('M31 96q30-12 58 0M36 78q25-11 50 0M47 58q15-7 28 0','none',brick,6)+P('M61 31v66','none',brick,6)+C(61,20,7,gold)+wave,
burrell:R(9,49,104,50,stone)+R(17,56,88,36,blue)+P('M7 49 61 29 116 49Z',dark)+[36,60,84].map(x=>R(x,53,4,44,light)).join('')+tree(15,30)+tree(105,27)+P('M52 89 60 68 70 89Z',gold),
pollok:tree(18,44)+tree(93,35)+tree(51,30)+P('M27 108q59-18 23-38','none',gold,6)+P('M73 87q15-17 29 0l-4 14H77Z',brick)+P('M80 86 76 79m21 7 5-9','none',gold,3)+C(97,92,2,dark)
};
// Glasgow's Kibble Palace gets its characteristic domed glasshouse.
bodies.glasgow_botanic=P('M8 99V63h21V45q31-55 63 0v18h22v36Z',blue)+P('M27 46h65M8 64h106M42 26v73m19-88v88m19-73v73M20 65v34M102 65v34','none',light,3)+tree(18,79)+tree(99,79);
