import {foods} from './food.js';
export const CHECKED_AT = '2026-10-05';
export const SOURCES = {
  manners: 'https://kyoto.travel/en/responsible-travel/',
  crowd: 'https://global.kyoto.travel/en/comfort/',
  areas: 'https://kyoto.travel/en/areas/',
};

// x/y are artboard positions, NOT latitude/longitude or navigation coordinates.
// Durations, seasons and discovery prompts are editorial planning suggestions.
export const places = [
  { id:'kinkaku', name:'金阁寺', localName:'金閣寺', en:'Kinkaku-ji', zone:'northwest', area:'洛西 · 衣笠', kind:'temple', icon:'gold', x:338, y:144, minutes:60, effort:1, tags:['金色倒影','庭园'], subtitle:'把金色，留在水面上', description:'鹿苑寺的金阁临镜湖池而立，建筑与池水、庭园共同构成景观。沿游览动线慢慢走，可以从不同角度看金阁的倒影。', prompt:'先看水里的屋檐，再抬头看真正的金阁。', tip:'按庭园动线参观，停留拍照时给其他游客留出空间。', seasons:['autumn','winter'], source:'https://www.shokoku-ji.jp/en/kinkakuji/about/', sourceLabel:'金阁寺官方', access:'庭园有固定参观时段，出发前查官网。' },
  { id:'ryoan', name:'龙安寺', localName:'龍安寺', en:'Ryoan-ji', zone:'northwest', area:'洛西 · 衣笠', kind:'temple', icon:'zen', x:211, y:235, minutes:70, effort:1, tags:['枯山水','慢下来'], subtitle:'十五块石头，许多种理解', description:'方丈前的石庭以白砂与十五块石头构成枯山水。它的含义没有唯一答案；寺内还有池泉与绿意，可以把参观变成一段观察和停顿。', prompt:'坐一会儿，看看你的视线先被哪一块石头吸引。', tip:'石庭观赏区保持轻声，不占用通道。', seasons:['spring','autumn'], source:'https://www.japan.travel/en/spot/1145/', sourceLabel:'日本国家旅游局', access:'庭园与殿堂的开放安排请查官方信息。' },
  { id:'arashiyama', name:'岚山竹林', localName:'嵐山 · 竹林の小径', en:'Arashiyama Bamboo Grove', zone:'west', area:'洛西 · 岚山', kind:'nature', icon:'bamboo', x:112, y:387, minutes:75, effort:2, tags:['竹影','山间散步'], subtitle:'走进一片绿色的风', description:'嵯峨岚山以竹林小径、山景和桂川河畔著称。竹林只是这一带的一段风景，可以再沿河散步，或把天龙寺庭园安排在同一天。', prompt:'停下脚步，听竹叶的声音。', tip:'不要在竹子上刻字；拍照时不要堵住小径。', seasons:['summer','autumn'], source:'https://kyoto.travel/en/areas/saga-arashiyama/', sourceLabel:'京都市官方旅游指南', access:'竹林步道与周边寺院的开放安排不同。' },
  { id:'tenryu', name:'天龙寺', localName:'天龍寺', en:'Tenryu-ji', zone:'west', area:'洛西 · 岚山', kind:'temple', icon:'pond', x:253, y:473, minutes:75, effort:1, tags:['借景','池泉庭园'], subtitle:'庭园，把远山也借了进来', description:'天龙寺位于岚山，曹源池庭园将池水、石组与周围山景组织在一起。可以把它与竹林配成一段路，仔细比较开阔庭园和狭长竹径的空间感。', prompt:'找一个能同时看见池水与远山的位置。', tip:'庭园、建筑和特别开放区域可能分别收费。', seasons:['spring','autumn'], source:'https://www.tenryuji.com/en/', sourceLabel:'天龙寺官方', access:'查阅官网的参观区域、时段与收费。' },
  { id:'nijo', name:'二条城', localName:'二条城', en:'Nijo Castle', zone:'central', area:'洛中 · 二条', kind:'temple', icon:'castle', x:392, y:418, minutes:100, effort:2, tags:['历史建筑','庭园'], subtitle:'走入将军时代的京都', description:'二条城保留宫殿、城门与庭园，是理解京都政治历史的一个入口。游览不只是一座城门：二之丸御殿与庭园需要分别留出观看时间。', prompt:'留意建筑里，权力是怎样被空间表达的。', tip:'御殿内部遵守现场摄影规定，部分区域有独立入场要求。', seasons:['spring','autumn'], source:'https://www.japan.travel/en/spot/1165/', sourceLabel:'日本国家旅游局', access:'休城日、区域开放与门票以二条城官网为准。' },
  { id:'gosho', name:'京都御苑', localName:'京都御苑', en:'Kyoto Gyoen National Garden', zone:'central', area:'洛中 · 御所', kind:'nature', icon:'palace', x:502, y:279, minutes:60, effort:1, tags:['城市绿地','散步'], subtitle:'在城市中央，留一块空地', description:'京都御苑是围绕京都御所的广阔绿地。御苑散步与进入御所、仙洞御所是不同安排：想参观宫殿时，应另查开放或预约要求。', prompt:'从一条宽阔的砂石路，拐进树荫。', tip:'本条行程只安排御苑散步，不等于预约了宫殿参观。', seasons:['spring','summer'], source:'https://www.japan.travel/en/spot/1168/', sourceLabel:'日本国家旅游局', access:'御苑、京都御所与仙洞御所规则不同。' },
  { id:'shimogamo', name:'下鸭神社', localName:'下鴨神社', en:'Shimogamo-jinja', zone:'north', area:'洛北 · 下鸭', kind:'temple', icon:'forest', x:622, y:131, minutes:70, effort:1, tags:['糺之森','古社'], subtitle:'穿过森林，再遇见朱红', description:'下鸭神社位于贺茂川与高野川汇流处附近，糺之森为参拜路径带来树荫。可以先体验林间步道，再走向神社建筑。', prompt:'观察从树林到朱红楼门，光线怎样改变。', tip:'这是仍在使用的宗教场所，尊重参拜者与现场指示。', seasons:['summer','autumn'], source:'https://www.japan.travel/en/spot/1160/', sourceLabel:'日本国家旅游局', access:'祭典与特定区域开放请查神社公告。' },
  { id:'ginkaku', name:'银阁寺', localName:'銀閣寺', en:'Ginkaku-ji', zone:'northeast', area:'洛东 · 东山北', kind:'temple', icon:'silver', x:835, y:185, minutes:70, effort:2, tags:['苔庭','东山文化'], subtitle:'没有银色，也有光', description:'慈照寺通常被称为银阁寺，却并非覆银建筑。这里的砂景、苔庭和登高视角，让人从简朴的材质中观察东山文化的审美。', prompt:'比较白砂的明亮与苔藓的柔软。', tip:'庭园含坡道与台阶，雨天留意脚下。', seasons:['summer','autumn'], source:'https://www.shokoku-ji.jp/en/ginkakuji/', sourceLabel:'银阁寺官方', access:'季节开放时间不同，请查官网。' },
  { id:'philosopher', name:'哲学之道', localName:'哲学の道', en:"Philosopher’s Path", zone:'northeast', area:'洛东 · 东山北', kind:'nature', icon:'path', x:827, y:333, minutes:60, effort:1, tags:['疏水小径','散步'], subtitle:'答案可以晚一点再想', description:'小径沿疏水延伸，连接银阁寺一带与东山北部的寺社街区。名称与哲学家西田几多郎的散步有关；适合留一段没有任务的步行时间。', prompt:'不必全程赶路，挑一段水声陪你走。', tip:'樱花季可能拥挤；季节灵感不等于当天花况。', seasons:['spring','autumn'], source:'https://www.japan.travel/en/spot/1162/', sourceLabel:'日本国家旅游局', access:'步道散步与沿线寺院参观是不同安排。' },
  { id:'heian', name:'平安神宫', localName:'平安神宮', en:'Heian-jingu', zone:'northeast', area:'洛东 · 冈崎', kind:'temple', icon:'gate', x:681, y:389, minutes:60, effort:1, tags:['朱红鸟居','神苑'], subtitle:'一抹朱红，撑起开阔天空', description:'平安神宫建于1895年，以纪念平安迁都1100周年。朱红大鸟居和开阔院落辨识度很高，神苑则呈现另一种池水与庭园的尺度。', prompt:'从远处看鸟居，感受它与天空的比例。', tip:'神苑参观与一般境内参拜规则不同。', seasons:['spring','autumn'], source:'https://www.japan.travel/en/spot/1195/', sourceLabel:'日本国家旅游局', access:'神苑开放与祭典安排请查官方公告。' },
  { id:'nanzen', name:'南禅寺', localName:'南禅寺', en:'Nanzen-ji', zone:'northeast', area:'洛东 · 东山北', kind:'temple', icon:'aqueduct', x:920, y:466, minutes:80, effort:2, tags:['水路阁','禅寺'], subtitle:'砖拱与古寺，相遇在树影里', description:'南禅寺的三门、禅院庭园和境内水路阁，呈现不同年代的建筑相遇。红砖拱券很有辨识度，也值得把目光移向庭园与山麓。', prompt:'站在砖拱旁，看看透过拱洞的另一层风景。', tip:'部分庭园、三门与殿堂单独收费或可能临时关闭。', seasons:['summer','autumn'], source:'https://www.japan.travel/en/spot/1175/', sourceLabel:'日本国家旅游局', access:'子院与各收费区域的开放需分别确认。' },
  { id:'nishiki', name:'锦市场', localName:'錦市場', en:'Nishiki Market', zone:'central', area:'洛中 · 四条', kind:'street', icon:'market', x:458, y:566, minutes:70, effort:1, tags:['京都滋味','小店'], subtitle:'一条街，尝到京都的日常', description:'锦市场汇集食品、食材与各类小店，也是观察京都饮食文化的一处入口。先看看店铺，再选想尝的一两样，比一路赶着吃更自在。', prompt:'挑一样你不认识的食材，向店家了解它。', tip:'在购买食物的店铺指定位置用餐，不边走边吃。', seasons:['spring','summer','autumn','winter'], source:'https://www.kyoto-nishiki.or.jp/en/about/', sourceLabel:'锦市场商店街官方', access:'各店营业日与时段不同，请查商店信息。' },
  { id:'kamo', name:'鸭川', localName:'鴨川 · 四条河畔', en:'Kamo River Shijo', zone:'central', area:'洛中 · 四条河畔', kind:'nature', icon:'river', x:607, y:589, minutes:45, effort:1, tags:['河畔','留白时光'], subtitle:'今天的最后一站，可以是风', description:'鸭川穿过京都，河岸步道是城市日常生活的一部分。本标记选择四条附近河畔作为散步入口，可以与祇园或锦市场组合。', prompt:'坐一会儿，看河水从你的行程旁流过去。', tip:'遇雨或水位上涨时，避开低洼河岸并遵守封闭指示。', seasons:['spring','summer','autumn'], source:'https://www.japan.travel/en/spot/1183/', sourceLabel:'日本国家旅游局', access:'此处仅标记四条河畔入口，不代表整条河的位置。' },
  { id:'gion', name:'祇园', localName:'祇園', en:'Gion', zone:'east', area:'洛东 · 祇园', kind:'street', icon:'lantern', x:740, y:603, minutes:60, effort:1, tags:['町家街巷','暮色'], subtitle:'灯亮起来，街道慢下来', description:'祇园的町家、茶屋与街巷展现京都传统城市风貌。这里也是居民生活和工作的地方，沿开放道路步行，留意公共空间与私人领域的边界。', prompt:'看一盏灯笼和一扇格子门，不必追逐镜头。', tip:'不跟拍或拦住艺伎、舞伎；遵守禁拍与私巷限制。', seasons:['spring','autumn','winter'], source:'https://kyoto.travel/en/areas/gion-kiyomizu/', sourceLabel:'京都市官方旅游指南', manners:'https://kyoto.travel/en/responsible-travel/gion-manner-message-from-southern-gionmachi/', access:'请沿允许进入的公共道路游览。' },
  { id:'yasaka', name:'八坂神社', localName:'八坂神社', en:'Yasaka-jinja', zone:'east', area:'洛东 · 祇园', kind:'temple', icon:'shrine', x:873, y:603, minutes:45, effort:1, tags:['楼门','灯笼'], subtitle:'在街巷尽头，遇见一座红门', description:'八坂神社位于祇园一带，朱红楼门和悬挂灯笼的舞殿是主要特征。它与祇园祭关系深厚，可以与祇园街巷组合参观。', prompt:'从街道走向楼门，观察城市与神社怎样相连。', tip:'祭典和参拜人流优先，拍照不要堵住楼门。', seasons:['summer','autumn'], source:'https://www.japan.travel/en/spot/78/', sourceLabel:'日本国家旅游局', access:'特殊活动与设施开放请查神社公告。' },
  { id:'sannenzaka', name:'二年坂 · 三年坂', localName:'二寧坂 · 産寧坂', en:'Ninenzaka and Sannenzaka', zone:'east', area:'洛东 · 清水', kind:'street', icon:'houses', x:783, y:716, minutes:60, effort:2, tags:['石阶','老街小店'], subtitle:'顺着石阶，把时间走慢', description:'清水寺周边的坡道街巷串联传统店铺与町家风貌。可从清水寺往下走，慢慢浏览沿途小店，再前往八坂神社或祇园。', prompt:'选一间小店停下来，看看店门里的手艺。', tip:'石阶雨天湿滑，避免在狭窄通道停留拍照。', seasons:['spring','autumn'], source:'https://kyoto.travel/en/areas/gion-kiyomizu/', sourceLabel:'京都市官方旅游指南', access:'街道与店铺营业时段不同。' },
  { id:'kiyomizu', name:'清水寺', localName:'清水寺', en:'Kiyomizu-dera', zone:'east', area:'洛东 · 清水', kind:'temple', icon:'stage', x:924, y:728, minutes:90, effort:3, tags:['清水舞台','城市远眺'], subtitle:'站在木构舞台，望向京都', description:'清水寺位于音羽山山腰，以本堂前伸出的木构舞台著称。舞台、山林与城市远景形成多层风景，参观前后可接上二年坂、三年坂。', prompt:'从远处看木构支柱，再走到舞台看城市。', tip:'前往寺院有上坡与台阶，穿好走的鞋并预留休息。', seasons:['spring','autumn'], source:'https://www.kiyomizudera.or.jp/en/visit/', sourceLabel:'清水寺官方', access:'开放时段与夜间参观安排请查官网。' },
  { id:'fushimi', name:'伏见稻荷大社', localName:'伏見稲荷大社', en:'Fushimi Inari Taisha', zone:'south', area:'洛南 · 伏见', kind:'temple', icon:'torii', x:687, y:851, minutes:100, effort:3, tags:['千本鸟居','山路'], subtitle:'朱红色的路，向山里延伸', description:'伏见稻荷大社的鸟居沿稻荷山参拜路线延伸。本计划建议的时长只覆盖境内与一段鸟居路；登顶需要另外增加时间和体力预算。', prompt:'回头看一次，连续的鸟居会形成另一种景深。', tip:'完整登山与短程参拜不同，按体力决定折返点。', seasons:['spring','summer','autumn','winter'], source:'https://inari.jp/en/', sourceLabel:'伏见稻荷大社官方', access:'境内、山路和授与所的开放安排不同。' },
];

