export const PLAYER_STATES=Object.freeze({IDLE:'Idle',WALK:'Walk',RUN:'Run',JUMP:'Jump',FALL:'Fall',CROUCH:'Crouch',DIE:'Die',POWERUP:'PowerUp'});
const n=(k,d)=>{const v=Number(localStorage.getItem(k));return Number.isFinite(v)?v:d};
export class StateStore{constructor(){this.data={screen:'menu',world:n('jsbros.world',0),score:n('jsbros.score',0),coins:0,lives:Math.max(1,n('jsbros.lives',3)),time:300,muted:localStorage.getItem('jsbros.muted')==='1',sfxVolume:n('jsbros.sfxVolume',.8),bgmVolume:n('jsbros.bgmVolume',.35),checkpoint:localStorage.getItem('jsbros.checkpoint')||null,highScore:n('jsbros.highScore',0)};this.listeners=[]}
set(p){Object.assign(this.data,p);this.save();this.listeners.forEach(fn=>fn(this.data))}
save(){for(const [k,v] of [['jsbros.score',this.data.score],['jsbros.lives',this.data.lives],['jsbros.world',this.data.world],['jsbros.muted',this.data.muted?'1':'0'],['jsbros.sfxVolume',this.data.sfxVolume],['jsbros.bgmVolume',this.data.bgmVolume],['jsbros.highScore',Math.max(this.data.highScore,this.data.score)]])localStorage.setItem(k,String(v));if(this.data.checkpoint!=null)localStorage.setItem('jsbros.checkpoint',String(this.data.checkpoint))}
on(fn){this.listeners.push(fn)}}
export const state=new StateStore();
