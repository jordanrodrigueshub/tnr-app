import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

type CatalogItem = { id:string; code:string; name:string; unit:string; defaultLaborRate:number; defaultMaterial:number }
type Estimate = { id:string; title:string; scope?:string; status:string; createdAt:string }
type Client = { id:string; name:string; email?:string; phone?:string; company?:string }
type Schedule = { id:string; title:string; startDate:string; endDate:string; location?:string; client?: Client }

function Nav({tab, setTab}:{tab:string,setTab:(t:string)=>void}){
  return (
    <div className="top">
      <h3 style={{margin:0}}>TnR App (Online)</h3>
      <div className="nav">
        {['Dashboard','Catalog','Estimates','Clients','Schedules'].map(t => (
          <a key={t} href="#" className={tab===t?'active':''} onClick={(e)=>{e.preventDefault();setTab(t)}}>{t}</a>
        ))}
      </div>
    </div>
  )
}

export default function App(){
  const [tab, setTab] = useState('Dashboard')
  const [health, setHealth] = useState('checking...')
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(()=>{
    fetch(`${API}/health`).then(r=>r.json()).then(d=>setHealth(d.ok?'OK':'DOWN')).catch(()=>setHealth('DOWN'))
  },[])

  useEffect(()=>{
    if (tab==='Catalog') fetch(`${API}/api/catalog`).then(r=>r.json()).then(setCatalog).catch(()=>setCatalog([]))
    if (tab==='Estimates') fetch(`${API}/api/estimates`).then(r=>r.json()).then(setEstimates).catch(()=>setEstimates([]))
    if (tab==='Clients') fetch(`${API}/api/clients`).then(r=>r.json()).then(setClients).catch(()=>setClients([]))
    if (tab==='Schedules') fetch(`${API}/api/schedules`).then(r=>r.json()).then(setSchedules).catch(()=>setSchedules([]))
  },[tab])

  return (
    <>
      <Nav tab={tab} setTab={setTab} />
      <div className="wrap">
        {tab==='Dashboard' && (
          <div className="card">
            <h2>Dashboard</h2>
            <p>Status da API: <b>{health}</b></p>
            <p>Use as abas acima para navegar. Configure <code>VITE_API_BASE</code> na Vercel apontando para a URL do backend (Railway).</p>
          </div>
        )}

        {tab==='Catalog' && (
          <div className="card">
            <h2>Catalog (seed)</h2>
            <table>
              <thead><tr><th>Code</th><th>Description</th><th>Unit</th><th>Labor</th><th>Material</th></tr></thead>
              <tbody>
                {catalog.map(it=>(
                  <tr key={it.id}><td>{it.code}</td><td>{it.name}</td><td>{it.unit}</td><td>{it.defaultLaborRate}</td><td>{it.defaultMaterial}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==='Estimates' && (
          <div className="card">
            <h2>Estimates</h2>
            <table>
              <thead><tr><th>Title</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                {estimates.map(e=>(
                  <tr key={e.id}><td>{e.title}</td><td>{e.status}</td><td>{new Date(e.createdAt).toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
            <p style={{opacity:.8}}>Endpoint de itens: <code>/api/estimates/:id/items</code></p>
          </div>
        )}

        {tab==='Clients' && (
          <div className="card">
            <h2>Clients</h2>
            <table>
              <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th></tr></thead>
              <tbody>
                {clients.map(c=>(
                  <tr key={c.id}><td>{c.name}</td><td>{c.company ?? '-'}</td><td>{c.email ?? '-'}</td><td>{c.phone ?? '-'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==='Schedules' && (
          <div className="card">
            <h2>Schedules</h2>
            <table>
              <thead><tr><th>Title</th><th>Client</th><th>Start</th><th>End</th><th>Location</th></tr></thead>
              <tbody>
                {schedules.map(s=>(
                  <tr key={s.id}><td>{s.title}</td><td>{s.client?.name ?? '-'}</td><td>{new Date(s.startDate).toLocaleString()}</td><td>{new Date(s.endDate).toLocaleString()}</td><td>{s.location ?? '-'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