export const byId = Object.fromEntries(places.map(p => [p.id,p]));
export const kinds = { all:'全部景点', temple:'寺社庭园', street:'街巷滋味', nature:'山水散步', saved:'我的收藏' };
export const seasons = {
  spring:{name:'春 · 樱', color:'#d7a0ac', line:'沿着水边，等一场花开', caption:'季节灵感 · 实际花况请另行确认'},
  summer:{name:'夏 · 绿', color:'#709b76', line:'把脚步，交给树荫和水声', caption:'季节灵感 · 给炎热午后多留休息'},
  autumn:{name:'秋 · 枫', color:'#c77752', line:'在屋檐与树影之间，遇见秋天', caption:'季节灵感 · 实际叶色请另行确认'},
  winter:{name:'冬 · 静', color:'#809ba7', line:'天冷一些，茶就暖一些', caption:'季节灵感 · 雪景并非每日可见'},
};
export const routes = [
  {id:'east', mood:'初次京都', title:'东山，慢慢走', subtitle:'木构舞台 → 石阶小巷 → 町家暮色', ids:['kiyomizu','sannenzaka','gion','kamo'], icon:'stage', color:'#b86748', reason:'从清水山坡往城里走，把建筑、街巷和河畔放在同一天，减少来回折返。', pause:'在老街或河畔，留一小时给一杯茶和临时发现。'},
  {id:'quiet', mood:'庭园与思考', title:'沿水，走进东山', subtitle:'苔庭 → 疏水小径 → 砖拱树影', ids:['ginkaku','philosopher','nanzen'], icon:'aqueduct', color:'#647f66', reason:'用哲学之道连接东山北部的寺院。以庭园和水声为主题；安静是旅行意图，不是实时客流保证。', pause:'在疏水沿线留一小时，不把整段步道走成赶路。'},
  {id:'green', mood:'山水之间', title:'借一日，给岚山', subtitle:'竹叶 → 借景庭园 → 自由河畔时间', ids:['arashiyama','tenryu'], icon:'bamboo', color:'#64867e', reason:'岚山离东山较远，单独安排一个半日或一日，给竹林、庭园与河边散步足够空间。', pause:'留白可以用来沿桂川散步；渡月桥可在实际导航中另查。'},
  {id:'taste', mood:'沿街寻味', title:'街巷里的日常', subtitle:'锦市场 → 河畔 → 祇园 → 八坂', ids:['nishiki','kamo','gion','yasaka'], icon:'market', color:'#c19754', reason:'以四条附近为中心，从食材小店走到河边，再进入祇园，减少跨城移动。', pause:'把一小时留给店内用餐。锦市场请在店铺指定位置吃东西。'},
  {id:'gold', mood:'古都庭园', title:'金色与白砂之间', subtitle:'金阁倒影 → 石庭 → 城池与庭园', ids:['kinkaku','ryoan','nijo'], icon:'gold', color:'#b59a52', reason:'先看洛西的两座庭园，再前往洛中二条城；有一段跨区转场，按当天交通另行确认。', pause:'可以在庭园后喝茶，让视觉和脚步都休息一下。'},
];

