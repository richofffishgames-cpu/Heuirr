import React, { useState, useEffect } from "react"
import { Layout, LogOut, Plus, RefreshCw, LogIn, PlusCircle, CreditCard, Gift, Key, PlayCircle } from "lucide-react"

const API_URL = "http://localhost:3000/api"

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"))
  const [view, setView] = useState(user?.role === "admin" ? "admin" : "platforms")
  const [platforms, setPlatforms] = useState([])
  const [selectedPlatform, setSelectedPlatform] = useState(null)

  useEffect(() => {
    if (token) fetchPlatforms()
  }, [token])

  const fetchPlatforms = async () => {
    const res = await fetch(`${API_URL}/${user.role}/platforms`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setPlatforms(data)
  }

  const login = async (e) => {
    e.preventDefault()
    const form = e.target
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.username.value, password: form.password.value })
    })
    const data = await res.json()
    if (data.token) {
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      setView(data.user.role === "admin" ? "admin" : "platforms")
    }
  }

  const logout = () => {
    localStorage.clear()
    setToken(null)
    setUser(null)
    setView("login")
  }

  const createAccount = async (platformId) => {
    const res = await fetch(`${API_URL}/player/platforms/${platformId}/create-account`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      fetchPlatforms()
      // Update selected platform to show new account
      const updated = await res.json()
      setSelectedPlatform(prev => ({ ...prev, account: updated }))
    }
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="glass-card p-8 w-full max-w-md rounded-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Vaultify</h1>
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-400">Username</label>
            <input name="username" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 outline-none focus:border-blue-500 transition-colors" defaultValue="admin" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-400">Password</label>
            <input name="password" type="password" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 outline-none focus:border-blue-500 transition-colors" defaultValue="password" />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            <LogIn size={20} /> Sign In
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-slate-800 p-6 hidden md:flex flex-col gap-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Vaultify</h1>
        <nav className="flex-1 space-y-2">
          {user.role === "admin" ? (
            <button onClick={() => setView("admin")} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === "admin" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}>
              <Layout size={20} /> Admin Panel
            </button>
          ) : (
            <button onClick={() => setView("platforms")} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === "platforms" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}>
              <Layout size={20} /> Platforms
            </button>
          )}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-red-950 hover:text-red-400 transition-all">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {view === "platforms" && (
            <div>
              <h2 className="text-3xl font-bold mb-8">Platforms</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {platforms.slice(0, 16).map(p => (
                  <div key={p.id} onClick={() => setSelectedPlatform(p)} className="glass-card p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform group relative overflow-hidden">
                    <div className="aspect-square bg-slate-900 rounded-xl mb-4 overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold text-4xl">{p.name[0]}</div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-center group-hover:text-blue-400 transition-colors">{p.name}</h3>
                    {p.account && <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">Active</div>}
                  </div>
                ))}
                {user.role === "admin" && (
                   <div onClick={() => setView("add-platform")} className="glass border-2 border-dashed border-slate-800 p-4 rounded-2xl cursor-pointer hover:border-blue-500 transition-colors flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-blue-500">
                    <PlusCircle size={48} />
                    <span className="font-bold">Add Platform</span>
                   </div>
                )}
              </div>
            </div>
          )}

          {view === "admin" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Admin Dashboard</h2>
                <button onClick={() => setView("add-platform")} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                  <Plus size={20} /> Add Platform
                </button>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="p-4 font-bold text-slate-400">Name</th>
                      <th className="p-4 font-bold text-slate-400">Play URL</th>
                      <th className="p-4 font-bold text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {platforms.slice(0, 16).map(p => (
                      <tr key={p.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 font-medium">{p.name}</td>
                        <td className="p-4 text-slate-400 text-sm truncate max-w-xs">{p.playUrl}</td>
                        <td className="p-4 text-right">
                          <button className="text-slate-400 hover:text-white transition-colors">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === "add-platform" && (
            <div className="max-w-xl">
               <h2 className="text-3xl font-bold mb-8">Add New Platform</h2>
               <form className="glass-card p-6 rounded-2xl space-y-6" onSubmit={async (e) => {
                 e.preventDefault()
                 const res = await fetch(`${API_URL}/admin/platforms`, {
                   method: "POST",
                   headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${token}`
                   },
                   body: JSON.stringify({
                     name: e.target.name.value,
                     imageUrl: e.target.imageUrl.value,
                     playUrl: e.target.playUrl.value,
                   })
                 })
                 if (res.ok) {
                   fetchPlatforms()
                   setView("admin")
                 }
               }}>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-400">Platform Name</label>
                    <input name="name" required className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 outline-none focus:border-blue-500" placeholder="e.g. Orion" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-400">Image URL</label>
                    <input name="imageUrl" required className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 outline-none focus:border-blue-500" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-400">Play URL</label>
                    <input name="playUrl" required className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 outline-none focus:border-blue-500" placeholder="https://..." />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold">Create Platform</button>
                    <button type="button" onClick={() => setView("admin")} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-bold">Cancel</button>
                  </div>
               </form>
            </div>
          )}
        </div>
      </main>

      {/* Platform Detail Modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="glass-card w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
              <div className="w-full md:w-1/2 bg-slate-900 flex items-center justify-center overflow-hidden">
                 {selectedPlatform.imageUrl ? (
                   <img src={selectedPlatform.imageUrl} className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-slate-800 font-bold text-8xl">{selectedPlatform.name[0]}</div>
                 )}
              </div>
              <div className="p-8 flex-1 flex flex-col gap-6">
                 <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-bold">{selectedPlatform.name}</h2>
                    <button onClick={() => setSelectedPlatform(null)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                 </div>

                 {!selectedPlatform.account ? (
                   <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12 text-center">
                      <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400">
                        <Plus size={40} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Create Account</h3>
                        <p className="text-slate-400 text-sm">Join {selectedPlatform.name} to start playing. We'll generate your credentials instantly.</p>
                      </div>
                      <button onClick={() => createAccount(selectedPlatform.id)} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02]">Create My Account</button>
                   </div>
                 ) : (
                   <div className="flex-1 space-y-6">
                      <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                           <input readOnly value={selectedPlatform.account.username} className="w-full bg-transparent font-mono text-emerald-400 outline-none" />
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                           <input type="text" readOnly value={selectedPlatform.account.password} className="w-full bg-transparent font-mono text-emerald-400 outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 p-4 rounded-2xl font-bold transition-colors">
                           <CreditCard size={18} /> Deposit
                         </button>
                         <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 p-4 rounded-2xl font-bold transition-colors">
                           <Gift size={18} /> Redeem
                         </button>
                         <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 p-4 rounded-2xl font-bold transition-colors">
                           <RefreshCw size={18} /> Reset PW
                         </button>
                         <a href={selectedPlatform.playUrl} target="_blank" className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 p-4 rounded-2xl font-bold transition-colors">
                           <PlayCircle size={18} /> Play Now
                         </a>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
