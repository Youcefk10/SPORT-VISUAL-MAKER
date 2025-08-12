const $ = (s) => document.querySelector(s);
const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

const state = {
template: "poster",
primary: "#0d6efd",
accent: "#f8d94e",
bgStyle: "gradient",
headline: "Match Day",
sub1: "Equipe A",
sub2: "Equipe B",
meta: "Dim. 15 sept · 21:00 · Stade de France",
watermark: "@CrazyAbout · sportvisual.app",
frame: false,
noise: true,
playerImage: null,
teamLogo: null,
imgScale: 1,
imgY: 0,
};

const sizes = {
poster: { w: 1080, h: 1350 },
card: { w: 1080, h: 1080 },
thumb: { w: 1280, h: 720 },
};

function setCanvasSize() {
const { w, h } = sizes[state.template];
canvas.width = w;
canvas.height = h;
}
setCanvasSize();

$("#template").addEventListener("change", (e) => { state.template = e.target.value; setCanvasSize(); render(); });
$("#primaryColor").addEventListener("input", (e)=>{ state.primary = e.target.value; render(); });
$("#accentColor").addEventListener("input", (e)=>{ state.accent = e.target.value; render(); });
$("#bgStyle").addEventListener("change", (e)=>{ state.bgStyle = e.target.value; render(); });

$("#headline").addEventListener("input", (e)=>{ state.headline = e.target.value; render(); });
$("#sub1").addEventListener("input", (e)=>{ state.sub1 = e.target.value; render(); });
$("#sub2").addEventListener("input", (e)=>{ state.sub2 = e.target.value; render(); });
$("#meta").addEventListener("input", (e)=>{ state.meta = e.target.value; render(); });
$("#watermark").addEventListener("input", (e)=>{ state.watermark = e.target.value; render(); });

$("#frame").addEventListener("change", (e)=>{ state.frame = e.target.checked; render(); });
$("#noise").addEventListener("change", (e)=>{ state.noise = e.target.checked; render(); });

$("#imgScale").addEventListener("input", (e)=>{ state.imgScale = parseFloat(e.target.value); render(); });
$("#imgY").addEventListener("input", (e)=>{ state.imgY = parseInt(e.target.value,10); render(); });

function readImage(file, cb){
const fr = new FileReader();
fr.onload = () => {
const img = new Image();
img.onload = () => cb(img);
img.src = fr.result;
};
fr.readAsDataURL(file);
}
$("#playerImage").addEventListener("change",(e)=>{
const f = e.target.files[0]; if(!f) return;
readImage(f, (img)=>{ state.playerImage = img; render(); });
});
$("#teamLogo").addEventListener("change",(e)=>{
const f = e.target.files[0]; if(!f) return;
readImage(f, (img)=>{ state.teamLogo = img; render(); });
});

document.querySelectorAll(".chip").forEach(btn=>{
btn.addEventListener("click", ()=>{
const p = btn.dataset.preset;
if(p==="madrid"){
state.template="poster"; $("#template").value="poster";
state.headline="EL CLÁSICO";
state.sub1="REAL MADRID";
state.sub2="FC BARCELONA";
state.meta="Dim. 15 sept · LaLiga · Bernabéu";
state.primary="#0d6efd"; state.accent="#f8d94e"; state.bgStyle="stripes";
} else if(p==="psg"){
state.template="poster"; $("#template").value="poster";
state.headline="LE CLASSIQUE";
state.sub1="PSG"; state.sub2="OM";
state.meta="Sam. 20:45 · Ligue 1 · Parc des Princes";
state.primary="#0a2540"; state.accent="#e31e24"; state.bgStyle="gradient";
} else if(p==="nba"){
state.template="card"; $("#template").value="card";
state.headline="FINALS MVP";
state.sub1="WEST CHAMPS"; state.sub2="EAST CHAMPS";
state.meta="Game 7 · 7:30 PM ET";
state.primary="#111827"; state.accent="#f59e0b"; state.bgStyle="grid";
} else if(p==="yt"){
state.template="thumb"; $("#template").value="thumb";
state.headline="TOP 10 TRANSFERS";
state.sub1="Shocks"; state.sub2="& Bargains";
state.meta="FULL VIDEO • WATCH NOW";
state.primary="#111111"; state.accent="#00ff9c"; state.bgStyle="stripes";
}
render();
});
});

