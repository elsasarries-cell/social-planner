import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#0F0F1A",
  surface: "#17172A",
  surfaceHover: "#1E1E35",
  border: "#2A2A45",
  accent: "#7C5CFC",
  accentLight: "#A688FF",
  accentGlow: "rgba(124,92,252,0.18)",
  coral: "#FF6B6B",
  green: "#4ECDC4",
  yellow: "#FFD93D",
  textPrimary: "#F0EFFF",
  textSecondary: "#8885AA",
  textMuted: "#4A4870",
  white: "#FFFFFF",
};

const FORMAT_ICONS = { reel: "🎬", carrusel: "🖼️", historia: "✨", imagen: "📷" };
const FORMAT_LABELS = { reel: "Reel", carrusel: "Carrusel", historia: "Historia", imagen: "Imagen" };

const STATUS_STYLES = {
  pending:           { bg: "#2A2215", border: "#FFD93D44", color: "#FFD93D", label: "Pendiente" },
  content_approved:  { bg: "#152A20", border: "#4ECDC444", color: "#4ECDC4", label: "Contenido ✓" },
  design_review:     { bg: "#1A1535", border: "#7C5CFC44", color: "#A688FF", label: "Revisar diseño" },
  fully_approved:    { bg: "#152A20", border: "#4ECDC488", color: "#4ECDC4", label: "Aprobado ✓✓" },
  changes_requested: { bg: "#2A1515", border: "#FF6B6B44", color: "#FF6B6B", label: "Con cambios" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getDaysInMonth(month, year) { return new Date(year, month, 0).getDate(); }
function getFirstDayOfMonth(month, year) { return new Date(year, month - 1, 1).getDay(); }

const inputStyle = {
  flex: 1, background: "#0F0F1A", border: "1px solid #2A2A45",
  borderRadius: 8, padding: "8px 12px",
  color: "#F0EFFF", fontSize: 13, outline: "none", fontFamily: "inherit",
};

function btnStyle(color) {
  return {
    padding: "8px 14px", borderRadius: 8,
    background: `${color}22`, border: `1px solid ${color}66`,
    color: color, fontSize: 12, fontWeight: 600, cursor: "pointer",
    whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
  };
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function StatusPill({ status, small }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: small ? "2px 8px" : "4px 10px", borderRadius: 20,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, fontSize: small ? 10 : 11, fontWeight: 600,
      letterSpacing: "0.03em", whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

function FormatBadge({ format }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 6,
      background: "#1E1E35", border: "1px solid #2A2A45",
      color: COLORS.textSecondary, fontSize: 11, fontWeight: 500,
    }}>{FORMAT_ICONS[format]} {FORMAT_LABELS[format]}</span>
  );
}

function AILoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: COLORS.accent,
          animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p style={{ color: COLORS.textMuted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>{label}</p>
      <p style={{ color: COLORS.textPrimary, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

function StatsBar({ posts }) {
  const counts = { pending:0, content_approved:0, design_review:0, fully_approved:0, changes_requested:0 };
  posts.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {[
        { key: "fully_approved",    label: "Aprobados",      color: COLORS.green },
        { key: "design_review",     label: "Revisar diseño", color: COLORS.accentLight },
        { key: "content_approved",  label: "Contenido ✓",   color: COLORS.yellow },
        { key: "changes_requested", label: "Cambios",        color: COLORS.coral },
        { key: "pending",           label: "Pendientes",     color: COLORS.textMuted },
      ].map(it => (
        <div key={it.key} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 10px", borderRadius: 8,
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: it.color, display: "inline-block" }} />
          <span style={{ color: COLORS.textSecondary, fontSize: 11 }}>{counts[it.key]} {it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function CalendarView({ posts }) {
  const month = 7; const year = 2025;
  const days = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const postsByDay = {};
  posts.forEach(p => { postsByDay[p.day] = [...(postsByDay[p.day] || []), p]; });
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
        {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d => (
          <div key={d} style={{ textAlign:"center", color: COLORS.textMuted, fontSize:10, fontWeight:700, padding:"4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {cells.map((day, i) => {
          const dayPosts = day ? (postsByDay[day] || []) : [];
          return (
            <div key={i} style={{
              minHeight: 60, borderRadius: 8, padding: 4,
              background: day ? COLORS.surface : "transparent",
              border: day ? `1px solid ${COLORS.border}` : "none",
            }}>
              {day && <span style={{ color: COLORS.textMuted, fontSize:10, fontWeight:600 }}>{day}</span>}
              {dayPosts.map(p => {
                const s = STATUS_STYLES[p.status];
                return (
                  <div key={p.id} style={{
                    marginTop: 3, padding: "2px 4px", borderRadius: 4,
                    background: s.bg, border: `1px solid ${s.border}`,
                    fontSize: 9, color: s.color, lineHeight: 1.4,
                  }}>
                    {FORMAT_ICONS[p.format]} {FORMAT_LABELS[p.format]}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── POST CARD ────────────────────────────────────────────────────────────────
function PostCard({ post, onUpdate, clientView }) {
  const [expanded, setExpanded]       = useState(false);
  const [designUrl, setDesignUrl]     = useState(post.design_url || "");
  const [comment, setComment]         = useState("");
  const [designComment, setDesignComment] = useState("");
  const [saving, setSaving]           = useState(false);

  async function save(changes) {
    setSaving(true);
    await onUpdate(post.id, changes);
    setSaving(false);
  }

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${expanded ? COLORS.border : "#1E1E35"}`,
      borderRadius: 12, overflow: "hidden", transition: "all 0.2s",
    }}>
      {/* Header */}
      <div onClick={() => setExpanded(!expanded)} style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", cursor: "pointer",
        background: expanded ? COLORS.surfaceHover : "transparent",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: COLORS.accentGlow, border: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>{FORMAT_ICONS[post.format]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: COLORS.textPrimary, fontWeight: 600, fontSize: 13 }}>{post.day} jul</span>
            <FormatBadge format={post.format} />
            <StatusPill status={post.status} small />
          </div>
          <p style={{ color: COLORS.textSecondary, fontSize: 12, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {post.hook}
          </p>
        </div>
        <span style={{ color: COLORS.textMuted, fontSize: 16, flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <Field label="🎣 Hook" value={post.hook} />
              <Field label="📝 Copy" value={post.copy} />
              <Field label="👉 CTA" value={post.cta} />
            </div>

            {post.comment && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "#2A1515", border: "1px solid #FF6B6B33", color: "#FF6B6B", fontSize: 12 }}>
                💬 <strong>Comentario:</strong> {post.comment}
              </div>
            )}
            {post.design_comment && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "#2A1515", border: "1px solid #FF6B6B33", color: "#FF6B6B", fontSize: 12 }}>
                🎨 <strong>Cambio en diseño:</strong> {post.design_comment}
              </div>
            )}

            {/* Design preview */}
            {post.design_url && (
              <div style={{ padding: 12, borderRadius: 8, background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
                <p style={{ color: COLORS.textSecondary, fontSize: 11, margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Diseño</p>
                <img src={post.design_url} alt="Diseño" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8, display: "block" }} onError={e => e.target.style.display="none"} />
              </div>
            )}

            {/* AGENCY: add design */}
            {!clientView && post.status === "content_approved" && (
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="Link de Drive / Dropbox del diseño..." value={designUrl} onChange={e => setDesignUrl(e.target.value)} style={inputStyle} />
                <button onClick={() => save({ design_url: designUrl, status: "design_review" })} style={btnStyle(COLORS.accent)}>
                  {saving ? "..." : "Subir diseño"}
                </button>
              </div>
            )}

            {/* CLIENT: approve/reject content */}
            {clientView && post.status === "pending" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => save({ status: "content_approved", comment: "" })} style={btnStyle(COLORS.green)}>✓ Aprobar contenido</button>
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="Pedí un cambio..." value={comment} onChange={e => setComment(e.target.value)} style={inputStyle} />
                  <button onClick={() => { save({ status: "changes_requested", comment }); setComment(""); }} style={btnStyle(COLORS.coral)}>Cambiar</button>
                </div>
              </div>
            )}

            {/* CLIENT: approve/reject design */}
            {clientView && post.status === "design_review" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => save({ status: "fully_approved", design_comment: "" })} style={btnStyle(COLORS.green)}>✓ Aprobar diseño</button>
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="Pedí un cambio en el diseño..." value={designComment} onChange={e => setDesignComment(e.target.value)} style={inputStyle} />
                  <button onClick={() => { save({ status: "changes_requested", design_comment: designComment }); setDesignComment(""); }} style={btnStyle(COLORS.coral)}>Cambiar</button>
                </div>
              </div>
            )}

            {post.status === "fully_approved" && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "#152A20", border: "1px solid #4ECDC444", color: "#4ECDC4", fontSize: 12, textAlign: "center", fontWeight: 600 }}>
                ✓ Contenido y diseño aprobados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI MODAL ─────────────────────────────────────────────────────────────────
function AIGenerateModal({ client, onGenerate, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");

  async function generate() {
    setLoading(true); setError("");
    try {
      const prompt = `Eres un estratega de contenido para Instagram especializado en ${client.rubro}.
Generá un plan de contenido para julio 2025 para la cuenta ${client.instagram} (${client.name}).

Devolvé SOLO un JSON válido (sin markdown, sin explicaciones) con este formato exacto:
{"posts":[{"day":3,"format":"reel","hook":"...","copy":"...","cta":"..."}],"trends":["tendencia 1","tendencia 2","tendencia 3"],"hooks_virales":["hook 1","hook 2","hook 3"]}

Genera exactamente 6 posts distribuidos en el mes. Formatos: reel, carrusel, historia, imagen.
Contenido específico para ${client.rubro}, en español, tono cercano y auténtico.
Incluye 3 tendencias actuales del rubro y 3 hooks virales adaptados al negocio.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(i => i.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
    } catch { setError("Error al generar. Intentá de nuevo."); }
    setLoading(false);
  }

  useEffect(() => { generate(); }, []);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background: COLORS.surface, borderRadius:16, border:`1px solid ${COLORS.border}`, width:"100%", maxWidth:560, maxHeight:"85vh", overflow:"auto", padding:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h2 style={{ color: COLORS.textPrimary, margin:0, fontSize:18 }}>✨ IA generando plan</h2>
            <p style={{ color: COLORS.textSecondary, fontSize:13, margin:"4px 0 0" }}>{client.name} · {client.rubro}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color: COLORS.textMuted, fontSize:20, cursor:"pointer" }}>✕</button>
        </div>

        {loading && (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <AILoadingDots />
            <p style={{ color: COLORS.textSecondary, fontSize:13, marginTop:16 }}>Analizando rubro y generando contenido estratégico...</p>
          </div>
        )}
        {error && <div style={{ textAlign:"center" }}><p style={{ color: COLORS.coral, fontSize:13 }}>{error}</p><button onClick={generate} style={btnStyle(COLORS.accent)}>Reintentar</button></div>}

        {result && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ padding:14, background: COLORS.bg, borderRadius:10, border:`1px solid ${COLORS.border}` }}>
              <p style={{ color: COLORS.accentLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>📈 Tendencias del rubro</p>
              {result.trends?.map((t,i) => <p key={i} style={{ color: COLORS.textPrimary, fontSize:13, margin:"4px 0" }}>· {t}</p>)}
            </div>
            <div style={{ padding:14, background: COLORS.bg, borderRadius:10, border:`1px solid ${COLORS.border}` }}>
              <p style={{ color: COLORS.yellow, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>🎣 Hooks virales</p>
              {result.hooks_virales?.map((h,i) => <p key={i} style={{ color: COLORS.textPrimary, fontSize:13, margin:"4px 0" }}>· {h}</p>)}
            </div>
            <div>
              <p style={{ color: COLORS.textSecondary, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>📅 Posts generados ({result.posts?.length})</p>
              {result.posts?.map((p,i) => (
                <div key={i} style={{ padding:"10px 12px", background: COLORS.bg, border:`1px solid ${COLORS.border}`, borderRadius:8, marginBottom:8 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                    <span style={{ color: COLORS.textPrimary, fontWeight:600, fontSize:12 }}>{p.day} jul</span>
                    <FormatBadge format={p.format} />
                  </div>
                  <p style={{ color: COLORS.textSecondary, fontSize:12, margin:0 }}>{p.hook}</p>
                </div>
              ))}
            </div>
            <button onClick={() => { onGenerate(result); onClose(); }} style={{
              padding:"12px 20px", borderRadius:10, background: COLORS.accent,
              border:"none", color: COLORS.white, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            }}>
              Agregar al calendario →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CLIENT VIEW ──────────────────────────────────────────────────────────────
function ClientView({ client, posts, onUpdate }) {
  const [tab, setTab] = useState("list");
  const needsAction = posts.filter(p => p.status === "pending" || p.status === "design_review" || p.status === "changes_requested").length;

  return (
    <div style={{ minHeight:"100vh", background: COLORS.bg, fontFamily:"Inter, system-ui, sans-serif" }}>
      <div style={{ background: COLORS.surface, borderBottom:`1px solid ${COLORS.border}`, padding:"16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:`${client.color}22`, border:`1px solid ${client.color}44`, display:"flex", alignItems:"center", justifyContent:"center", color:client.color, fontWeight:800, fontSize:16 }}>
            {client.name[0]}
          </div>
          <div>
            <h1 style={{ color: COLORS.textPrimary, margin:0, fontSize:17, fontWeight:700 }}>{client.name}</h1>
            <p style={{ color: COLORS.textSecondary, margin:0, fontSize:12 }}>Plan de contenido · Julio 2025</p>
          </div>
        </div>
      </div>

      <div style={{ padding:16, maxWidth:680, margin:"0 auto" }}>
        <StatsBar posts={posts} />

        {needsAction > 0 && (
          <div style={{ marginTop:16, padding:"12px 16px", borderRadius:10, background:"#1A1535", border:`1px solid ${COLORS.accent}44`, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>👋</span>
            <div>
              <p style={{ color: COLORS.accentLight, fontWeight:600, fontSize:13, margin:0 }}>{needsAction} publicación{needsAction !== 1 ? "es" : ""} esperan tu revisión</p>
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:4, margin:"16px 0 12px" }}>
          {[{key:"list",label:"Lista"},{key:"calendar",label:"Calendario"}].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding:"7px 16px", borderRadius:8, cursor:"pointer",
              background: tab===t.key ? COLORS.accent : COLORS.surface,
              border:`1px solid ${tab===t.key ? COLORS.accent : COLORS.border}`,
              color: tab===t.key ? COLORS.white : COLORS.textSecondary,
              fontSize:13, fontWeight:600, fontFamily:"inherit",
            }}>{t.label}</button>
          ))}
        </div>

        {tab === "calendar" ? <CalendarView posts={posts} /> : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {posts.sort((a,b) => a.day - b.day).map(post => (
              <PostCard key={post.id} post={post} onUpdate={onUpdate} clientView />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AGENCY VIEW ──────────────────────────────────────────────────────────────
function AgencyView({ clients, posts, onUpdatePost, onAddPosts }) {
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id);
  const [tab, setTab]     = useState("list");
  const [showAI, setShowAI] = useState(false);
  const [copied, setCopied] = useState(false);

  const client = clients.find(c => c.id === selectedClient);
  const clientPosts = posts.filter(p => p.client_id === selectedClient);

  function copyClientLink() {
    const url = `${window.location.origin}?view=client&cid=${selectedClient}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  async function handleAIGenerate(result) {
    const newPosts = result.posts.map(p => ({
      client_id: selectedClient,
      day: p.day, month: 7, year: 2025,
      format: p.format, hook: p.hook, copy: p.copy, cta: p.cta,
      status: "pending", design_url: "", design_comment: "", comment: "",
    }));
    await onAddPosts(newPosts);
  }

  if (!client) return <div style={{ color: COLORS.textPrimary, padding: 40 }}>Cargando...</div>;

  return (
    <div style={{ minHeight:"100vh", background: COLORS.bg, fontFamily:"Inter, system-ui, sans-serif" }}>
      {showAI && <AIGenerateModal client={client} onGenerate={handleAIGenerate} onClose={() => setShowAI(false)} />}

      {/* Top bar */}
      <div style={{ background: COLORS.surface, borderBottom:`1px solid ${COLORS.border}`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background: COLORS.accentGlow, border:`1px solid ${COLORS.accent}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📅</div>
          <div>
            <h1 style={{ color: COLORS.textPrimary, margin:0, fontSize:16, fontWeight:700 }}>Social Planner</h1>
            <p style={{ color: COLORS.textMuted, margin:0, fontSize:11 }}>Panel de agencia</p>
          </div>
        </div>
        <span style={{ color: COLORS.textMuted, fontSize:11 }}>Julio 2025</span>
      </div>

      <div style={{ display:"flex", height:"calc(100vh - 57px)" }}>
        {/* Sidebar */}
        <div style={{ width:200, flexShrink:0, background: COLORS.surface, borderRight:`1px solid ${COLORS.border}`, padding:12, display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
          <p style={{ color: COLORS.textMuted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", padding:"4px 8px", margin:"0 0 4px" }}>Clientes</p>
          {clients.map(c => {
            const cp = posts.filter(p => p.client_id === c.id);
            const badge = cp.filter(p => ["pending","design_review","changes_requested"].includes(p.status)).length;
            return (
              <button key={c.id} onClick={() => setSelectedClient(c.id)} style={{
                display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:8, cursor:"pointer",
                background: selectedClient===c.id ? COLORS.accentGlow : "transparent",
                border:`1px solid ${selectedClient===c.id ? COLORS.accent+"44" : "transparent"}`,
                textAlign:"left", fontFamily:"inherit",
              }}>
                <div style={{ width:28, height:28, borderRadius:7, flexShrink:0, background:`${c.color}22`, border:`1px solid ${c.color}44`, display:"flex", alignItems:"center", justifyContent:"center", color:c.color, fontWeight:800, fontSize:12 }}>
                  {c.name[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color: COLORS.textPrimary, margin:0, fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</p>
                  <p style={{ color: COLORS.textMuted, margin:0, fontSize:10 }}>{c.rubro}</p>
                </div>
                {badge > 0 && (
                  <span style={{ width:18, height:18, borderRadius:"50%", background: COLORS.coral, color: COLORS.white, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main */}
        <div style={{ flex:1, overflow:"auto", padding:20 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <div>
              <h2 style={{ color: COLORS.textPrimary, margin:"0 0 4px", fontSize:20, fontWeight:700 }}>
                <span style={{ color: client.color }}>{client.name}</span>
              </h2>
              <p style={{ color: COLORS.textSecondary, margin:0, fontSize:13 }}>{client.instagram} · {client.rubro}</p>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <button onClick={copyClientLink} style={btnStyle(COLORS.textSecondary)}>
                {copied ? "✓ Copiado" : "🔗 Link del cliente"}
              </button>
              <button onClick={() => setShowAI(true)} style={{
                padding:"8px 14px", borderRadius:8, background:`${COLORS.accent}22`,
                border:`1px solid ${COLORS.accent}66`, color: COLORS.accentLight,
                fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
              }}>✨ Generar con IA</button>
            </div>
          </div>

          <StatsBar posts={clientPosts} />

          <div style={{ display:"flex", gap:4, margin:"14px 0 12px" }}>
            {[{key:"list",label:"Publicaciones"},{key:"calendar",label:"Calendario"}].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding:"7px 16px", borderRadius:8, cursor:"pointer",
                background: tab===t.key ? COLORS.accent : COLORS.surface,
                border:`1px solid ${tab===t.key ? COLORS.accent : COLORS.border}`,
                color: tab===t.key ? COLORS.white : COLORS.textSecondary,
                fontSize:13, fontWeight:600, fontFamily:"inherit",
              }}>{t.label}</button>
            ))}
          </div>

          {tab === "calendar" ? <CalendarView posts={clientPosts} /> : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {clientPosts.length === 0 ? (
                <div style={{ textAlign:"center", padding:"60px 20px", color: COLORS.textMuted }}>
                  <p style={{ fontSize:40, margin:"0 0 12px" }}>📭</p>
                  <p style={{ fontSize:14, fontWeight:600, color: COLORS.textSecondary }}>Sin posts todavía</p>
                  <p style={{ fontSize:13 }}>Usá "Generar con IA" para crear el plan del mes</p>
                </div>
              ) : (
                clientPosts.sort((a,b) => a.day - b.day).map(post => (
                  <PostCard key={post.id} post={post} onUpdate={(id, changes) => onUpdatePost(id, changes)} clientView={false} />
                ))
              )}
            </div>
          )}
        </div>
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

  // Detect client view from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "client" && params.get("cid")) {
      setView("client");
      setClientId(params.get("cid"));
    }
  }, []);

  // Load data from Supabase
  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from("clients").select("*").order("name");
      const { data: p } = await supabase.from("posts").select("*").order("day");
      setClients(c || []);
      setPosts(p || []);
      setLoading(false);
    }
    load();
  }, []);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("posts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, payload => {
        if (payload.eventType === "UPDATE") {
          setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        }
        if (payload.eventType === "INSERT") {
          setPosts(prev => [...prev, payload.new]);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function updatePost(id, changes) {
    const { data } = await supabase.from("posts").update(changes).eq("id", id).select().single();
    if (data) setPosts(prev => prev.map(p => p.id === id ? data : p));
  }

  async function addPosts(newPosts) {
    const { data } = await supabase.from("posts").insert(newPosts).select();
    if (data) setPosts(prev => [...prev, ...data]);
  }

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background: COLORS.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter, system-ui, sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <AILoadingDots />
          <p style={{ color: COLORS.textSecondary, marginTop:16, fontSize:14 }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (view === "client" && clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return <div style={{ color: COLORS.textPrimary, padding:40, fontFamily:"Inter" }}>Cliente no encontrado.</div>;
    return <ClientView client={client} posts={posts.filter(p => p.client_id === clientId)} onUpdate={updatePost} />;
  }

  return <AgencyView clients={clients} posts={posts} onUpdatePost={updatePost} onAddPosts={addPosts} />;
}
