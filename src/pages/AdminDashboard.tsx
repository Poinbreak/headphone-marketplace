import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

type Review  = { id: string; name: string; product: string; rating: number; body: string; sentiment: string; source: string; createdAt: string; };
type Complaint = { id: string; name: string; email: string; category: string; title: string; description: string; status: string; createdAt: string; };

const AVATAR_COLORS = [
  'linear-gradient(135deg,#0050FF,#00D6FF)',
  'linear-gradient(135deg,#6600FF,#cc00ff)',
  'linear-gradient(135deg,#FF6B00,#FFB800)',
  'linear-gradient(135deg,#00B894,#00D6FF)',
  'linear-gradient(135deg,#e84393,#FF6B00)',
];

const SEED_REVIEWS: Review[] = [
  { id:'r1',name:'Arjun M.',product:'Sony WH-1000XM5',rating:5,body:"The AI recommendation nailed it. I love jazz and long-haul travel, and it suggested the XM5 — absolute perfection. ANC is unbeatable, sound is warm and spacious. Best purchase I've made this year.",sentiment:'Positive',source:'Curated',createdAt:'2025-02-24T10:00:00Z' },
  { id:'r2',name:'Sneha R.',product:'Bose QuietComfort 45',rating:4,body:"Was skeptical about an AI recommendation tool but this is genuinely good. The comparison feature helped me choose between QC45 and XM5 — the side-by-side spec breakdown was incredibly useful and honest.",sentiment:'Positive',source:'Curated',createdAt:'2025-02-22T10:00:00Z' },
  { id:'r3',name:'Kartik V.',product:'Apple AirPods Max',rating:3,body:"Good recommendation overall. AirPods Max were recommended despite my stated budget limit. The product itself is premium but I wish the filter was stricter about price range.",sentiment:'Neutral',source:'Curated',createdAt:'2025-02-20T10:00:00Z' },
  { id:'r4',name:'Priya L.',product:'Sennheiser HD 450BT',rating:2,body:"The headphones were not great for gaming — the latency was higher than described. I expected SoundMatch to flag this for gaming use cases but it didn't. Disappointed.",sentiment:'Negative',source:'Curated',createdAt:'2025-02-18T10:00:00Z' },
  { id:'r5',name:'Rohan T.',product:'Audio-Technica ATH-M50X',rating:5,body:"Perfect recommendation for a music producer on a mid budget. The M50X is legendary and SoundMatch knew exactly what to suggest for studio use.",sentiment:'Positive',source:'Curated',createdAt:'2025-02-15T10:00:00Z' },
];

const SEED_COMPLAINTS: Complaint[] = [
  { id:'CMP-0047',name:'Kartik V.',email:'kartik@example.com',category:'Algorithm Bug',title:'Recommendation ignored budget filter',description:"The questionnaire allowed me to set a max budget of ₹8,000 but the results included headphones priced at ₹14,000 and above. The budget filter either didn't save or isn't working correctly. This was misleading.",status:'Open',createdAt:'2025-02-21T10:00:00Z' },
  { id:'CMP-0046',name:'Priya L.',email:'priya@example.com',category:'Data Accuracy',title:'Gaming latency not flagged in recommendations',description:'When I selected "Gaming" as my primary use case, the recommended Sennheiser HD 450BT wasn\'t flagged for its higher Bluetooth latency. This information should be surfaced prominently for gaming use cases.',status:'Open',createdAt:'2025-02-19T10:00:00Z' },
  { id:'CMP-0044',name:'Ananya S.',email:'ananya@example.com',category:'Technical Bug',title:'Compare page crashes on mobile Safari',description:'When trying to compare 3 headphones simultaneously on an iPhone 13 using Safari, the comparison page freezes and crashes. Chrome on the same device works fine.',status:'In Review',createdAt:'2025-02-14T10:00:00Z' },
  { id:'CMP-0041',name:'Divya K.',email:'divya@example.com',category:'UI Issue',title:'Product image not loading for Sony WH-1000XM4',description:"The product image for Sony WH-1000XM4 was showing a broken image icon on the product detail page. Fixed by re-uploading the asset with the correct filename. Resolved on 10 Feb 2025.",status:'Resolved',createdAt:'2025-02-08T10:00:00Z' },
];

