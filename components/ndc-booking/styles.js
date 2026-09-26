// Shared styles for NDC booking flow
export const bookingStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fi{width:100%;padding:10px 12px;border:1.5px solid #e2e5ea;border-radius:8px;font-family:'Nunito Sans',sans-serif;font-size:0.88rem;color:#1a1a2e;background:#fff;outline:none;transition:border-color .15s,box-shadow .15s;-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}
  .fi:focus{border-color:#4361ee;box-shadow:0 0 0 3px rgba(67,97,238,.1)}
  .fi.err{border-color:#ef4444;background-color:#fff5f5}
  .fi::placeholder{color:#b0b8c4}
  .scard{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:0}
  .shd{padding:14px 18px;border-bottom:1px solid #f0f1f3;font-size:.875rem;font-weight:700;color:#111}
  .sb{padding:16px 18px}
  .sec-card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:14px;animation:fadeUp .3s ease}
  .sec-hd{padding:16px 22px;border-bottom:1px solid #f0f1f3;font-size:.9rem;font-weight:700;color:#111;display:flex;align-items:center;gap:10px}
  .sec-bd{padding:22px}
  .fl{display:block;font-size:.73rem;font-weight:600;color:#6b7280;margin-bottom:7px;letter-spacing:.3px}
  .ferr{font-size:.72rem;color:#ef4444;margin-top:5px;display:flex;align-items:center;gap:4px}
  .fg{margin-bottom:18px}
  .fr2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .fr3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
  @media(max-width:600px){.fr2,.fr3{grid-template-columns:1fr}}
  .opt-btn{width:100%;padding:10px 14px;border:1.5px dashed #4361ee;border-radius:8px;background:#f0f4ff;color:#4361ee;font-family:'Nunito Sans',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;transition:background .15s;margin-top:8px}
  .opt-btn:hover{background:#e0e8ff}
  .add-btn{width:100%;padding:12px;border:1.5px dashed #4361ee;border-radius:8px;background:#f0f4ff;color:#4361ee;font-family:'Nunito Sans',sans-serif;font-size:.85rem;font-weight:700;cursor:pointer;transition:background .15s;margin-top:10px}
  .add-btn:hover{background:#e0e8ff}
  .ins-card{background:linear-gradient(135deg,#4361ee 0%,#7c3aed 100%);border-radius:10px;padding:16px;color:#fff;margin-bottom:10px}
  .tag{display:inline-flex;align-items:center;gap:5px;font-size:.7rem;color:#6b7280;background:#f3f4f6;border-radius:20px;padding:3px 9px;margin-top:5px;margin-right:4px}
  .tag.red{color:#ef4444;background:#fff0f0}
  .tag.grn{color:#059669;background:#f0fdf4}
  .cont-btn{width:100%;padding:14px;border-radius:9px;border:none;background:#4361ee;color:#fff;font-family:'Nunito Sans',sans-serif;font-size:.95rem;font-weight:800;cursor:pointer;transition:all .2s;margin-top:16px;display:flex;align-items:center;justify-content:center;gap:8px}
  .cont-btn:hover{background:#3451d1;transform:translateY(-1px);box-shadow:0 8px 20px rgba(67,97,238,.3)}
  .cont-btn:disabled{background:#a5b4fc;cursor:not-allowed;transform:none;box-shadow:none}
  .back-btn2{padding:12px 20px;border-radius:9px;border:1.5px solid #e2e5ea;background:#fff;color:#6b7280;font-family:'Nunito Sans',sans-serif;font-size:.88rem;font-weight:600;cursor:pointer;transition:all .15s}
  .back-btn2:hover{border-color:#4361ee;color:#4361ee}
  .reward-card{border:1.5px solid #e2e5ea;border-radius:9px;padding:14px 16px;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
  .reward-card.active{border-color:#4361ee;background:#f0f4ff}
  .spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spin .7s linear infinite}
  .pay-input{width:100%;padding:12px 14px;border:1.5px solid #e2e5ea;border-radius:8px;font-family:'Nunito Sans',sans-serif;font-size:.9rem;color:#111;outline:none;transition:border-color .15s,box-shadow .15s}
  .pay-input:focus{border-color:#4361ee;box-shadow:0 0 0 3px rgba(67,97,238,.1)}
  .layout{max-width:1100px;margin:0 auto;padding:24px 16px;display:grid;grid-template-columns:1fr 320px;gap:22px;align-items:start}
  @media(max-width:900px){.layout{grid-template-columns:1fr}.sidebar-wrap{order:-1}}
  .step-bar{max-width:1100px;margin:0 auto;padding:14px 16px;display:flex;align-items:center;gap:0;overflow-x:auto}
  .badge-new{display:inline-block;background:#f59e0b;color:#fff;font-size:.58rem;font-weight:800;border-radius:4px;padding:1px 5px;margin-left:5px;text-transform:uppercase;vertical-align:middle}
  .badge-pop{display:inline-block;background:#4361ee;color:#fff;font-size:.58rem;font-weight:800;border-radius:4px;padding:1px 5px;margin-left:5px;text-transform:uppercase;vertical-align:middle}
`;

export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const DAYS = Array.from({length:31},(_,i)=>i+1);
export const BIRTH_YEARS = Array.from({length:100},(_,i)=>new Date().getFullYear()-i);
export const EXPIRY_YEARS = Array.from({length:20},(_,i)=>new Date().getFullYear()+i);
