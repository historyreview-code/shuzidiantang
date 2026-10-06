export const cityDirectory=[
 {id:'kyoto',name:'京都',number:'01',line:'庭园、街巷与水声'},
 {id:'edinburgh',name:'爱丁堡',number:'02',line:'山脊、石城与海风'},
 {id:'harbin',name:'哈尔滨',number:'03',line:'冰雪、老街与江风'},
 {id:'york',name:'约克',number:'04',line:'城墙、河流与一口甜'},
 {id:'cambridge',name:'剑桥',number:'05',line:'学院、康河与好奇心'},
 {id:'glasgow',name:'格拉斯哥',number:'06',line:'艺术、工业与公园深处'}
];
export function cityDirectoryHTML(current){return `<div class="utility-body city-options"><p>六座城市，六种慢游方式。每座城市单独保存行程。</p>${cityDirectory.map(c=>`<a class="button${c.id===current?' primary':''}" href="${c.id===current?'./':`https://shuzidiantang.com/travel/${c.id}/`}"${c.id===current?' aria-current="page"':''}>${c.number} ${c.name} · ${c.line}</a>`).join('')}</div>`;}