// Conservative editorial reserves, not live transit or measured route durations.
// Specific pairs override the generic zone matrix. Symmetric, no departure origin.
export const legReserves = {
  'kiyomizu|sannenzaka':[15,25,'步行'], 'gion|sannenzaka':[20,30,'步行'],
  'gion|kamo':[15,25,'步行'], 'gion|yasaka':[10,20,'步行'],
  'kamo|nishiki':[15,25,'步行'], 'ginkaku|philosopher':[10,20,'步行'],
  'nanzen|philosopher':[20,35,'步行'], 'arashiyama|tenryu':[15,25,'步行'],
  'kinkaku|ryoan':[25,40,'步行 / 交通'], 'nijo|ryoan':[40,60,'交通'],
  'heian|nanzen':[20,35,'步行'], 'sannenzaka|yasaka':[15,25,'步行'],
};

export const city = {
  id:'kyoto', name:'京都', brand:'京游', en:'KYOTO', subtitle:'一座城，慢慢走',
  intro:'把想去的地方，串成一段刚刚好的漫游。', checkedAt:CHECKED_AT,
  sourceNote:'景点基础介绍参考景区官方、日本国家旅游局和京都市官方旅游指南。', defaultSeason:'autumn', navigationQuery:'Kyoto Japan',
  ui:{stamp:'京',hero:'不必赶路。',defaultPlan:'我的京都小径',emptyPlan:'留给京都的一天',discovery:'点一处风景，听它讲一个小故事。',guideTitle:'把京都，走成自己的样子',etiquette:'祇园有居民与从业者的日常生活，请遵守私巷与禁拍规定。锦市场请在店铺指定位置吃东西，竹林与寺社请按现场指示游览。'},
  places,routes,seasons,kinds,foods,sources:SOURCES,
  planning:{legReserves,connectedZones:['central|east','central|north','north|northeast','central|northeast','central|northwest','northwest|west'],sameZone:[20,35],connected:[35,55],crossZone:[50,80]},
  map:{width:1040,height:960,
    rivers:[{name:'鸭 川',path:'M 550,-20 C 540,80 568,146 605,205 S 614,315 606,400 S 601,536 605,628 S 640,778 599,975',width:26,label:[596,455]}, {name:'高 野 川',path:'M 763,-20 Q 710,90 605,205',width:18}, {name:'桂 川',path:'M -30,367 Q 85,405 133,485 T 196,629 Q 210,753 350,978',width:24,label:[193,714]}],
    parks:[{x:105,y:377,rx:110,ry:130},{x:343,y:155,rx:150,ry:90},{x:496,y:290,rx:57,ry:98},{x:620,y:124,rx:59,ry:91},{x:871,y:336,rx:115,ry:252}],
    districts:[{x:90,y:585,name:'嵯 峨 · 岚 山',en:'ARASHIYAMA'},{x:337,y:70,name:'衣 笠 · 洛 西',en:'KINUGASA'},{x:415,y:727,name:'洛 中',en:'CENTRAL KYOTO'},{x:899,y:96,name:'东 山',en:'HIGASHIYAMA'},{x:843,y:877,name:'伏 见',en:'FUSHIMI'}],
    mountains:[{x:80,y:190,s:1.1},{x:40,y:250,s:.9},{x:930,y:250,s:1.2},{x:967,y:390,s:.8},{x:986,y:670,s:1.05}],
    trees:[[84,328],[71,422],[163,352],[261,125],[408,122],[263,212],[535,326],[466,232],[663,86],[585,110],[770,215],[932,309],[883,367],[923,402],[868,667],[938,763],[610,700],[649,811],[719,894],[65,553]],
    anchors:[{x:455,y:835,label:'京都站',icon:'train'}],
  },
};
