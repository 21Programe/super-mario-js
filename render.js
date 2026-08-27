export class Renderer {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d', { alpha:false, desynchronized:true });
    this.W = 400; this.H = 240;
    this.buf = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(this.W,this.H) : document.createElement('canvas');
    this.buf.width=this.W; this.buf.height=this.H;
    this.g=this.buf.getContext('2d');
    this.g.imageSmoothingEnabled=false; this.ctx.imageSmoothingEnabled=false;
    this.assets=null; this.time=0;
    this.resize();
  }
  setAssets(loader){this.assets=loader}
  resize(){const r=this.c.getBoundingClientRect();const d=Math.min(window.devicePixelRatio||1,2);this.c.width=Math.max(1,Math.round(r.width*d));this.c.height=Math.max(1,Math.round(r.height*d));this.ctx.imageSmoothingEnabled=false}
  sprite(key,i,x,y,w=16,h=16,scale=1,alpha=1){const img=this.assets?.get(key);if(!img)return false;this.g.save();this.g.globalAlpha=alpha;this.g.imageSmoothingEnabled=false;this.g.drawImage(img,i*w,0,w,h,Math.round(x),Math.round(y),w*scale,h*scale);this.g.restore();return true}
  background(camera){const g=this.g;g.fillStyle='#68b7ff';g.fillRect(0,0,this.W,this.H);g.fillStyle='rgba(255,255,255,.86)';for(let i=0;i<8;i++){const x=((i*87-camera.x*.055)%470+470)%470;const y=25+(i%3)*25;g.beginPath();g.ellipse(x,y,24,7,0,0,Math.PI*2);g.ellipse(x+16,y+1,18,6,0,0,Math.PI*2);g.fill()}
    const hill=(depth,base,amp,fill)=>{g.fillStyle=fill;g.beginPath();g.moveTo(0,this.H);for(let x=0;x<=this.W;x+=8){const wx=x+camera.x*depth;g.lineTo(x,base+Math.sin(wx/48)*amp+Math.sin(wx/91)*amp*.45)}g.lineTo(this.W,this.H);g.closePath();g.fill()};
    hill(.10,164,15,'#a7dc7b');hill(.18,187,13,'#65bd58');hill(.28,207,10,'#3f9947');
    g.fillStyle='rgba(255,255,210,.16)';g.fillRect(0,0,this.W,120);
  }
  tile(type,x,y,used=false){const i=type==='?'?2:type==='#'?1:3;if(!this.sprite('tiles',i,x,y)){
      this.g.fillStyle=type==='?'?(used?'#c89516':'#f7ce25'):'#a85a2c';this.g.fillRect(x,y,16,16);this.g.strokeStyle='rgba(0,0,0,.3)';this.g.strokeRect(x+.5,y+.5,15,15);
      if(type==='?'&&!used){this.g.fillStyle='#fff';this.g.font='bold 11px monospace';this.g.fillText('?',x+5,y+12)}
    }}
  draw(world,p,camera,particles,bullets,time){this.time+=1/60;const g=this.g;g.clearRect(0,0,this.W,this.H);this.background(camera);g.save();g.translate(-Math.round(camera.x),-Math.round(camera.y));
    for(const b of world.blocks){if(b.w<=0)continue;if(b.x+16<camera.x||b.x>camera.x+this.W||b.y+16<camera.y||b.y>camera.y+this.H)continue;this.tile(b.type,b.x,b.y,b.used)}
    for(const c of world.coins)if(!c.collected){g.save();g.translate(c.x+3.5,c.y+6);g.scale(.55+.45*Math.abs(Math.sin(this.time*7+c.x)),1);g.fillStyle='#ffd83d';g.beginPath();g.arc(0,0,6,0,Math.PI*2);g.fill();g.fillStyle='#fff3a0';g.fillRect(-1,-4,2,4);g.restore()}
    for(const it of world.items)if(!it.hidden){g.save();g.globalAlpha=.92;g.fillStyle=it.type==='flower'?'#ff477e':it.type==='star'?'#ffd22e':'#e33b2f';g.beginPath();g.arc(it.x+6,it.y+7,6,0,Math.PI*2);g.fill();g.restore()}
    for(const e of world.enemies)if(e.alive){const i=e.state==='shell'?2:Math.floor(this.time*8+e.x)%2;this.sprite('enemy',i,e.x,e.y)||this.fallbackEnemy(e)}
    const a=p.state==='Idle'?0:p.state==='Walk'?1:p.state==='Run'?2:p.state==='Jump'?3:p.state==='Fall'?4:p.state==='PowerUp'?5:6;this.sprite('player',a,p.body.x,p.body.y)||this.fallbackPlayer(p);
    for(const q of particles){g.save();g.globalAlpha=Math.max(0,q.life/.9);g.fillStyle=q.color||'#fff';g.fillRect(q.x,q.y,Math.max(1,q.s),Math.max(1,q.s));g.restore()}
    for(const b of bullets){g.save();g.globalAlpha=.9;g.fillStyle='#fff2a8';g.shadowColor='#ffd34d';g.shadowBlur=5;g.fillRect(b.x,b.y,b.w,b.h);g.restore()}
    g.restore();this.ctx.drawImage(this.buf,0,0,this.c.width,this.c.height)}
  fallbackEnemy(e){const g=this.g;g.fillStyle=e.state==='shell'?'#3e9347':'#9a4d26';g.fillRect(e.x,e.y,14,11);g.fillStyle='#171717';g.fillRect(e.x+2,e.y+10,4,4);g.fillRect(e.x+9,e.y+10,4,4)}
  fallbackPlayer(p){const g=this.g;g.fillStyle=p.power==='fire'?'#ff7043':'#df332c';g.fillRect(p.body.x,p.body.y,p.body.w,p.body.h);g.fillStyle='#f3c7a4';g.fillRect(p.body.x+3,p.body.y+2,p.body.w-6,6)}
}
