export const ASSETS={player:'https://raw.githubusercontent.com/21Programe/super-mario-js/main/assets/player-sheet.svg',enemy:'https://raw.githubusercontent.com/21Programe/super-mario-js/main/assets/enemy-sheet.svg',tiles:'https://raw.githubusercontent.com/21Programe/super-mario-js/main/assets/tiles-sheet.svg'};
export class AssetLoader{constructor(manifest=ASSETS,onProgress=()=>{}){this.manifest=manifest;this.onProgress=onProgress;this.images=new Map();this.errors=[]}
 async load(){const entries=Object.entries(this.manifest);let done=0;this.onProgress(0,'Preparando assets');await Promise.all(entries.map(async([key,url])=>{try{const img=await this.image(url);this.images.set(key,img)}catch(e){this.errors.push({key,url,error:e});console.warn('Asset falhou:',key,e)}finally{done++;this.onProgress(done/entries.length,key)}}));return this}
 image(url){return new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Falha ao carregar ${url}`));img.src=url})}
 get(key){return this.images.get(key)||null}}
export function frame(img,index,w,h){return {img,sx:index*w,sy:0,sw:w,sh:h}}
