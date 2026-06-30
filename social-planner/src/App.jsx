import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

const C = {
  bg:"#0F0F1A", surface:"#17172A", surfaceHover:"#1E1E35",
  border:"#2A2A45", accent:"#7C5CFC", accentLight:"#A688FF",
  accentGlow:"rgba(124,92,252,0.18)", coral:"#FF6B6B",
  green:"#4ECDC4", yellow:"#FFD93D", textPrimary:"#F0EFFF",
  textSecondary:"#8885AA", textMuted:"#4A4870", white:"#FFFFFF",
};

const FMT_ICONS  = { reel:"🎬", carrusel:"🖼️", historia:"✨", imagen:"📷" };
const FMT_LABELS = { reel:"Reel", carrusel:"Carrusel", historia:"Historia", imagen:"Imagen" };
const STATUS = {
  pending:           { bg:"#2A2215", border:"#FFD93D44", color:"#FFD93D",  label:"Pendiente" },
  content_approved:  { bg:"#152A20", border:"#4ECDC444", color:"#4ECDC4",  label:"Contenido ✓" },
  design_review:     { bg:"#1A1535", border:"#7C5CFC44", color:"#A688FF",  label:"Revisar diseño" },
  fully_approved:    { bg:"#152A20", border:"#4ECDC488", color:"#4ECDC4",  label:"Aprobado ✓✓" },
  changes_requested: { bg:"#2A1515", border:"#FF6B6B44", color:"#FF6B6B",  label:"Con cambios" },
  published:         { bg:"#0F1F2A", border:"#00B4D844", color:"#00B4D8",  label:"Publicado 🚀" },
};
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const inp = (x={}) => ({ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.textPrimary, fontSize:13, outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box", ...x });
const btn = (color, x={}) => ({ padding:"8px 14px", borderRadius:8, background:`${color}22`, border:`1px solid ${color}66`, color, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", ...x });
const btnSolid = (x={}) => ({ padding:"10px 20px", borderRadius:10, background:C.accent, border:"none", color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", ...x });

function Lbl({ children }) { return <p style={{ color:C.textMuted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 5px" }}>{children}</p>; }
function Card({ children, style={} }) { return <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16, ...style }}>{children}</div>; }
function Pill({ status, small }) {
  const s = STATUS[status]||STATUS.pending;
  return <span style={{ display:"inline-flex", alignItems:"center", padding:small?"2px 8px":"4px 10px", borderRadius:20, background:s.bg, border:`1px solid ${s.border}`, color:s.color, fontSize:small?10:11, fontWeight:600, whiteSpace:"nowrap" }}>{s.label}</span>;
}
function FmtBadge({ format }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:6, background:"#1E1E35", border:"1px solid #2A2A45", color:C.textSecondary, fontSize:11 }}>{FMT_ICONS[format]} {FMT_LABELS[format]}</span>;
}
function FeeBar({ posts, feeContenidos, month, year }) {
  const fee = parseInt(feeContenidos||"0");
  if(!fee) return null;
  const monthPosts = posts.filter(p=>p.month===month&&p.year===year&&p.status!=="changes_requested");
  const count = monthPosts.length;
  const extra = count - fee;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", borderRadius:10, background: extra>0?"#2A1515":"#152A20", border:`1px solid ${extra>0?"#FF6B6B44":"#4ECDC444"}` }}>
      <span style={{ fontSize:16 }}>{extra>0?"⚠️":"📦"}</span>
      <div>
        <span style={{ color: extra>0?C.coral:C.green, fontWeight:700, fontSize:13 }}>
          {count} / {fee} contenidos este mes
        </span>
        {extra>0&&<span style={{ color:C.coral, fontSize:12, marginLeft:8 }}>· Extra: {extra} contenido{extra!==1?"s":""}</span>}
        {extra<=0&&count>0&&<span style={{ color:C.textSecondary, fontSize:12, marginLeft:8 }}>· {fee-count} disponible{(fee-count)!==1?"s":""}</span>}
      </div>
    </div>
  );
}
  return <span style={{ display:"inline-flex", gap:4 }}>{[0,1,2].map(i=><span key={i} style={{ width:6,height:6,borderRadius:"50%",background:C.accent,animation:`b 1.2s ease ${i*.2}s infinite` }}/>)}<style>{`@keyframes b{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}`}</style></span>;
}
function StatsBar({ posts }) {
  const counts={pending:0,content_approved:0,design_review:0,fully_approved:0,changes_requested:0,published:0};
  posts.forEach(p=>{ if(counts[p.status]!==undefined) counts[p.status]++; });
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {[["published","Publicados","#00B4D8"],["fully_approved","Aprobados",C.green],["design_review","Revisar diseño",C.accentLight],["content_approved","Contenido ✓",C.yellow],["changes_requested","Cambios",C.coral],["pending","Pendientes",C.textMuted]].map(([k,l,col])=>(
        <div key={k} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:8, background:C.surface, border:`1px solid ${C.border}` }}>
          <span style={{ width:7,height:7,borderRadius:"50%",background:col,display:"inline-block" }}/>
          <span style={{ color:C.textSecondary, fontSize:11 }}>{counts[k]} {l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── DESIGN PREVIEW ───────────────────────────────────────────────────────────
function convertToPreviewUrl(url) {
  if (!url) return null;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveOpen) return `https://drive.google.com/file/d/${driveOpen[1]}/preview`;
  if (url.includes('dropbox.com')) {
    return url.replace('www.dropbox.com','dl.dropboxusercontent.com').replace('?dl=0','').replace('?dl=1','');
  }
  return url;
}

function isImage(url) {
  return url && (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('dropboxusercontent.com'));
}

function DesignPreview({ previewUrl, folderUrl }) {
  const preview = convertToPreviewUrl(previewUrl);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {/* Preview image/video */}
      {preview && (
        isImage(preview) ? (
          <img src={preview} alt="Diseño" style={{ width:"100%", maxHeight:340, objectFit:"contain", borderRadius:8, display:"block", background:"#111" }}
            onError={e=>{ e.target.style.display="none"; }}/>
        ) : preview.includes('drive.google.com/file') ? (
          <iframe src={preview} style={{ width:"100%", height:340, border:"none", borderRadius:8 }} allow="autoplay" title="Preview diseño"/>
        ) : (
          <a href={preview} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 16px", background:C.bg, borderRadius:8, border:`1px solid ${C.border}`, color:C.accentLight, fontSize:13, textDecoration:"none" }}>
            🖼️ Ver imagen →
          </a>
        )
      )}
      {/* Folder/full link */}
      {folderUrl && (
        <a href={folderUrl} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 16px", background:C.accentGlow, borderRadius:8, border:`1px solid ${C.accent}44`, color:C.accentLight, fontSize:13, textDecoration:"none", fontWeight:600 }}>
          📁 Ver todos los archivos →
        </a>
      )}
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function CalendarView({ posts, month=7, year=2025 }) {
  const days = new Date(year,month,0).getDate();
  const first = new Date(year,month-1,1).getDay();
  const byDay={};
  posts.forEach(p=>{ byDay[p.day]=[...(byDay[p.day]||[]),p]; });
  const cells=[...Array(first).fill(null),...Array.from({length:days},(_,i)=>i+1)];
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
function PostCard({ post, onUpdate, onDelete, clientView }) {
  const [open, setOpen]         = useState(false);
  const [editing, setEditing]   = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [form, setForm]         = useState({ hook:post.hook, copy:post.copy, cta:post.cta, day:post.day, format:post.format, visual_idea:post.visual_idea||"" });
  const [previewUrl, setPreviewUrl] = useState(post.design_url||"");
  const [folderUrl, setFolderUrl]   = useState(post.design_folder_url||"");
  const [comment, setComment]   = useState("");
  const [dComment, setDComment] = useState("");
  const [saving, setSaving]     = useState(false);
  const [showDesignInput, setShowDesignInput] = useState(false);

  useEffect(()=>{ setPreviewUrl(post.design_url||""); setFolderUrl(post.design_folder_url||""); },[post.design_url, post.design_folder_url]);

  async function save(changes) { setSaving(true); await onUpdate(post.id, changes); setSaving(false); }

  async function saveEdit() {
    setSaving(true);
    await onUpdate(post.id, { hook:form.hook, copy:form.copy, cta:form.cta, day:Number(form.day), format:form.format, visual_idea:form.visual_idea });
    setSaving(false);
    setEditing(false);
  }

  async function saveDesign() {
    if (!previewUrl.trim() && !folderUrl.trim()) return;
    setSaving(true);
    const newStatus = post.status === "content_approved" ? "design_review" : post.status;
    await onUpdate(post.id, { design_url: previewUrl.trim(), design_folder_url: folderUrl.trim(), status: newStatus });
    setSaving(false);
    setShowDesignInput(false);
  }

  const hasDesign = !!(post.design_url || post.design_folder_url);

  return (
    <div style={{ background:C.surface, border:`1px solid ${open?C.border:"#1E1E35"}`, borderRadius:12, overflow:"hidden" }}>
      {/* Header */}
      <div onClick={()=>setOpen(!open)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", cursor:"pointer", background:open?C.surfaceHover:"transparent" }}>
        <div style={{ width:36,height:36,borderRadius:8,background:C.accentGlow,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{FMT_ICONS[post.format]}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ color:C.textPrimary, fontWeight:600, fontSize:13 }}>{post.day} {MONTHS[(post.month||7)-1]}</span>
            <FmtBadge format={post.format}/>
            <Pill status={post.status} small/>
            {hasDesign && <span style={{ fontSize:10, color:C.accentLight, background:C.accentGlow, padding:"2px 7px", borderRadius:20, border:`1px solid ${C.accent}44` }}>🎨 diseño</span>}
          </div>
          <p style={{ color:C.textSecondary, fontSize:12, margin:"3px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{post.hook}</p>
        </div>
        <span style={{ color:C.textMuted, fontSize:14 }}>{open?"▲":"▼"}</span>
      </div>

      {open&&(
        <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ paddingTop:14, display:"flex", flexDirection:"column", gap:12 }}>

            {/* Edit mode */}
            {!clientView&&editing ? (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div><Lbl>Día</Lbl><input type="number" min="1" max="31" value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))} style={inp()}/></div>
                  <div><Lbl>Formato</Lbl>
                    <select value={form.format} onChange={e=>setForm(f=>({...f,format:e.target.value}))} style={inp()}>
                      {Object.entries(FMT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div><Lbl>Hook</Lbl><input value={form.hook} onChange={e=>setForm(f=>({...f,hook:e.target.value}))} style={inp()}/></div>
                <div><Lbl>Copy</Lbl><textarea rows={4} value={form.copy} onChange={e=>setForm(f=>({...f,copy:e.target.value}))} style={{...inp(),resize:"vertical"}}/></div>
                <div><Lbl>CTA</Lbl><input value={form.cta} onChange={e=>setForm(f=>({...f,cta:e.target.value}))} style={inp()}/></div>
                <div><Lbl>💡 Idea visual</Lbl><input placeholder="Ej: Foto de casco Schubert con fondo blanco" value={form.visual_idea} onChange={e=>setForm(f=>({...f,visual_idea:e.target.value}))} style={inp()}/></div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>setEditing(false)} style={btn(C.textSecondary)}>Cancelar</button>
                  <button onClick={saveEdit} style={btnSolid({flex:1})}>{saving?"Guardando...":"Guardar cambios"}</button>
                </div>
              </div>
            ) : (
              <>
                {/* Content fields */}
                <div style={{ display:"grid", gap:8 }}>
                  {[["🎣 Hook",post.hook],["📝 Copy",post.copy],["👉 CTA",post.cta]].map(([l,v])=>(
                    <div key={l}><Lbl>{l}</Lbl><p style={{ color:C.textPrimary, fontSize:13, margin:0, lineHeight:1.5 }}>{v}</p></div>
                  ))}
                  {post.visual_idea&&(
                    <div style={{ padding:"10px 12px", borderRadius:8, background:"#1A1A2E", border:`1px solid ${C.accent}33` }}>
                      <Lbl>💡 Idea visual</Lbl>
                      <p style={{ color:C.accentLight, fontSize:13, margin:0 }}>{post.visual_idea}</p>
                    </div>
                  )}
                </div>

                {/* Agency buttons */}
                {!clientView&&(
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button onClick={()=>setEditing(true)} style={btn(C.accentLight,{fontSize:11})}>✏️ Editar</button>
                    <button onClick={()=>setShowDesignInput(!showDesignInput)} style={btn(hasDesign?C.green:C.yellow,{fontSize:11})}>
                      {hasDesign?"🎨 Actualizar diseño":"🎨 Subir diseño"}
                    </button>
                    <button onClick={()=>setShowChat(!showChat)} style={btn(C.accent,{fontSize:11})}>🤖 Chat IA</button>
                    <button onClick={()=>onDelete(post.id)} style={btn(C.coral,{fontSize:11})}>🗑</button>
                  </div>
                )}

                {/* Design input — always available, always editable */}
                {!clientView&&showDesignInput&&(
                  <div style={{ padding:12, background:C.bg, borderRadius:10, border:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      <div>
                        <Lbl>🖼️ Link de imagen o video (Drive o Dropbox)</Lbl>
                        <input
                          placeholder="Link de imagen/video individual para previsualizar..."
                          value={previewUrl}
                          onChange={e=>setPreviewUrl(e.target.value)}
                          style={inp()}
                        />
                      </div>
                      <div>
                        <Lbl>📁 Link de carpeta (opcional — para carruseles o varios archivos)</Lbl>
                        <input
                          placeholder="Link de carpeta de Drive con todos los archivos..."
                          value={folderUrl}
                          onChange={e=>setFolderUrl(e.target.value)}
                          style={inp()}
                        />
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>setShowDesignInput(false)} style={btn(C.textSecondary)}>Cancelar</button>
                        <button onClick={saveDesign} style={btnSolid({flex:1,padding:"8px 14px"})}>{saving?"Guardando...":"Guardar diseño"}</button>
                      </div>
                    </div>
                    <p style={{ color:C.textMuted, fontSize:11, margin:"8px 0 0" }}>
                      Drive: compartir → "Cualquiera con el link" · Dropbox: compartir → copiar link
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Comments */}
            {post.comment&&<div style={{ padding:"10px 12px", borderRadius:8, background:"#2A1515", border:"1px solid #FF6B6B33", color:"#FF6B6B", fontSize:12 }}>💬 <strong>Comentario:</strong> {post.comment}</div>}
            {post.design_comment&&<div style={{ padding:"10px 12px", borderRadius:8, background:"#2A1515", border:"1px solid #FF6B6B33", color:"#FF6B6B", fontSize:12 }}>🎨 <strong>Cambio en diseño:</strong> {post.design_comment}</div>}

            {/* Design preview */}
            {(post.design_url||post.design_folder_url)&&(
              <div style={{ padding:12, borderRadius:8, background:C.bg, border:`1px solid ${C.border}` }}>
                <Lbl>Diseño</Lbl>
                <DesignPreview previewUrl={post.design_url} folderUrl={post.design_folder_url}/>
              </div>
            )}

            {/* Client: approve content */}
            {clientView&&(post.status==="pending"||post.status==="changes_requested")&&(
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <button onClick={()=>save({status:"content_approved",comment:""})} style={btn(C.green)}>✓ Aprobar contenido</button>
                <div style={{ display:"flex", gap:8 }}>
                  <input placeholder="Pedí un cambio..." value={comment} onChange={e=>setComment(e.target.value)} style={{...inp(),flex:1,width:"auto"}}/>
                  <button onClick={()=>{save({status:"changes_requested",comment});setComment("");}} style={btn(C.coral)}>Cambiar</button>
                </div>
              </div>
            )}

            {/* Client: approve design */}
            {clientView&&post.status==="design_review"&&(
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <button onClick={()=>save({status:"fully_approved",design_comment:""})} style={btn(C.green)}>✓ Aprobar diseño</button>
                <div style={{ display:"flex", gap:8 }}>
                  <input placeholder="Pedí un cambio en el diseño..." value={dComment} onChange={e=>setDComment(e.target.value)} style={{...inp(),flex:1,width:"auto"}}/>
                  <button onClick={()=>{save({status:"changes_requested",design_comment:dComment});setDComment("");}} style={btn(C.coral)}>Cambiar</button>
                </div>
              </div>
            )}

            {/* Client: content approved, waiting for design */}
            {clientView&&post.status==="content_approved"&&!post.design_url&&(
              <div style={{ padding:"10px 12px", borderRadius:8, background:"#152A20", border:"1px solid #4ECDC444", color:"#4ECDC4", fontSize:12, textAlign:"center" }}>
                ✓ Contenido aprobado — el diseño está en preparación
              </div>
            )}

            {/* AI Chat */}
            {!clientView&&showChat&&(
              <div style={{ padding:12, background:C.bg, borderRadius:10, border:`1px solid ${C.accent}44` }}>
                <p style={{ color:C.accentLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>🤖 Chat con IA — pedile cambios a este post</p>
                <p style={{ color:C.textMuted, fontSize:11, margin:"0 0 10px" }}>Ej: "hacelo más informal", "mencioná el producto X", "cambiá el tono", "escribí una versión más corta"</p>

                {/* Chat history */}
                {chatHistory.length>0&&(
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:10 }}>
                    {chatHistory.map((m,i)=>(
                      <div key={i} style={{
                        padding:"8px 12px", borderRadius:8,
                        background: m.role==="user" ? C.accentGlow : C.surface,
                        border: `1px solid ${m.role==="user" ? C.accent+"44" : C.border}`,
                        alignSelf: m.role==="user" ? "flex-end" : "flex-start",
                        maxWidth:"90%",
                      }}>
                        {m.role==="assistant" && m.content.hook && (
                          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                            <p style={{ color:C.textPrimary, fontSize:12, margin:0 }}><strong>Hook:</strong> {m.content.hook}</p>
                            <p style={{ color:C.textPrimary, fontSize:12, margin:0 }}><strong>Copy:</strong> {m.content.copy}</p>
                            <p style={{ color:C.textPrimary, fontSize:12, margin:0 }}><strong>CTA:</strong> {m.content.cta}</p>
                            {m.content.visual_idea&&<p style={{ color:C.accentLight, fontSize:12, margin:0 }}>💡 {m.content.visual_idea}</p>}
                            <button onClick={async()=>{
                              await onUpdate(post.id, { hook:m.content.hook, copy:m.content.copy, cta:m.content.cta, visual_idea:m.content.visual_idea||post.visual_idea });
                            }} style={btn(C.green,{fontSize:11,marginTop:4})}>✓ Aplicar esta versión</button>
                          </div>
                        )}
                        {m.role==="assistant" && !m.content.hook && (
                          <p style={{ color:C.textPrimary, fontSize:12, margin:0 }}>{m.content}</p>
                        )}
                        {m.role==="user"&&<p style={{ color:C.textPrimary, fontSize:12, margin:0 }}>{m.content}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {chatLoading&&<div style={{ textAlign:"center", padding:"10px 0" }}><Dots/></div>}

                <div style={{ display:"flex", gap:8 }}>
                  <input
                    placeholder="¿Qué querés cambiar de este post?"
                    value={chatInput}
                    onChange={e=>setChatInput(e.target.value)}
                    onKeyDown={async e=>{
                      if(e.key==="Enter"&&chatInput.trim()) {
                        const userMsg = chatInput.trim();
                        setChatInput("");
                        setChatHistory(h=>[...h,{role:"user",content:userMsg}]);
                        setChatLoading(true);
                        try {
                          const res = await fetch("/api/generate", {
                            method:"POST", headers:{"Content-Type":"application/json"},
                            body:JSON.stringify({
                              model:"claude-sonnet-4-6", max_tokens:800,
                              messages:[
                                {role:"user", content:`Sos un copywriter de Instagram. Tenés este post:\nHook: ${post.hook}\nCopy: ${post.copy}\nCTA: ${post.cta}\nIdea visual: ${post.visual_idea||"no especificada"}\n\nEl usuario pide: "${userMsg}"\n\nDevolvé SOLO JSON sin markdown: {"hook":"...","copy":"...","cta":"...","visual_idea":"..."}`}
                              ]
                            })
                          });
                          const data = await res.json();
                          const text = data.content?.map(i=>i.text||"").join("")||"";
                          const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
                          setChatHistory(h=>[...h,{role:"assistant",content:parsed}]);
                        } catch {
                          setChatHistory(h=>[...h,{role:"assistant",content:"Error al generar. Intentá de nuevo."}]);
                        }
                        setChatLoading(false);
                      }
                    }}
                    style={{...inp(),flex:1,width:"auto"}}
                  />
                  <p style={{ color:C.textMuted, fontSize:10, margin:"auto 0", whiteSpace:"nowrap" }}>Enter ↵</p>
                </div>
              </div>
            )}

            {post.status==="fully_approved"&&(
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ padding:"10px 12px", borderRadius:8, background:"#152A20", border:"1px solid #4ECDC488", color:"#4ECDC4", fontSize:12, textAlign:"center", fontWeight:600 }}>✓ Contenido y diseño aprobados</div>
                {!clientView&&<button onClick={()=>save({status:"published"})} style={btn("#00B4D8",{fontSize:12,fontWeight:700})}>🚀 Marcar como publicado</button>}
              </div>
            )}
            {post.status==="published"&&(
              <div style={{ padding:"10px 12px", borderRadius:8, background:"#0F1F2A", border:"1px solid #00B4D844", color:"#00B4D8", fontSize:12, textAlign:"center", fontWeight:600 }}>🚀 Publicado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PRODUCT MANAGER ──────────────────────────────────────────────────────────
function ProductManager({ products=[], onChange }) {
  const [url, setUrl]       = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]       = useState("");
  const [newItem, setNewItem] = useState({ name:"", desc:"", price:"" });

  async function fetchUrl(sourceUrl) {
    if(!sourceUrl.trim()) return;
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/fetch-url", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({url:sourceUrl}) });
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      const aiRes = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1000, messages:[{role:"user",content:`Del siguiente texto extraé los productos o servicios. Devolvé SOLO JSON sin markdown: {"items":[{"name":"...","desc":"...","price":"..."}]}. Si no hay precio usá "". Máximo 20 items.\n\nTexto:\n${data.text}`}] })
      });
      const aiData = await aiRes.json();
      const text = aiData.content?.map(i=>i.text||"").join("")||"";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      onChange([...products, ...parsed.items]);
      setMsg(`✓ Se encontraron ${parsed.items.length} productos/servicios`);
      setUrl("");
    } catch { setMsg("No se pudo leer la URL. Intentá cargar manualmente."); }
    setLoading(false);
  }

  function addManual() {
    if(!newItem.name.trim()) return;
    onChange([...products, newItem]);
    setNewItem({name:"",desc:"",price:""});
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <Lbl>🌐 Cargar desde URL (web, Google Sheet público, Google Doc público)</Lbl>
        <div style={{ display:"flex", gap:8 }}>
          <input placeholder="https://tucliente.com o link de Google Sheet/Doc" value={url} onChange={e=>setUrl(e.target.value)} style={{...inp(),flex:1,width:"auto"}}/>
          <button onClick={()=>fetchUrl(url)} style={btn(C.accent)} disabled={loading}>{loading?<Dots/>:"Importar"}</button>
        </div>
        {msg&&<p style={{ color:msg.startsWith("✓")?C.green:C.coral, fontSize:12, margin:"6px 0 0" }}>{msg}</p>}
        <p style={{ color:C.textMuted, fontSize:11, margin:"4px 0 0" }}>Para Google Sheets/Docs: compartir → cualquier persona con el link</p>
      </div>
      <div style={{ padding:12, background:C.bg, borderRadius:10, border:`1px solid ${C.border}` }}>
        <Lbl>✋ Agregar manualmente</Lbl>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr", gap:8, marginBottom:8 }}>
          <input placeholder="Nombre del producto/servicio" value={newItem.name} onChange={e=>setNewItem(f=>({...f,name:e.target.value}))} style={inp()}/>
          <input placeholder="Descripción breve" value={newItem.desc} onChange={e=>setNewItem(f=>({...f,desc:e.target.value}))} style={inp()}/>
          <input placeholder="Precio" value={newItem.price} onChange={e=>setNewItem(f=>({...f,price:e.target.value}))} style={inp()}/>
        </div>
        <button onClick={addManual} style={btn(C.green)}>+ Agregar</button>
      </div>
      {products.length>0&&(
        <div>
          <Lbl>Cargados ({products.length})</Lbl>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {products.map((p,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
                <div style={{ flex:1 }}>
                  <span style={{ color:C.textPrimary, fontSize:13, fontWeight:600 }}>{p.name}</span>
                  {p.price&&<span style={{ color:C.accentLight, fontSize:12, marginLeft:8 }}>{p.price}</span>}
                  {p.desc&&<p style={{ color:C.textSecondary, fontSize:12, margin:"2px 0 0" }}>{p.desc}</p>}
                </div>
                <button onClick={()=>onChange(products.filter((_,idx)=>idx!==i))} style={{ background:"none", border:"none", color:C.textMuted, cursor:"pointer", fontSize:16 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CLIENT FORM ──────────────────────────────────────────────────────────────
function ClientForm({ initial={}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:initial.name||"", rubro:initial.rubro||"", instagram:initial.instagram||"",
    color:initial.color||"#7C5CFC", tono:initial.tono||"", objetivo:initial.objetivo||"",
    audiencia:initial.audiencia||"", competencia:initial.competencia||"",
    hashtags:initial.hashtags||"", referencias:initial.referencias||"",
    formatos_preferidos:initial.formatos_preferidos||"", frecuencia:initial.frecuencia||"3",
    fee_contenidos:initial.fee_contenidos||"",
    notas:initial.notas||"",
    productos: typeof initial.productos === "string"
      ? (() => { try { return JSON.parse(initial.productos); } catch { return []; } })()
      : (initial.productos||[]),
  });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function submit() {
    if(!form.name||!form.rubro||!form.instagram) return alert("Nombre, rubro e Instagram son obligatorios");
    setSaving(true);
    await onSave({...form, productos: JSON.stringify(form.productos)});
    setSaving(false);
  }

  const sec = t => <p style={{ color:C.accentLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"16px 0 10px", borderTop:`1px solid ${C.border}`, paddingTop:16 }}>{t}</p>;
  const field = (l,k,ph) => <div><Lbl>{l}</Lbl><input placeholder={ph} value={form[k]} onChange={e=>set(k,e.target.value)} style={inp()}/></div>;
  const textarea = (l,k,ph,rows=3) => <div><Lbl>{l}</Lbl><textarea placeholder={ph} value={form[k]} onChange={e=>set(k,e.target.value)} rows={rows} style={{...inp(),resize:"vertical"}}/></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {sec("📋 Datos básicos")}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {field("Nombre del cliente","name","Ej: Alma Café")}
        {field("Rubro","rubro","Ej: Gastronomía")}
        {field("Instagram","instagram","@cuenta")}
        <div>
          <Lbl>Color identificador</Lbl>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="color" value={form.color} onChange={e=>set("color",e.target.value)} style={{ width:40,height:36,borderRadius:8,border:`1px solid ${C.border}`,background:"none",cursor:"pointer",padding:2 }}/>
            <span style={{ color:C.textSecondary, fontSize:12 }}>{form.color}</span>
          </div>
        </div>
      </div>
      {sec("🎯 Estrategia")}
      {textarea("Tono de voz","tono","Ej: Cercano, inspirador, sin tecnicismos.")}
      {textarea("Objetivo en redes","objetivo","Ej: Generar comunidad y dirigir tráfico al local.")}
      {textarea("Audiencia objetivo","audiencia","Ej: Mujeres 25-40, profesionales.")}
      {sec("🔍 Info para la IA")}
      {textarea("Competencia / Referencias","competencia","Ej: @competidor1. Nos diferenciamos por el servicio.")}
      {textarea("Hashtags que funcionan","hashtags","Ej: #cafebuenosaires #specialtycoffee")}
      {textarea("Referencias de contenido","referencias","Ej: Reels de proceso, fotos de ambiente.")}
      {textarea("Formatos que mejor funcionan","formatos_preferidos","Ej: Reels para alcance, carruseles para guardados.")}
      {sec("🛍️ Productos y servicios")}
      <p style={{ color:C.textSecondary, fontSize:12, margin:"0 0 8px" }}>La IA usará estos productos para mencionarlos estratégicamente en los posts.</p>
      <ProductManager products={form.productos} onChange={v=>set("productos",v)}/>
      {sec("📅 Planificación y fee")}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <Lbl>Frecuencia semanal de posts</Lbl>
          <select value={form.frecuencia} onChange={e=>set("frecuencia",e.target.value)} style={inp()}>
            {["1","2","3","4","5","6","7"].map(n=><option key={n} value={n}>{n} post{n!=="1"?"s":""} por semana</option>)}
          </select>
        </div>
        <div>
          <Lbl>📦 Fee mensual (contenidos incluidos)</Lbl>
          <input type="number" min="1" placeholder="Ej: 10" value={form.fee_contenidos} onChange={e=>set("fee_contenidos",e.target.value)} style={inp()}/>
        </div>
      </div>
      {textarea("Notas del mes","notas","Fechas especiales, promociones, eventos...")}
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
  const [month, setMonth]     = useState(new Date().getMonth()+1);
  const [year, setYear]       = useState(new Date().getFullYear());

  const productos = (() => { try { return JSON.parse(client.productos||"[]"); } catch { return []; } })();

  async function generate() {
    setLoading(true); setError(""); setResult(null);
    const freq = parseInt(client.frecuencia||"3");
    const totalPosts = freq * 4;
    const daysInMonth = new Date(year, month, 0).getDate();
    const productosStr = productos.length > 0
      ? `\nPRODUCTOS/SERVICIOS:\n${productos.map(p=>`- ${p.name}${p.price?` (${p.price})`:""}: ${p.desc||""}`).join("\n")}\nMencioná algunos en los copies de forma natural, sin sonar publicitario.`
      : "";

    const prompt = `Sos estratega de contenido para Instagram especializado en ${client.rubro}.
Plan de contenido para ${MONTHS[month-1]} ${year} — ${client.name} (${client.instagram}).

PERFIL:
- Tono: ${client.tono||"cercano y auténtico"}
- Objetivo: ${client.objetivo||"generar comunidad y ventas"}
- Audiencia: ${client.audiencia||"público general"}
- Competencia: ${client.competencia||"no especificado"}
- Hashtags: ${client.hashtags||"no especificado"}
- Referencias: ${client.referencias||"no especificado"}
- Formatos preferidos: ${client.formatos_preferidos||"todos"}
- Notas del mes: ${client.notas||"ninguna"}
${productosStr}

Devolvé SOLO JSON válido sin markdown:
{"posts":[{"day":2,"format":"reel","hook":"...","copy":"...","cta":"...","visual_idea":"descripción concreta de la imagen o video, ej: Video de barista preparando espresso en cámara lenta"}],"trends":["t1","t2","t3","t4"],"hooks_virales":["h1","h2","h3","h4","h5"],"estrategia":"párrafo breve"}

Generá exactamente ${totalPosts} posts, días del 1 al ${daysInMonth}.
Formatos: reel, carrusel, historia, imagen. Variados.
Hooks máx 12 palabras. Copies naturales en español.
visual_idea: descripción concreta y accionable de qué mostrar visualmente.`;

    try {
      const res = await fetch("/api/generate", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:4000, messages:[{role:"user",content:prompt}] }) });
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      const text = data.content?.map(i=>i.text||"").join("")||"";
      let cleaned = text.replace(/```json|```/g,"").trim();
      if(!cleaned.endsWith("}")) {
        const last = cleaned.lastIndexOf('"cta"');
        if(last>0) { const end=cleaned.indexOf('}',last); if(end>0) cleaned=cleaned.substring(0,end+1)+']}'; }
      }
      setResult({...JSON.parse(cleaned), month, year});
    } catch { setError("Error al generar. Intentá de nuevo."); }
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
              <Lbl>Mes a planificar</Lbl>
              <div style={{ display:"flex", gap:8 }}>
                <select value={month} onChange={e=>setMonth(+e.target.value)} style={{...inp(),flex:1,width:"auto"}}>
                  {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
                <select value={year} onChange={e=>setYear(+e.target.value)} style={{...inp(),width:100}}>
                  {[2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </Card>
            <Card style={{ background:"#1A1535", border:`1px solid ${C.accent}33` }}>
              <p style={{ color:C.accentLight, fontWeight:600, fontSize:13, margin:"0 0 8px" }}>La IA va a generar:</p>
              {["Hook, copy y CTA para cada post","💡 Idea visual concreta por post","Tendencias del rubro","Hooks virales adaptados",productos.length>0?`Contenido usando ${productos.length} productos cargados`:"Estrategia del mes"].map((t,i)=>(
                <p key={i} style={{ color:C.textSecondary, fontSize:12, margin:"3px 0" }}>✓ {t}</p>
              ))}
            </Card>
            {error&&<p style={{ color:C.coral, fontSize:13 }}>{error}</p>}
            <button onClick={generate} style={btnSolid({width:"100%",padding:"12px"})}>Generar plan →</button>
          </div>
        )}

        {loading&&(
          <div style={{ textAlign:"center", padding:"50px 0" }}>
            <Dots/>
            <p style={{ color:C.textSecondary, fontSize:13, marginTop:16 }}>Generando contenido estratégico...</p>
          </div>
        )}

        {result&&(
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {result.estrategia&&<Card style={{ background:"#1A1535", border:`1px solid ${C.accent}33` }}><Lbl>Estrategia del mes</Lbl><p style={{ color:C.textPrimary, fontSize:13, margin:0, lineHeight:1.6 }}>{result.estrategia}</p></Card>}
            <Card><p style={{ color:C.accentLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>📈 Tendencias</p>{result.trends?.map((t,i)=><p key={i} style={{ color:C.textPrimary, fontSize:13, margin:"4px 0" }}>· {t}</p>)}</Card>
            <Card><p style={{ color:C.yellow, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>🎣 Hooks virales</p>{result.hooks_virales?.map((h,i)=><p key={i} style={{ color:C.textPrimary, fontSize:13, margin:"4px 0" }}>· {h}</p>)}</Card>
            <div>
              <p style={{ color:C.textSecondary, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>📅 Posts ({result.posts?.length})</p>
              {result.posts?.map((p,i)=>(
                <div key={i} style={{ padding:"10px 12px", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, marginBottom:8 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                    <span style={{ color:C.textPrimary, fontWeight:600, fontSize:12 }}>{p.day} {MONTHS[result.month-1]}</span>
                    <FmtBadge format={p.format}/>
                  </div>
                  <p style={{ color:C.textSecondary, fontSize:12, margin:"2px 0 2px" }}>{p.hook}</p>
                  {p.visual_idea&&<p style={{ color:C.accentLight, fontSize:11, margin:0 }}>💡 {p.visual_idea}</p>}
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
function AgencyView({ clients, posts, onUpdatePost, onDeletePost, onAddPosts, onSaveClient }) {
  const [selected, setSelected]   = useState(null);
  const [tab, setTab]             = useState("list");
  const [showAI, setShowAI]       = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [copied, setCopied]       = useState(false);
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth()+1);
  const [viewYear, setViewYear]   = useState(now.getFullYear());

  // Manual post form state
  const emptyPost = { day:"", format:"reel", hook:"", copy:"", cta:"", visual_idea:"" };
  const [manualForm, setManualForm] = useState(emptyPost);
  const [manualSaving, setManualSaving] = useState(false);

  useEffect(()=>{ if(!selected&&clients.length>0) setSelected(clients[0].id); },[clients]);

  const client = clients.find(c=>c.id===selected);
  const clientPosts = posts.filter(p=>p.client_id===selected);
  const monthPosts = clientPosts.filter(p=>p.month===viewMonth&&p.year===viewYear);
  const productos = client ? (() => { try { return JSON.parse(client.productos||"[]"); } catch { return []; } })() : [];

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}?view=client&cid=${selected}`)
      .then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }

  async function handleAIGenerate(result) {
    const existing = posts.filter(p=>p.client_id===selected&&p.month===result.month&&p.year===result.year);
    if (existing.length > 0) {
      const ok = window.confirm(`Ya hay ${existing.length} posts para ${MONTHS[result.month-1]} ${result.year}. ¿Querés agregar los nuevos igual?`);
      if (!ok) return;
    }
    await onAddPosts(result.posts.map(p=>({
      client_id:selected, day:p.day, month:result.month, year:result.year,
      format:p.format, hook:p.hook, copy:p.copy, cta:p.cta,
      visual_idea:p.visual_idea||"",
      status:"pending", design_url:"", design_folder_url:"", comment:"", design_comment:"",
    })));
    setViewMonth(result.month); setViewYear(result.year);
  }

  async function handleAddManual() {
    if(!manualForm.day||!manualForm.hook||!manualForm.copy) return alert("Día, hook y copy son obligatorios");
    setManualSaving(true);
    await onAddPosts([{
      client_id:selected, day:Number(manualForm.day), month:viewMonth, year:viewYear,
      format:manualForm.format, hook:manualForm.hook, copy:manualForm.copy,
      cta:manualForm.cta, visual_idea:manualForm.visual_idea,
      status:"pending", design_url:"", design_folder_url:"", comment:"", design_comment:"",
    }]);
    setManualForm(emptyPost);
    setManualSaving(false);
    setShowManual(false);
  }

  async function handleDeleteMonth() {
    if(monthPosts.length===0) return alert("No hay posts para ese mes.");
    const ok = window.confirm(`¿Eliminar los ${monthPosts.length} posts de ${MONTHS[viewMonth-1]} ${viewYear}?`);
    if(!ok) return;
    await Promise.all(monthPosts.map(p=>onDeletePost(p.id)));
  }

  async function handleCopyMonth() {
    if(monthPosts.length===0) return alert("No hay posts para copiar.");
    const nextMonth = viewMonth===12?1:viewMonth+1;
    const nextYear  = viewMonth===12?viewYear+1:viewYear;
    const ok = window.confirm(`¿Copiar los ${monthPosts.length} posts de ${MONTHS[viewMonth-1]} a ${MONTHS[nextMonth-1]} ${nextYear}? Se copiará solo el contenido, sin diseños ni estados.`);
    if(!ok) return;
    await onAddPosts(monthPosts.map(p=>({
      client_id:selected, day:p.day, month:nextMonth, year:nextYear,
      format:p.format, hook:p.hook, copy:p.copy, cta:p.cta,
      visual_idea:p.visual_idea||"",
      status:"pending", design_url:"", design_folder_url:"", comment:"", design_comment:"",
    })));
    setViewMonth(nextMonth); setViewYear(nextYear);
    alert(`Posts copiados a ${MONTHS[nextMonth-1]} ${nextYear} ✓`);
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Inter, system-ui, sans-serif" }}>
      {showAI&&client&&<AIModal client={client} onGenerate={handleAIGenerate} onClose={()=>setShowAI(false)}/>}

      {/* Manual post modal */}
      {showManual&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
          <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, width:"100%", maxWidth:520, padding:24 }}>
            <h2 style={{ color:C.textPrimary, margin:"0 0 4px", fontSize:18 }}>✍️ Nuevo post manual</h2>
            <p style={{ color:C.textSecondary, fontSize:13, margin:"0 0 16px" }}>{MONTHS[viewMonth-1]} {viewYear} · {client?.name}</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div><Lbl>Día del mes</Lbl><input type="number" min="1" max="31" placeholder="Ej: 15" value={manualForm.day} onChange={e=>setManualForm(f=>({...f,day:e.target.value}))} style={inp()}/></div>
                <div><Lbl>Formato</Lbl>
                  <select value={manualForm.format} onChange={e=>setManualForm(f=>({...f,format:e.target.value}))} style={inp()}>
                    {Object.entries(FMT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div><Lbl>Hook</Lbl><input placeholder="El gancho que abre el contenido..." value={manualForm.hook} onChange={e=>setManualForm(f=>({...f,hook:e.target.value}))} style={inp()}/></div>
              <div><Lbl>Copy</Lbl><textarea rows={4} placeholder="El texto del post..." value={manualForm.copy} onChange={e=>setManualForm(f=>({...f,copy:e.target.value}))} style={{...inp(),resize:"vertical"}}/></div>
              <div><Lbl>CTA</Lbl><input placeholder="Llamada a la acción..." value={manualForm.cta} onChange={e=>setManualForm(f=>({...f,cta:e.target.value}))} style={inp()}/></div>
              <div><Lbl>💡 Idea visual</Lbl><input placeholder="Ej: Foto del producto sobre fondo blanco" value={manualForm.visual_idea} onChange={e=>setManualForm(f=>({...f,visual_idea:e.target.value}))} style={inp()}/></div>
              <div style={{ display:"flex", gap:8, marginTop:4 }}>
                <button onClick={()=>{setShowManual(false);setManualForm(emptyPost);}} style={btn(C.textSecondary)}>Cancelar</button>
                <button onClick={handleAddManual} style={btnSolid({flex:1})}>{manualSaving?"Guardando...":"Agregar post"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showForm||editClient)&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16, overflowY:"auto" }}>
          <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, width:"100%", maxWidth:680, maxHeight:"92vh", overflow:"auto", padding:24, margin:"auto" }}>
            <h2 style={{ color:C.textPrimary, margin:"0 0 4px", fontSize:18 }}>{editClient?"Editar cliente":"Nuevo cliente"}</h2>
            <p style={{ color:C.textSecondary, fontSize:13, margin:"0 0 16px" }}>Completá el perfil para que la IA genere mejor contenido</p>
            <ClientForm
              initial={editClient||{}}
              onSave={async(data)=>{ await onSaveClient(data,editClient?.id); setShowForm(false); setEditClient(null); }}
              onCancel={()=>{ setShowForm(false); setEditClient(null); }}
            />
          </div>
        </div>
      )}

      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32,height:32,borderRadius:8,background:C.accentGlow,border:`1px solid ${C.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>📅</div>
          <div><h1 style={{ color:C.textPrimary, margin:0, fontSize:16, fontWeight:700 }}>Social Planner</h1><p style={{ color:C.textMuted, margin:0, fontSize:11 }}>Panel de agencia</p></div>
        </div>
        <button onClick={()=>setShowForm(true)} style={btnSolid({fontSize:12,padding:"8px 14px"})}>+ Nuevo cliente</button>
      </div>

      <div style={{ display:"flex", height:"calc(100vh - 57px)" }}>
        <div style={{ width:210, flexShrink:0, background:C.surface, borderRight:`1px solid ${C.border}`, padding:12, display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
          <p style={{ color:C.textMuted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", padding:"4px 8px", margin:"0 0 4px" }}>Clientes ({clients.length})</p>
          {clients.length===0&&<p style={{ color:C.textMuted, fontSize:12, padding:8, textAlign:"center" }}>Sin clientes aún</p>}
          {clients.map(c=>{
            const cp=posts.filter(p=>p.client_id===c.id);
            const badge=cp.filter(p=>["pending","design_review","changes_requested"].includes(p.status)).length;
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

        <div style={{ flex:1, overflow:"auto", padding:20 }}>
          {!client?(
            <div style={{ textAlign:"center", padding:"80px 20px", color:C.textMuted }}>
              <p style={{ fontSize:40, margin:"0 0 12px" }}>👋</p>
              <p style={{ fontSize:14, fontWeight:600, color:C.textSecondary }}>Creá tu primer cliente para empezar</p>
              <button onClick={()=>setShowForm(true)} style={btnSolid({marginTop:16})}>+ Nuevo cliente</button>
            </div>
          ):(
            <>
              {/* Client header */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:10 }}>
                <div>
                  <h2 style={{ color:C.textPrimary, margin:"0 0 4px", fontSize:20, fontWeight:700 }}><span style={{ color:client.color }}>{client.name}</span></h2>
                  <p style={{ color:C.textSecondary, margin:0, fontSize:13 }}>{client.instagram} · {client.rubro}{productos.length>0?` · ${productos.length} productos`:""}</p>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <button onClick={()=>setEditClient(client)} style={btn(C.textSecondary,{fontSize:12})}>✏️ Perfil</button>
                  <button onClick={copyLink} style={btn(C.textSecondary,{fontSize:12})}>{copied?"✓ Copiado":"🔗 Link"}</button>
                  <button onClick={()=>setShowManual(true)} style={btn(C.green,{fontSize:12})}>✍️ Manual</button>
                  <button onClick={handleCopyMonth} style={btn(C.yellow,{fontSize:12})}>📋 Copiar mes</button>
                  <button onClick={handleDeleteMonth} style={btn(C.coral,{fontSize:12})}>🗑 Borrar mes</button>
                  <button onClick={()=>setShowAI(true)} style={btn(C.accentLight,{fontSize:12,fontWeight:700})}>✨ Generar con IA</button>
                </div>
              </div>

              {/* Month selector */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <Lbl>Mes:</Lbl>
                <select value={viewMonth} onChange={e=>setViewMonth(+e.target.value)} style={{...inp(),width:"auto",padding:"5px 10px"}}>
                  {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
                <select value={viewYear} onChange={e=>setViewYear(+e.target.value)} style={{...inp(),width:90,padding:"5px 10px"}}>
                  {[2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
                </select>
                <span style={{ color:C.textMuted, fontSize:12 }}>{monthPosts.length} post{monthPosts.length!==1?"s":""}</span>
              </div>

              {/* Fee bar */}
              {client.fee_contenidos&&<div style={{ marginBottom:12 }}><FeeBar posts={clientPosts} feeContenidos={client.fee_contenidos} month={viewMonth} year={viewYear}/></div>}

              <StatsBar posts={monthPosts}/>

              <div style={{ display:"flex", gap:4, margin:"14px 0 12px" }}>
                {[{key:"list",label:"Publicaciones"},{key:"calendar",label:"Calendario"},{key:"profile",label:"Perfil IA"}].map(t=>(
                  <button key={t.key} onClick={()=>setTab(t.key)} style={{ padding:"7px 16px", borderRadius:8, cursor:"pointer", background:tab===t.key?C.accent:C.surface, border:`1px solid ${tab===t.key?C.accent:C.border}`, color:tab===t.key?C.white:C.textSecondary, fontSize:13, fontWeight:600, fontFamily:"inherit" }}>{t.label}</button>
                ))}
              </div>

              {tab==="calendar"&&<CalendarView posts={monthPosts} month={viewMonth} year={viewYear}/>}
              {tab==="profile"&&(
                <Card>
                  <p style={{ color:C.accentLight, fontWeight:700, fontSize:14, margin:"0 0 16px" }}>Perfil de contenido</p>
                  <div style={{ display:"grid", gap:14 }}>
                    {[["Tono",client.tono],["Objetivo",client.objetivo],["Audiencia",client.audiencia],["Competencia",client.competencia],["Hashtags",client.hashtags],["Referencias",client.referencias],["Formatos",client.formatos_preferidos],["Frecuencia",`${client.frecuencia} posts/semana`],["Fee mensual",client.fee_contenidos?`${client.fee_contenidos} contenidos/mes`:""],["Notas",client.notas]].map(([l,v])=>v?(<div key={l}><Lbl>{l}</Lbl><p style={{ color:C.textPrimary, fontSize:13, margin:0, lineHeight:1.5 }}>{v}</p></div>):null)}
                    {productos.length>0&&(<div><Lbl>Productos/servicios ({productos.length})</Lbl>{productos.map((p,i)=><p key={i} style={{ color:C.textPrimary, fontSize:13, margin:"3px 0" }}>· <strong>{p.name}</strong>{p.price?` — ${p.price}`:""}{p.desc?`: ${p.desc}`:""}</p>)}</div>)}
                  </div>
                  <button onClick={()=>setEditClient(client)} style={{...btnSolid(),marginTop:16}}>✏️ Editar perfil</button>
                </Card>
              )}
              {tab==="list"&&(
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {monthPosts.length===0?(
                    <div style={{ textAlign:"center", padding:"60px 20px", color:C.textMuted }}>
                      <p style={{ fontSize:40, margin:"0 0 12px" }}>📭</p>
                      <p style={{ fontSize:14, fontWeight:600, color:C.textSecondary }}>Sin posts para {MONTHS[viewMonth-1]} {viewYear}</p>
                      <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:12 }}>
                        <button onClick={()=>setShowManual(true)} style={btn(C.green)}>✍️ Agregar manual</button>
                        <button onClick={()=>setShowAI(true)} style={btn(C.accentLight)}>✨ Generar con IA</button>
                      </div>
                    </div>
                  ):(
                    monthPosts.sort((a,b)=>a.day-b.day).map(post=>(
                      <PostCard key={post.id} post={post} onUpdate={onUpdatePost} onDelete={onDeletePost} clientView={false}/>
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
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth()+1);
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const monthPosts = posts.filter(p=>p.month===viewMonth&&p.year===viewYear);
  const needsAction = monthPosts.filter(p=>["pending","design_review","changes_requested"].includes(p.status)).length;
  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Inter, system-ui, sans-serif" }}>
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40,height:40,borderRadius:10,background:`${client.color}22`,border:`1px solid ${client.color}44`,display:"flex",alignItems:"center",justifyContent:"center",color:client.color,fontWeight:800,fontSize:16 }}>{client.name[0]}</div>
          <div><h1 style={{ color:C.textPrimary, margin:0, fontSize:17, fontWeight:700 }}>{client.name}</h1><p style={{ color:C.textSecondary, margin:0, fontSize:12 }}>Plan de contenido · {client.instagram}</p></div>
        </div>
      </div>
      <div style={{ padding:16, maxWidth:680, margin:"0 auto" }}>

        {/* Month selector */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <select value={viewMonth} onChange={e=>setViewMonth(+e.target.value)} style={{...inp(),width:"auto",padding:"5px 10px"}}>
            {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={viewYear} onChange={e=>setViewYear(+e.target.value)} style={{...inp(),width:90,padding:"5px 10px"}}>
            {[2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Fee bar */}
        {client.fee_contenidos&&<div style={{ marginBottom:12 }}><FeeBar posts={posts} feeContenidos={client.fee_contenidos} month={viewMonth} year={viewYear}/></div>}

        <StatsBar posts={monthPosts}/>
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
        {tab==="calendar"?<CalendarView posts={monthPosts} month={viewMonth} year={viewYear}/>:(
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {monthPosts.sort((a,b)=>a.day-b.day).map(post=>(
              <PostCard key={post.id} post={post} onUpdate={onUpdate} onDelete={()=>{}} clientView/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [clients, setClients]   = useState([]);
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState("agency");
  const [clientId, setClientId] = useState(null);

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    if(p.get("view")==="client"&&p.get("cid")){ setView("client"); setClientId(p.get("cid")); }
  },[]);

  useEffect(()=>{
    async function load() {
      const [{data:c},{data:p}]=await Promise.all([
        supabase.from("clients").select("*").order("name"),
        supabase.from("posts").select("*").order("day"),
      ]);
      setClients(c||[]); setPosts(p||[]); setLoading(false);
    }
    load();
  },[]);

  useEffect(()=>{
    const ch=supabase.channel("rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"posts"},p=>{
        if(p.eventType==="UPDATE") setPosts(prev=>prev.map(x=>x.id===p.new.id?p.new:x));
        if(p.eventType==="INSERT") setPosts(prev=>[...prev,p.new]);
        if(p.eventType==="DELETE") setPosts(prev=>prev.filter(x=>x.id!==p.old.id));
      })
      .on("postgres_changes",{event:"*",schema:"public",table:"clients"},p=>{
        if(p.eventType==="UPDATE") setClients(prev=>prev.map(x=>x.id===p.new.id?p.new:x));
        if(p.eventType==="INSERT") setClients(prev=>[...prev,p.new]);
        if(p.eventType==="DELETE") setClients(prev=>prev.filter(x=>x.id!==p.old.id));
      })
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[]);

  async function updatePost(id,changes) {
    const {data}=await supabase.from("posts").update(changes).eq("id",id).select().single();
    if(data) setPosts(prev=>prev.map(p=>p.id===id?data:p));
  }
  async function deletePost(id) {
    await supabase.from("posts").delete().eq("id",id);
    setPosts(prev=>prev.filter(p=>p.id!==id));
  }

  const addingRef = { current: false };
  async function addPosts(newPosts) {
    if(addingRef.current) return;
    addingRef.current = true;
    try {
      const {data}=await supabase.from("posts").insert(newPosts).select();
      if(data) setPosts(prev=>{
        const existingIds = new Set(prev.map(p=>p.id));
        const fresh = data.filter(p=>!existingIds.has(p.id));
        return [...prev, ...fresh];
      });
    } finally {
      setTimeout(()=>{ addingRef.current = false; }, 1000);
    }
  }

  async function saveClient(data, id) {
    const payload = {
      name: data.name, rubro: data.rubro, instagram: data.instagram, color: data.color,
      tono: data.tono||"", objetivo: data.objetivo||"", audiencia: data.audiencia||"",
      competencia: data.competencia||"", hashtags: data.hashtags||"",
      referencias: data.referencias||"", formatos_preferidos: data.formatos_preferidos||"",
      frecuencia: data.frecuencia||"3", fee_contenidos: data.fee_contenidos||"",
      notas: data.notas||"", productos: data.productos||"[]",
    };
    if (id) {
      const { data:u, error } = await supabase.from("clients").update(payload).eq("id",id).select().single();
      if (error) { alert("Error al guardar: "+error.message); return; }
      if (u) setClients(prev=>prev.map(c=>c.id===id?u:c));
    } else {
      const { data:cr, error } = await supabase.from("clients").insert(payload).select().single();
      if (error) { alert("Error al crear cliente: "+error.message); return; }
      if (cr) setClients(prev=>[...prev,cr]);
    }
  }

  if(loading) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter, system-ui, sans-serif" }}>
      <div style={{ textAlign:"center" }}><Dots/><p style={{ color:C.textSecondary, marginTop:16, fontSize:14 }}>Cargando...</p></div>
    </div>
  );

  if(view==="client"&&clientId) {
    const client=clients.find(c=>c.id===clientId);
    if(!client) return <div style={{ color:C.textPrimary, padding:40, fontFamily:"Inter" }}>Cliente no encontrado.</div>;
    return <ClientView client={client} posts={posts.filter(p=>p.client_id===clientId)} onUpdate={updatePost}/>;
  }

  return <AgencyView clients={clients} posts={posts} onUpdatePost={updatePost} onDeletePost={deletePost} onAddPosts={addPosts} onSaveClient={saveClient}/>;
}