function drawBackground(w,h){
ctx.save();
ctx.fillStyle = state.primary;
ctx.fillRect(0,0,w,h);

if(state.bgStyle==="gradient"){
const g = ctx.createLinearGradient(0,0,w,h);
g.addColorStop(0, state.primary);
g.addColorStop(1, state.accent + "cc");
ctx.fillStyle = g;
ctx.fillRect(0,0,w,h);
} else if(state.bgStyle==="stripes"){
ctx.globalAlpha = 0.15;
ctx.fillStyle = "#ffffff";
const step = 80;
ctx.translate(-h*0.4,0);
ctx.rotate(-Math.PI/8);
for(let x=-w; x<w*2; x+=step){
ctx.fillRect(x, -h, step*0.5, h*3);
}
ctx.setTransform(1,0,0,1,0,0);
ctx.globalAlpha = 1;
} else if(state.bgStyle==="grid"){
ctx.globalAlpha = 0.18;
ctx.strokeStyle = "#ffffff";
ctx.lineWidth = 1;
const step = 60;
for(let x=0; x<w; x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
for(let y=0; y<h; y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
ctx.globalAlpha = 1;
}

if(state.noise){
const imageData = ctx.getImageData(0,0,w,h);
const d = imageData.data;
for(let i=0; i<d.length; i+=4){
const n = (Math.random()*30 - 15);
d[i] = Math.min(255, Math.max(0, d[i] + n));
d[i+1] = Math.min(255, Math.max(0, d[i+1] + n));
d[i+2] = Math.min(255, Math.max(0, d[i+2] + n));
}
ctx.putImageData(imageData,0,0);
}
ctx.restore();
}

function drawFrame(w,h){
if(!state.frame) return;
ctx.save();
ctx.lineWidth = Math.max(4, Math.min(w,h)*0.015);
ctx.strokeStyle = "rgba(255,255,255,0.6)";
ctx.strokeRect(ctx.lineWidth/2, ctx.lineWidth/2, w-ctx.lineWidth, h-ctx.lineWidth);
ctx.restore();
}

function drawPlayer(w,h){
if(!state.playerImage) return;
const img = state.playerImage;
const targetH = state.template==="thumb" ? h*0.9 : h*0.7;
const scale = (targetH / img.height) * state.imgScale;
const drawW = img.width * scale;
const drawH = img.height * scale;
const x = w*0.5 - drawW*0.5;
const y = (h - drawH) - (h*0.15) + state.imgY;
ctx.save();
ctx.filter = "drop-shadow(0px 24px 32px rgba(0,0,0,0.4))";
ctx.drawImage(img, x, y, drawW, drawH);
ctx.restore();
}

function drawLogo(w,h){
if(!state.teamLogo) return;
const img = state.teamLogo;
const draw = Math.min(w,h)*0.14;
const x = w - draw - 36;
const y = 36;
ctx.save();
ctx.beginPath();
ctx.arc(x + draw/2, y + draw/2, draw/2, 0, Math.PI*2);
ctx.closePath();
ctx.fillStyle = "rgba(255,255,255,0.9)";
ctx.fill();
ctx.clip();
ctx.drawImage(img, x, y, draw, draw);
ctx.restore();
}

function drawTexts(w,h){
ctx.save();
ctx.textAlign="center";
ctx.fillStyle = "#ffffff";

const topY = h*0.18;
ctx.font = `900 ${Math.min(w,h)*0.11}px Impact, Haettenschweiler, 'Arial Black', sans-serif`;
ctx.shadowColor = "rgba(0,0,0,0.4)";
ctx.shadowBlur = 12;
ctx.fillText(state.headline.toUpperCase(), w/2, topY);

ctx.font = `700 ${Math.min(w,h)*0.045}px Inter, Arial, sans-serif`;
ctx.shadowBlur = 0;
ctx.fillStyle = "rgba(255,255,255,0.95)";
const ySub = topY + Math.min(w,h)*0.09;
ctx.fillText(`${state.sub1.toUpperCase()} vs ${state.sub2.toUpperCase()}`, w/2, ySub);

const meta = state.meta;
ctx.font = `600 ${Math.min(w,h)*0.03}px Inter, Arial, sans-serif`;
const padX = 24;
const textW = ctx.measureText(meta).width;
const rx = w/2 - textW/2 - padX;
const ry = ySub + Math.min(w,h)*0.05;
const rw = textW + padX*2;
const rh = Math.min(w,h)*0.055;
const r = rh/2;
ctx.save();
ctx.beginPath();
roundRect(ctx, rx, ry, rw, rh, r);
ctx.fillStyle = hexToRgba(state.accent, 0.9);
ctx.fill();
ctx.fillStyle = "#111827";
ctx.textBaseline = "middle";
ctx.fillText(meta, w/2, ry + rh/2 + 1);
ctx.restore();

if(state.watermark){
ctx.textAlign = "left";
ctx.fillStyle = "rgba(255,255,255,0.7)";
ctx.font = `500 ${Math.min(w,h)*0.022}px Inter, Arial, sans-serif`;
ctx.fillText(state.watermark, 24, h - 24);
}

ctx.restore();
}

function roundRect(ctx, x, y, w, h, r){
const rr = Math.min(r, w/2, h/2);
ctx.moveTo(x+rr, y);
ctx.arcTo(x+w, y, x+w, y+h, rr);
ctx.arcTo(x+w, y+h, x, y+h, rr);
ctx.arcTo(x, y+h, x, y, rr);
ctx.arcTo(x, y, x+w, y, rr);
ctx.closePath();
}

function hexToRgba(hex, alpha=1){
let c = hex.replace("#","");
if(c.length===3){ c = c.split("").map(x=>x+x).join(""); }
const r = parseInt(c.substring(0,2),16);
const g = parseInt(c.substring(2,4),16);
const b = parseInt(c.substring(4,6),16);
return `rgba(${r},${g},${b},${alpha})`;
}

function render(){
const { w, h } = sizes[state.template];
ctx.clearRect(0,0,w,h);
drawBackground(w,h);
drawPlayer(w,h);
drawLogo(w,h);
drawFrame(w,h);
drawTexts(w,h);
}
render();

$("#exportBtn").addEventListener("click", ()=>{
const name = `${state.template}-${Date.now()}.png`;
canvas.toBlob((blob)=>{
const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = name;
document.body.appendChild(a);
a.click();
URL.revokeObjectURL(a.href);
a.remove();
}, "image/png", 1.0);
});