const CATEGORIES = ['Algorithm Bug','Data Accuracy','Technical Bug','UI Issue','Missing Product','Pricing Error','Other'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState<'dashboard'|'submit'>('dashboard');
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [revFilter, setRevFilter]   = useState('all');
  const [cmpFilter, setCmpFilter]   = useState('all');
  const [adminUser, setAdminUser]   = useState<any>(null);

  // Submit complaint form
  const [cForm, setCForm] = useState({ name:'', email:'', category:'', title:'', description:'' });
  const [cStatus, setCStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user  = localStorage.getItem('admin_user');
    if (!token) { navigate('/admin/login'); return; }
    if (user) setAdminUser(JSON.parse(user));

    Promise.all([
      fetch('http://localhost:5000/api/reviews').then(r=>r.json()).catch(()=>[]),
      fetch('http://localhost:5000/api/complaints').then(r=>r.json()).catch(()=>[]),
    ]).then(([rv, cp]) => {
      setReviews([...(Array.isArray(rv)?rv:[]),...SEED_REVIEWS]);
      setComplaints([...(Array.isArray(cp)?cp:[]),...SEED_COMPLAINTS]);
    });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const resolve = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/complaints/${id}/resolve`, { method: 'PATCH' });
    } catch {}
    setComplaints(prev => prev.map(c => c.id===id ? { ...c, status:'Resolved' } : c));
  };

  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setCStatus('loading');
    try {
      const res = await fetch('http://localhost:5000/api/complaints', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(cForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComplaints(prev => [data.complaint, ...prev]);
      setCStatus('success');
      setCForm({ name:'', email:'', category:'', title:'', description:'' });
      setTimeout(()=>setCStatus('idle'), 4000);
    } catch { setCStatus('error'); }
  };

  // Stats
  const totalReviews  = reviews.length;
  const avgRating     = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : '—';
  const openCount     = complaints.filter(c=>c.status==='Open').length;
  const resolvedCount = complaints.filter(c=>c.status==='Resolved').length;

  const filteredRevs  = revFilter==='all' ? reviews : reviews.filter(r=>r.sentiment.toLowerCase()===revFilter);
  const filteredCmps  = cmpFilter==='all' ? complaints : complaints.filter(c=>c.status===cmpFilter);

  const initials = (name:string) => name.trim().split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,1);
  const sentClass = (s:string) => s==='Positive'?'badge-positive':s==='Negative'?'badge-negative':'badge-neutral';
  const stPill    = (s:string) => s==='Open'?'status-open':s==='In Review'?'status-review':'status-resolved';

  const fmtDate = (iso:string) => {
    try { return new Date(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
    catch { return iso; }
  };

  return (
    <div className="adm-root">
      {/* TOP BAR */}
      <div className="adm-topbar">
        <div className="adm-topbar-brand">
          <div className="adm-dot" />
          <span className="adm-topbar-logo">SoundMatch</span>
          <span className="adm-topbar-badge">Admin</span>
        </div>
        <div className="adm-topbar-nav">
          <button className={`adm-nav-btn ${page==='dashboard'?'active':''}`} onClick={()=>setPage('dashboard')}>Dashboard</button>
          <button className={`adm-nav-btn ${page==='submit'?'active':''}`} onClick={()=>setPage('submit')}>Submit Complaint</button>
        </div>
        <div className="adm-topbar-right">
          <span className="adm-topbar-user">Signed in as <strong>{adminUser?.name || 'Administrator'}</strong></span>
          <button className="adm-btn-logout" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="adm-layout">
        {/* -------- DASHBOARD PAGE -------- */}
        {page === 'dashboard' && (
          <>
            <div className="adm-page-header">
              <div className="adm-header-tag">
                <div className="adm-tag-line" /><span className="adm-tag-txt">Control Center</span>
              </div>
              <h1 className="adm-page-title">Admin Dashboard</h1>
              <p className="adm-page-sub">Monitor customer reviews, manage complaints, and oversee platform health.</p>
            </div>

            {/* Stats */}
            <div className="adm-stats-row">
              {[
                { label:'TOTAL REVIEWS',  val:totalReviews.toLocaleString(), change:'↑ 12% this month', neg:false },
                { label:'AVG RATING',     val:`${avgRating}★`,             change:'↑ 0.2 vs last month', neg:false },
                { label:'OPEN COMPLAINTS',val:openCount,                    change:'↑ 3 new today', neg:true },
                { label:'RESOLVED (30D)', val:resolvedCount,                change:'↑ 87% resolve rate', neg:false },
              ].map(s => (
                <div className="adm-stat-card" key={s.label}>
                  <div className="adm-stat-top" />
                  <div className="adm-stat-label">{s.label}</div>
                  <div className="adm-stat-val">{s.val}</div>
                  <div className={`adm-stat-change ${s.neg?'neg':''}`}>{s.change}</div>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div className="adm-section">
              <div className="adm-section-row">
                <div>
                  <div className="adm-section-title">Customer Reviews</div>
                  <div className="adm-section-sub">Latest feedback from verified buyers</div>
                </div>
                <div className="adm-filter-tabs">
                  {['all','positive','neutral','negative'].map(f=>(
                    <button key={f} className={`adm-filter-tab ${revFilter===f?'active':''}`} onClick={()=>setRevFilter(f)}>
                      {f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="adm-reviews-list">
                {filteredRevs.map((r,i)=>(
                  <div className="adm-review-card" data-sentiment={r.sentiment.toLowerCase()} key={r.id}>
                    <div className="adm-review-header">
                      <div className="adm-avatar" style={{background:AVATAR_COLORS[i%AVATAR_COLORS.length]}}>{initials(r.name)}</div>
                      <div className="adm-review-info">
                        <div className="adm-review-name">
                          {r.name}
                          <span className={`adm-review-badge ${sentClass(r.sentiment)}`}>{r.sentiment}</span>
                          {r.source==='Customer' && <span className="adm-cust-badge">Customer</span>}
                        </div>
                        <div className="adm-review-product">{r.product}</div>
                      </div>
                      <div className="adm-review-right">
                        <div className="adm-review-stars">
                          {Array.from({length:5},(_,j)=>(
                            <span key={j} className={`adm-star ${j<r.rating?'on':'off'}`}>★</span>
                          ))}
                        </div>
                        <div className="adm-review-date">{fmtDate(r.createdAt)}</div>
                      </div>
                    </div>
                    <div className="adm-review-body">{r.body}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaints */}
            <div className="adm-section">
              <div className="adm-section-row">
                <div>
                  <div className="adm-section-title">Customer Complaints</div>
                  <div className="adm-section-sub">Open and in-review issues requiring attention</div>
                </div>
                <div className="adm-filter-tabs">
                  {[['all','All'],['Open','Open'],['In Review','In Review'],['Resolved','Resolved']].map(([v,l])=>(
                    <button key={v} className={`adm-filter-tab ${cmpFilter===v?'active':''}`} onClick={()=>setCmpFilter(v)}>{l}</button>
                  ))}
                </div>
              </div>
              {filteredCmps.map(c=>(
                <div className="adm-complaint-card" key={c.id}>
                  <div className="adm-complaint-header">
                    <span className="adm-cmp-id">#{c.id}</span>
                    <span className="adm-cmp-title">{c.title}</span>
                    <span className={`adm-status-pill ${stPill(c.status)}`}>{c.status}</span>
                  </div>
                  <div className="adm-complaint-body">{c.description}</div>
                  <div className="adm-complaint-meta">
                    <div className="adm-meta-group">
                      <div className="adm-meta-item">User: <span>{c.name}</span></div>
                      <div className="adm-meta-item">Submitted: <span>{fmtDate(c.createdAt)}</span></div>
                      <div className="adm-meta-item">Category: <span>{c.category}</span></div>
                    </div>
                    {c.status!=='Resolved' && (
                      <button className="adm-btn-resolve" onClick={()=>resolve(c.id)}>Mark Resolved</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* -------- SUBMIT COMPLAINT PAGE -------- */}
        {page === 'submit' && (
          <>
            <div className="adm-page-header">
              <div className="adm-header-tag">
                <div className="adm-tag-line" /><span className="adm-tag-txt">Control Center</span>
              </div>
              <h1 className="adm-page-title">Submit Complaint / Report</h1>
              <p className="adm-page-sub">Log a new complaint on behalf of a customer or from direct feedback.</p>
            </div>

            <div className="adm-submit-card">
              <div className="adm-sc-title">Submit a New Complaint / Report</div>
              <div className="adm-sc-sub">Use this form to log a new complaint on behalf of a customer or from direct feedback.</div>

              {cStatus==='success' && <div className="adm-success-msg">✓ Complaint submitted successfully. Ticket ID assigned automatically.</div>}
              {cStatus==='error'   && <div className="adm-error-msg">✗ Failed to submit. Please try again.</div>}

              <form onSubmit={submitComplaint}>
                <div className="adm-sc-grid">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Customer Name</label>
                    <input className="adm-form-input" type="text" required placeholder="e.g. Arjun Mehta"
                      value={cForm.name} onChange={e=>setCForm(f=>({...f,name:e.target.value}))} />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Customer Email</label>
                    <input className="adm-form-input" type="email" required placeholder="customer@email.com"
                      value={cForm.email} onChange={e=>setCForm(f=>({...f,email:e.target.value}))} />
                  </div>
                </div>
                <div className="adm-sc-grid">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Category</label>
                    <select className="adm-form-select" required value={cForm.category}
                      onChange={e=>setCForm(f=>({...f,category:e.target.value}))}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Complaint Title</label>
                    <input className="adm-form-input" type="text" required placeholder="Brief title of the issue"
                      value={cForm.title} onChange={e=>setCForm(f=>({...f,title:e.target.value}))} />
                  </div>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Description</label>
                  <textarea className="adm-form-textarea" required placeholder="Describe the issue in detail..."
                    value={cForm.description} onChange={e=>setCForm(f=>({...f,description:e.target.value}))} rows={5} />
                </div>
                <button className="adm-btn-submit" type="submit" disabled={cStatus==='loading'}>
                  {cStatus==='loading' ? 'Submitting...' : 'Submit Complaint →'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
