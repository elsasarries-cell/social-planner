import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

const C = {
  bg: "#0F0F1A", surface: "#17172A", surfaceHover: "#1E1E35",
  border: "#2A2A45", accent: "#7C5CFC", accentLight: "#A688FF",
  accentGlow: "rgba(124,92,252,0.18)", coral: "#FF6B6B",
  green: "#4ECDC4", yellow: "#FFD93D", textPrimary: "#F0EFFF",
  textSecondary: "#8885AA", textMuted: "#4A4870", white: "#FFFFFF",
};

const FMT_ICONS  = { reel:"🎬", carrusel:"🖼️", historia:"✨", imagen:"📷" };
const FMT_LABELS = { reel:"Reel", carrusel:"Carrusel", historia:"Historia", imagen:"Imagen" };
const STATUS = {
  pending:           { bg:"#2A2215", border:"#FFD93D44", color:"#FFD93D",  label:"Pendiente" },
  content_approved:  { bg:"#152A20", border:"#4ECDC444", color:"#4ECDC4",  label:"Contenido ✓" },
  design_review:     { bg:"#1A1535", border:"#7C5CFC44", color:"#A688FF",  label:"Revisar diseño" },
  fully_approved:    { bg:"#152A20", border:"#4ECDC488", color:"#4ECDC4",  label:"Aprobado ✓✓" },
  changes_requested: { bg:"#2A1515", border:"#FF6B6B44", color:"#FF6B6B",  label:"Con cambios" },
};

const inp = (extra={}) => ({ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.textPrimary, fontSize:13, outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box", ...extra });
const btn = (color, extra={}) => ({ padding:"8px 16px", borderRadius:8, background:`${color}22`, border:`1px solid ${color}66`, color, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", ...extra });
const btnSolid = (extra={}) => ({ padding:"10px 20px", borderRadius:10, background:C.accent, border:"none", color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", ...extra });

function Label({ children }) {
  return <p style={{ color:C.textMuted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 5px" }}>{children}</p>;
}
function Card({ children, style={} }) {
  return <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16, ...style }}>{children}</div>;
}
function StatusPill({ status, small }) {
  const s = STATUS[status] || STATUS.pending;
  return <span style={{ display:"inline-flex", alignItems:"center", padding:small?"2px 8px":"4px 10px", borderRadius:20, background:s.bg, border:`1px solid ${s.border}`, color:s.color, fontSize:small?10:11, fontWeight:600, whiteSpace:"nowrap" }}>{s.label}</span>;
}
function FormatBadge({ format }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:6, background:"#1E1E35", border:"1px solid #2A2A45", color:C.textSecondary, fontSize:11 }}>{FMT_ICONS[format]} {FMT_LABELS[format]}</span>;
}
function Dots() {
  return <span style={{ display:"inline-flex", gap:4 }}>{[0,1,2].map(i=><span key={i} style={{ width:6,height:6,borderRadius:"50%",background:C.accent,animation:`b 1.2s ease-in-out ${i*.2}s infinite` }}/>)}<style>{`@keyframes b{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}`}</style></span>;
}
function StatsBar({ posts }) {
  const counts = { pending:0,content_approved:0,design_review:0,fully_approved:0,changes_requested:0 };
  posts.forEach(p=>{ if(counts[p.status]!==undefined) counts[p.status]++; });
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {[["fully_approved","Aprobados",C.green],["design_review","Revisar diseño",C.accentLight],["content_approved","Contenido ✓",C.yellow],["changes_requested","Cambios",C.coral],["pending","Pendientes",C.textMuted]].map(([k,l,col])=>(
        <div key={k} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:8, background:C.surface, border:`1px solid ${C.border}` }}>
          <span style={{ width:7,height:7,borderRadius:"50%",background:col,display:"inline-block" }}/>
          <span style={{ color:C.textSecondary, fontSize:11 }}>{counts[k]} {l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CALENDAR ────────────────────────────────────────────────────────────────
function CalendarView({ posts, month=7, year=2025 }) {
  const days = new Date(year, month, 0).getDate();
  const first = new Date(year, month-1, 1).getDay();
  const byDay = {};
  posts.forEach(p=>{ byDay[p.day]=[...(byDay[p.day]||[]),p]; });
  const cells = [...Array(first).fill(null), ...Array.from({length:days},(_,i)=>i+1)];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
        {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d=><div key={d} style={{ textAlign:"center", color:C.textMuted, fontSize:10, fontWeight:700, padding:"4px 0" }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {cells.map((day,i)=>(
          <div key={i} style={{ minHeight:56, borderRadius:8, padding:4, background:day?C.surface:"transparent", border:day?`1px solid ${C.border}`:"none" }}>
            {day&&<span style={{ color:C.textMuted, fontSize:10, fontWeight:600 }}>{day}</span>}
            {(byDay[day]||[]).map(p=>{ const s=STATUS[p.status]; return <div key={p.id} style={{ marginTop:3, padding:"2px 4px", borderRadius:4, background:s.bg, border:`1px solid ${s.border}`, fontSize:9, color:s.color }}>{FMT_ICONS[p.format]} {FMT_LABELS[p.format]}</div>; })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── POST CARD ────────────────────────────────────────────────────────────────
function PostCard({ post, onUpdate, clientView }) {
  const [open, setOpen]   = useState(false);
  const [dUrl, setDUrl]   = useState(post.design_url||"");
  const [comment, setComment] = useState("");
  const [dComment, setDComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(changes) { setSaving(true); await onUpdate(post.id, changes); setSaving(false); }

  return (
    <div style={{ background:C.surface, border:`1px solid ${open?C.border:"#1E1E35"}`, borderRadius:12, overflow:"hidden" }}>
      <div onClick={()=>setOpen(!open)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", cursor:"pointer", background:open?C.surfaceHover:"transparent" }}>
        <div style={{ width:36,height:36,borderRadius:8,background:C.accentGlow,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{FMT_ICONS[post.format]}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ color:C.textPrimary, fontWeight:600, fontSize:13 }}>{post.day} jul</span>
            <FormatBadge format={post.format}/>
            <StatusPill status={post.status} small/>
          </div>
          <p style={{ color:C.textSecondary, fontSize:12, margin:"3px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{post.hook}</p>
        </div>
        <span style={{ color:C.textMuted, fontSize:14 }}>{open?"▲":"▼"}</span>
      </div>

      {open&&(
        <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ paddingTop:14, display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"grid", gap:8 }}>
              {[["🎣 Hook",post.hook],["📝 Copy",post.copy],["👉 CTA",post.cta]].map(([l,v])=>(
                <div key={l}><Label>{l}</Label><p style={{ color:C.textPrimary, fontSize:13, margin:0, lineHeight:1.5 }}>{v}</p></div>
              ))}
            </div>
            {post.comment&&<div style={{ padding:"10px 12px", borderRadius:8, background:"#2A1515", border:"1px solid #FF6B6B33", color:"#FF6B6B", fontSize:12 }}>💬 <strong>Comentario:</strong> {post.comment}</div>}
            {post.design_comment&&<div style={{ padding:"10px 12px", borderRadius:8, background:"#2A1515", border:"1px solid #FF6B6B33", color:"#FF6B6B", fontSize:12 }}>🎨 <strong>Cambio en diseño:</strong> {post.design_comment}</div>}

            {post.design_url&&(
              <div style={{ padding:12, borderRadius:8, background:C.bg, border:`1px solid ${C.border}` }}>
                <Label>Diseño</Label>
                <img src={post.design_url} alt="Diseño" style={{ width:"100%", maxHeight:220, objectFit:"cover", borderRadius:8 }} onError={e=>e.target.style.display="none"}/>
              </div>
            )}

            {!clientView&&post.status==="content_approved"&&(
              <div style={{ display:"flex", gap:8 }}>
                <input placeholder="Link de Drive / Dropbox del diseño..." value={dUrl} onChange={e=>setDUrl(e.target.value)} style={{...inp(), flex:1, width:"auto"}}/>
                <button onClick={()=>save({design_url:dUrl,status:"design_review"})} style={btn(C.accent)}>{saving?"...":"Subir diseño"}</button>
              </div>
            )}
            {clientView&&post.status==="pending"&&(
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <button onClick={()=>save({status:"content_approved",comment:""})} style={btn(C.green)}>✓ Aprobar contenido</button>
                <div style={{ display:"flex", gap:8 }}>
                  <input placeholder="Pedí un cambio..." value={comment} onChange={e=>setComment(e.target.value)} style={{...inp(),flex:1,width:"auto"}}/>
                  <button onClick={()=>{save({status:"changes_requested",comment});setComment("");}} style={btn(C.coral)}>Cambiar</button>
                </div>
              </div>
            )}
            {clientView&&post.status==="design_review"&&(
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <button onClick={()=>save({status:"fully_approved",design_comment:""})} style={btn(C.green)}>✓ Aprobar diseño</button>
                <div style={{ display:"flex", gap:8 }}>
                  <input placeholder="Pedí un cambio en el diseño..." value={dComment} onChange={e=>setDComment(e.target.value)} style={{...inp(),flex:1,width:"auto"}}/>
                  <button onClick={()=>{save({status:"changes_requested",design_comment:dComment});setDComment("");}} style={btn(C.coral)}>Cambiar</button>
                </div>
              </div>
            )}
            {post.status==="fully_approved"&&<div style={{ padding:"10px 12px", borderRadius:8, background:"#152A20", border:"1px solid #4ECDC444", color:"#4ECDC4", fontSize:12, textAlign:"center", fontWeight:600 }}>✓ Contenido y diseño aprobados</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CLIENT FORM ──────────────────────────────────────────────────────────────
function ClientForm({ initial={}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name||"", rubro: initial.rubro||"", instagram: initial.instagram||"",
    color: initial.color||"#7C5CFC", tono: initial.tono||"",
    objetivo: initial.objetivo||"", audiencia: initial.audiencia||"",
    competencia: initial.competencia||"", hashtags: initial.hashtags||"",
    referencias: initial.referencias||"", formatos_preferidos: initial.formatos_preferidos||"",
    frecuencia: initial.frecuencia||"3", notas: initial.notas||"",
  });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function submit() {
    if(!form.name||!form.rubro||!form.instagram) return alert("Nombre, rubro e Instagram son obligatorios");
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  const section = (title) => <p style={{ color:C.accentLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"16px 0 10px", borderTop:`1px solid ${C.border}`, paddingTop:16 }}>{title}</p>;
  const field = (label, key, placeholder, type="text") => (
    <div>
      <Label>{label}</Label>
      <input type={type} placeholder={placeholder} value={form[key]} onChange={e=>set(key,e.target.value)} style={inp()}/>
    </div>
  );
  const textarea = (label, key, placeholder, rows=3) => (
    <div>
      <Label>{label}</Label>
      <textarea placeholder={placeholder} value={form[key]} onChange={e=>set(key,e.target.value)} rows={rows} style={{...inp(), resize:"vertical"}}/>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {section("📋 Datos básicos")}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {field("Nombre del cliente","name","Ej: Alma Café")}
        {field("Rubro","rubro","Ej: Gastronomía")}
        {field("Instagram","instagram","@cuenta")}
        <div>
          <Label>Color identificador</Label>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="color" value={form.color} onChange={e=>set("color",e.target.value)} style={{ width:40, height:36, borderRadius:8, border:`1px solid ${C.border}`, background:"none", cursor:"pointer", padding:2 }}/>
            <span style={{ color:C.textSecondary, fontSize:12 }}>{form.color}</span>
          </div>
        </div>
      </div>

      {section("🎯 Estrategia de contenido")}
      {textarea("Tono de voz","tono","Ej: Cercano, inspirador, sin tecnicismos. Usamos tuteo. Evitamos lenguaje corporativo.")}
      {textarea("Objetivo en redes","objetivo","Ej: Generar comunidad y dirigir tráfico al local. Aumentar reservas online.")}
      {textarea("Audiencia objetivo","audiencia","Ej: Mujeres 25-40 años, profesionales, interesadas en bienestar y gastronomía de autor.")}

      {section("🔍 Información para la IA")}
      {textarea("Competencia / Referencias","competencia","Ej: @competidor1, @competidor2. Nos diferenciamos por el servicio personalizado y los ingredientes locales.")}
      {textarea("Hashtags que funcionan","hashtags","Ej: #cafebuenosaires #specialty coffee #baristalife")}
      {textarea("Referencias de contenido que les gusta","referencias","Ej: Reels con proceso de preparación, fotos de ambiente, testimonios de clientes, behind the scenes.")}
      {textarea("Formatos que mejor funcionan","formatos_preferidos","Ej: Los reels tienen más alcance, los carruseles más guardados, las historias para promociones del día.")}

      {section("📅 Planificación")}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <Label>Frecuencia semanal de posts</Label>
          <select value={form.frecuencia} onChange={e=>set("frecuencia",e.target.value)} style={{...inp()}}>
            {["1","2","3","4","5","6","7"].map(n=><option key={n} value={n}>{n} post{n!=="1"?"s":""} por semana</option>)}
          </select>
        </div>
      </div>
      {textarea("Notas adicionales","notas","Cualquier cosa importante que la IA deba saber: fechas especiales, promociones, eventos del mes, restricciones, etc.")}

      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
        <button onClick={onCancel} style={btn(C.textSecondary)}>Cancelar</button>
        <button onClick={submit} style={btnSolid()}>{saving?"Guardando...":"Guardar cliente"}</button>
      </div>
    </div>
  );
}

// ─── AI MODAL ─────────────────────────────────────────────────────────────────
function AIModal({ client, onGenerate, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const [month, setMonth]     = useState(7);
  const [year, setYear]       = useState(2025);

  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  async function generate() {
    setLoading(true); setError(""); setResult(null);
    const freq = parseInt(client.frecuencia||"3");
    const weeks = 4;
    const totalPosts = freq * weeks;

    const prompt = `Sos un estratega de contenido para Instagram especializado en ${client.rubro}.
Creá un plan de contenido para ${months[month-1]} ${year} para ${client.name} (${client.instagram}).

PERFIL DEL CLIENTE:
- Rubro: ${client.rubro}
- Tono de voz: ${client.tono||"cercano y auténtico"}
- Objetivo: ${client.objetivo||"generar comunidad y ventas"}
- Audiencia: ${client.audiencia||"público general interesado en el rubro"}
- Competencia/Referencias: ${client.competencia||"no especificado"}
- Hashtags: ${client.hashtags||"no especificado"}
- Referencias de contenido: ${client.referencias||"no especificado"}
- Formatos que funcionan: ${client.formatos_preferidos||"todos los formatos"}
- Frecuencia: ${freq} posts por semana
- Notas del mes: ${client.notas||"ninguna"}

Devolvé SOLO un JSON válido sin markdown con este formato:
{
  "posts": [
    {"day": 2, "format": "reel", "hook": "...", "copy": "...", "cta": "..."}
  ],
  "trends": ["tendencia 1", "tendencia 2", "tendencia 3", "tendencia 4"],
  "hooks_virales": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5"],
  "estrategia": "Párrafo breve explicando la estrategia del mes"
}

Generá exactamente ${totalPosts} posts distribuidos en el mes de ${months[month-1]} (días del 1 al ${new Date(year,month,0).getDate()}).
Formatos disponibles: reel, carrusel, historia, imagen.
Distribuí los formatos de forma variada según lo que mejor funciona para este cliente.
El contenido debe ser específico para ${client.rubro}, en español, con el tono indicado.
Los hooks deben ser directos, generar curiosidad o emoción, máximo 15 palabras.
Los copies deben ser naturales, no corporativos.`;

    try {
      const res = await fetch("/api/generate", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:4000,
          messages:[{role:"user",content:prompt}]
        })
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      const text = data.content?.map(i=>i.text||"").join("")||"";
      let cleaned = text.replace(/```json|```/g,"").trim();
// Si el JSON está incompleto, intentar cerrarlo
if(!cleaned.endsWith("}")) {
  const lastBrace = cleaned.lastIndexOf("}");
  if(lastBrace > 0) cleaned = cleaned.substring(0, lastBrace + 1) + "]}";
}
const parsed = JSON.parse(cleaned);
      setResult({...parsed, month, year});
    } catch(e) {
      setError("Error al generar. Verificá que la API key de Anthropic esté configurada en Vercel.");
    }
    setLoading(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, width:"100%", maxWidth:580, maxHeight:"88vh", overflow:"auto", padding:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h2 style={{ color:C.textPrimary, margin:0, fontSize:18 }}>✨ Generar plan con IA</h2>
            <p style={{ color:C.textSecondary, fontSize:13, margin:"4px 0 0" }}>{client.name} · {client.rubro}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.textMuted, fontSize:20, cursor:"pointer" }}>✕</button>
        </div>

        {!loading&&!result&&(
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Card>
              <Label>Mes a planificar</Label>
              <div style={{ display:"flex", gap:8 }}>
                <select value={month} onChange={e=>setMonth(+e.target.value)} style={{...inp(),flex:1,width:"auto"}}>
                  {months.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
                <select value={year} onChange={e=>setYear(+e.target.value)} style={{...inp(),width:100}}>
                  {[2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </Card>

            <Card style={{ background:"#1A1535", border:`1px solid ${C.accent}33` }}>
              <p style={{ color:C.accentLight, fontWeight:600, fontSize:13, margin:"0 0 8px" }}>La IA va a usar el perfil completo del cliente para:</p>
              {["Generar hooks virales adaptados al rubro y tono","Crear copies con la voz del cliente","Distribuir los formatos según lo que mejor funciona","Respetar la frecuencia configurada","Considerar las notas y eventos del mes"].map((t,i)=>(
                <p key={i} style={{ color:C.textSecondary, fontSize:12, margin:"4px 0" }}>✓ {t}</p>
              ))}
            </Card>

            {error&&<p style={{ color:C.coral, fontSize:13 }}>{error}</p>}
            <button onClick={generate} style={btnSolid({width:"100%",padding:"12px"})}>Generar plan →</button>
          </div>
        )}

        {loading&&(
          <div style={{ textAlign:"center", padding:"50px 0" }}>
            <Dots/>
            <p style={{ color:C.textSecondary, fontSize:13, marginTop:16 }}>Analizando el perfil y generando contenido estratégico...</p>
            <p style={{ color:C.textMuted, fontSize:12, marginTop:4 }}>Esto puede tomar unos segundos</p>
          </div>
        )}

        {result&&(
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {result.estrategia&&(
              <Card style={{ background:"#1A1535", border:`1px solid ${C.accent}33` }}>
                <Label>Estrategia del mes</Label>
                <p style={{ color:C.textPrimary, fontSize:13, margin:0, lineHeight:1.6 }}>{result.estrategia}</p>
              </Card>
            )}
            <Card>
              <p style={{ color:C.accentLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>📈 Tendencias del rubro</p>
              {result.trends?.map((t,i)=><p key={i} style={{ color:C.textPrimary, fontSize:13, margin:"4px 0" }}>· {t}</p>)}
            </Card>
            <Card>
              <p style={{ color:C.yellow, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>🎣 Hooks virales</p>
              {result.hooks_virales?.map((h,i)=><p key={i} style={{ color:C.textPrimary, fontSize:13, margin:"4px 0" }}>· {h}</p>)}
            </Card>
            <div>
              <p style={{ color:C.textSecondary, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>📅 Posts generados ({result.posts?.length})</p>
              {result.posts?.map((p,i)=>(
                <div key={i} style={{ padding:"10px 12px", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, marginBottom:8 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                    <span style={{ color:C.textPrimary, fontWeight:600, fontSize:12 }}>{p.day} {months[result.month-1]}</span>
                    <FormatBadge format={p.format}/>
                  </div>
                  <p style={{ color:C.textSecondary, fontSize:12, margin:"2px 0 0" }}>{p.hook}</p>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>{setResult(null);setError("");}} style={btn(C.textSecondary)}>← Regenerar</button>
              <button onClick={()=>{onGenerate(result);onClose();}} style={btnSolid({flex:1})}>Agregar al calendario →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AGENCY VIEW ──────────────────────────────────────────────────────────────
function AgencyView({ clients, posts, onUpdatePost, onAddPosts, onSaveClient, onDeleteClient }) {
  const [selected, setSelected]     = useState(null);
  const [tab, setTab]               = useState("list");
  const [showAI, setShowAI]         = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [copied, setCopied]         = useState(false);

  const client = clients.find(c=>c.id===selected);
  const clientPosts = posts.filter(p=>p.client_id===selected);

  useEffect(()=>{ if(!selected&&clients.length>0) setSelected(clients[0].id); },[clients]);

  function copyLink() {
    const url = `${window.location.origin}?view=client&cid=${selected}`;
    navigator.clipboard.writeText(url).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }

  async function handleAIGenerate(result) {
    const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const newPosts = result.posts.map(p=>({
      client_id: selected, day:p.day, month:result.month, year:result.year,
      format:p.format, hook:p.hook, copy:p.copy, cta:p.cta,
      status:"pending", design_url:"", design_comment:"", comment:"",
    }));
    await onAddPosts(newPosts);
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Inter, system-ui, sans-serif" }}>
      {showAI&&client&&<AIModal client={client} onGenerate={handleAIGenerate} onClose={()=>setShowAI(false)}/>}

      {(showForm||editClient)&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
          <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, width:"100%", maxWidth:640, maxHeight:"90vh", overflow:"auto", padding:24 }}>
            <h2 style={{ color:C.textPrimary, margin:"0 0 4px", fontSize:18 }}>{editClient?"Editar cliente":"Nuevo cliente"}</h2>
            <p style={{ color:C.textSecondary, fontSize:13, margin:"0 0 16px" }}>Completá el perfil para que la IA genere mejor contenido</p>
            <ClientForm
              initial={editClient||{}}
              onSave={async(data)=>{ await onSaveClient(data, editClient?.id); setShowForm(false); setEditClient(null); }}
              onCancel={()=>{ setShowForm(false); setEditClient(null); }}
            />
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32,height:32,borderRadius:8,background:C.accentGlow,border:`1px solid ${C.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>📅</div>
          <div>
            <h1 style={{ color:C.textPrimary, margin:0, fontSize:16, fontWeight:700 }}>Social Planner</h1>
            <p style={{ color:C.textMuted, margin:0, fontSize:11 }}>Panel de agencia</p>
          </div>
        </div>
        <button onClick={()=>setShowForm(true)} style={btnSolid({fontSize:12,padding:"8px 14px"})}>+ Nuevo cliente</button>
      </div>

      <div style={{ display:"flex", height:"calc(100vh - 57px)" }}>
        {/* Sidebar */}
        <div style={{ width:210, flexShrink:0, background:C.surface, borderRight:`1px solid ${C.border}`, padding:12, display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
          <p style={{ color:C.textMuted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", padding:"4px 8px", margin:"0 0 4px" }}>Clientes ({clients.length})</p>
          {clients.length===0&&<p style={{ color:C.textMuted, fontSize:12, padding:"8px", textAlign:"center" }}>Sin clientes aún. Creá el primero →</p>}
          {clients.map(c=>{
            const cp = posts.filter(p=>p.client_id===c.id);
            const badge = cp.filter(p=>["pending","design_review","changes_requested"].includes(p.status)).length;
            return (
              <button key={c.id} onClick={()=>setSelected(c.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:8, cursor:"pointer", background:selected===c.id?C.accentGlow:"transparent", border:`1px solid ${selected===c.id?C.accent+"44":"transparent"}`, textAlign:"left", fontFamily:"inherit" }}>
                <div style={{ width:28,height:28,borderRadius:7,flexShrink:0,background:`${c.color}22`,border:`1px solid ${c.color}44`,display:"flex",alignItems:"center",justifyContent:"center",color:c.color,fontWeight:800,fontSize:12 }}>{c.name[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:C.textPrimary, margin:0, fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</p>
                  <p style={{ color:C.textMuted, margin:0, fontSize:10 }}>{c.rubro}</p>
                </div>
                {badge>0&&<span style={{ width:18,height:18,borderRadius:"50%",background:C.coral,color:C.white,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Main */}
        <div style={{ flex:1, overflow:"auto", padding:20 }}>
          {!client?(
            <div style={{ textAlign:"center", padding:"80px 20px", color:C.textMuted }}>
              <p style={{ fontSize:40, margin:"0 0 12px" }}>👋</p>
              <p style={{ fontSize:14, fontWeight:600, color:C.textSecondary }}>Creá tu primer cliente para empezar</p>
              <button onClick={()=>setShowForm(true)} style={btnSolid({marginTop:16})}>+ Nuevo cliente</button>
            </div>
          ):(
            <>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
                <div>
                  <h2 style={{ color:C.textPrimary, margin:"0 0 4px", fontSize:20, fontWeight:700 }}><span style={{ color:client.color }}>{client.name}</span></h2>
                  <p style={{ color:C.textSecondary, margin:0, fontSize:13 }}>{client.instagram} · {client.rubro}</p>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <button onClick={()=>setEditClient(client)} style={btn(C.textSecondary,{fontSize:12})}>✏️ Editar perfil</button>
                  <button onClick={copyLink} style={btn(C.textSecondary,{fontSize:12})}>{copied?"✓ Copiado":"🔗 Link cliente"}</button>
                  <button onClick={()=>setShowAI(true)} style={btn(C.accentLight,{fontSize:12,fontWeight:700})}>✨ Generar con IA</button>
                </div>
              </div>

              <StatsBar posts={clientPosts}/>

              <div style={{ display:"flex", gap:4, margin:"14px 0 12px" }}>
                {[{key:"list",label:"Publicaciones"},{key:"calendar",label:"Calendario"},{key:"profile",label:"Perfil IA"}].map(t=>(
                  <button key={t.key} onClick={()=>setTab(t.key)} style={{ padding:"7px 16px", borderRadius:8, cursor:"pointer", background:tab===t.key?C.accent:C.surface, border:`1px solid ${tab===t.key?C.accent:C.border}`, color:tab===t.key?C.white:C.textSecondary, fontSize:13, fontWeight:600, fontFamily:"inherit" }}>{t.label}</button>
                ))}
              </div>

              {tab==="calendar"&&<CalendarView posts={clientPosts}/>}

              {tab==="profile"&&(
                <Card>
                  <p style={{ color:C.accentLight, fontWeight:700, fontSize:14, margin:"0 0 16px" }}>Perfil de contenido — usado por la IA</p>
                  <div style={{ display:"grid", gap:14 }}>
                    {[
                      ["Tono de voz",client.tono],["Objetivo",client.objetivo],["Audiencia",client.audiencia],
                      ["Competencia/Referencias",client.competencia],["Hashtags",client.hashtags],
                      ["Referencias de contenido",client.referencias],["Formatos que funcionan",client.formatos_preferidos],
                      ["Frecuencia",`${client.frecuencia} posts por semana`],["Notas del mes",client.notas],
                    ].map(([l,v])=>v?(
                      <div key={l}>
                        <Label>{l}</Label>
                        <p style={{ color:C.textPrimary, fontSize:13, margin:0, lineHeight:1.5 }}>{v}</p>
                      </div>
                    ):null)}
                  </div>
                  <button onClick={()=>setEditClient(client)} style={{...btnSolid(),marginTop:16}}>✏️ Editar perfil</button>
                </Card>
              )}

              {tab==="list"&&(
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {clientPosts.length===0?(
                    <div style={{ textAlign:"center", padding:"60px 20px", color:C.textMuted }}>
                      <p style={{ fontSize:40, margin:"0 0 12px" }}>📭</p>
                      <p style={{ fontSize:14, fontWeight:600, color:C.textSecondary }}>Sin posts todavía</p>
                      <p style={{ fontSize:13 }}>Usá "Generar con IA" para crear el plan del mes</p>
                    </div>
                  ):(
                    clientPosts.sort((a,b)=>a.day-b.day).map(post=>(
                      <PostCard key={post.id} post={post} onUpdate={onUpdatePost} clientView={false}/>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT VIEW ──────────────────────────────────────────────────────────────
function ClientView({ client, posts, onUpdate }) {
  const [tab, setTab] = useState("list");
  const needsAction = posts.filter(p=>["pending","design_review","changes_requested"].includes(p.status)).length;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Inter, system-ui, sans-serif" }}>
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40,height:40,borderRadius:10,background:`${client.color}22`,border:`1px solid ${client.color}44`,display:"flex",alignItems:"center",justifyContent:"center",color:client.color,fontWeight:800,fontSize:16 }}>{client.name[0]}</div>
          <div>
            <h1 style={{ color:C.textPrimary, margin:0, fontSize:17, fontWeight:700 }}>{client.name}</h1>
            <p style={{ color:C.textSecondary, margin:0, fontSize:12 }}>Plan de contenido · {client.instagram}</p>
          </div>
        </div>
      </div>
      <div style={{ padding:16, maxWidth:680, margin:"0 auto" }}>
        <StatsBar posts={posts}/>
        {needsAction>0&&(
          <div style={{ marginTop:16, padding:"12px 16px", borderRadius:10, background:"#1A1535", border:`1px solid ${C.accent}44`, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>👋</span>
            <p style={{ color:C.accentLight, fontWeight:600, fontSize:13, margin:0 }}>{needsAction} publicación{needsAction!==1?"es":""} esperan tu revisión</p>
          </div>
        )}
        <div style={{ display:"flex", gap:4, margin:"16px 0 12px" }}>
          {[{key:"list",label:"Lista"},{key:"calendar",label:"Calendario"}].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{ padding:"7px 16px", borderRadius:8, cursor:"pointer", background:tab===t.key?C.accent:C.surface, border:`1px solid ${tab===t.key?C.accent:C.border}`, color:tab===t.key?C.white:C.textSecondary, fontSize:13, fontWeight:600, fontFamily:"inherit" }}>{t.label}</button>
          ))}
        </div>
        {tab==="calendar"?<CalendarView posts={posts}/>:(
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {posts.sort((a,b)=>a.day-b.day).map(post=>(
              <PostCard key={post.id} post={post} onUpdate={onUpdate} clientView/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [clients, setClients] = useState([]);
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState("agency");
  const [clientId, setClientId] = useState(null);

  useEffect(()=>{
    const p = new URLSearchParams(window.location.search);
    if(p.get("view")==="client"&&p.get("cid")){ setView("client"); setClientId(p.get("cid")); }
  },[]);

  useEffect(()=>{
    async function load() {
      const [{ data:c },{ data:p }] = await Promise.all([
        supabase.from("clients").select("*").order("name"),
        supabase.from("posts").select("*").order("day"),
      ]);
      setClients(c||[]); setPosts(p||[]); setLoading(false);
    }
    load();
  },[]);

  useEffect(()=>{
    const ch = supabase.channel("posts-rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"posts"},payload=>{
        if(payload.eventType==="UPDATE") setPosts(prev=>prev.map(p=>p.id===payload.new.id?payload.new:p));
        if(payload.eventType==="INSERT") setPosts(prev=>[...prev,payload.new]);
        if(payload.eventType==="DELETE") setPosts(prev=>prev.filter(p=>p.id!==payload.old.id));
      }).subscribe();
    return ()=>supabase.removeChannel(ch);
  },[]);

  async function updatePost(id, changes) {
    const { data } = await supabase.from("posts").update(changes).eq("id",id).select().single();
    if(data) setPosts(prev=>prev.map(p=>p.id===id?data:p));
  }

  async function addPosts(newPosts) {
    const { data } = await supabase.from("posts").insert(newPosts).select();
    if(data) setPosts(prev=>[...prev,...data]);
  }

  async function saveClient(data, id) {
    if(id) {
      const { data:updated } = await supabase.from("clients").update(data).eq("id",id).select().single();
      if(updated) setClients(prev=>prev.map(c=>c.id===id?updated:c));
    } else {
      const { data:created } = await supabase.from("clients").insert(data).select().single();
      if(created) setClients(prev=>[...prev,created]);
    }
  }

  if(loading) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter, system-ui, sans-serif" }}>
      <div style={{ textAlign:"center" }}><Dots/><p style={{ color:C.textSecondary, marginTop:16, fontSize:14 }}>Cargando...</p></div>
    </div>
  );

  if(view==="client"&&clientId) {
    const client = clients.find(c=>c.id===clientId);
    if(!client) return <div style={{ color:C.textPrimary, padding:40, fontFamily:"Inter" }}>Cliente no encontrado.</div>;
    return <ClientView client={client} posts={posts.filter(p=>p.client_id===clientId)} onUpdate={updatePost}/>;
  }

  return <AgencyView clients={clients} posts={posts} onUpdatePost={updatePost} onAddPosts={addPosts} onSaveClient={saveClient}/>;
}
