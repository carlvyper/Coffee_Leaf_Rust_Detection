import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Camera, History, Leaf, User, AlertCircle, CheckCircle, Upload, Globe, FileText, CloudSun, Menu, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { kenyaData } from './kenyaData'; 

const App = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [language, setLanguage] = useState('EN'); 
  const [weather, setWeather] = useState({ temp: '--', hum: '--', risk: 'Low' }); 
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [history, setHistory] = useState([
    { 
      date: "April 03, 2026", 
      diagnosis: "Healthy", 
      severity: "N/A", 
      confidence: "98.2",
      ward: "Kirimari" 
    }
  ]);

  const [farmerData, setFarmerData] = useState({
    name: 'Nimlord Mwiti',
    county: 'Embu',
    constituency: 'Manyatta',
    ward: 'Kirimari',
    variety: 'SL28',
    acreage: '7'
  });

  const translations = {
    EN: {
      welcome: "Habari", scanBtn: "START SCAN", dash: "Dashboard", scanTab: "New Scan", 
      hist: "History", advice: "Advice", prof: "Profile", severity: "Severity Level",
      download: "Download Report", risk: "Local Risk", activeUser: "Active User"
    },
    SW: {
      welcome: "Jambo", scanBtn: "ANZA KUCHUNGUZA", dash: "Dashibodi", scanTab: "Changanua", 
      hist: "Historia", advice: "Ushauri", prof: "Wasifu", severity: "Kiwango cha Ugonjwa",
      download: "Pakua Ripoti", risk: "Hali ya Hatari", activeUser: "Mtumiaji"
    }
  };
  const t = translations[language];

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = "bd5e378503939ddaee76f12ad7a97608"; 
        const city = farmerData.county || "Embu";
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},KE&appid=${API_KEY}&units=metric`);
        const data = await res.json();
        const humidity = data.main.humidity;
        setWeather({
          temp: `${Math.round(data.main.temp)}°C`,
          hum: `${humidity}%`,
          risk: humidity > 80 ? "High" : "Low"
        });
      } catch (e) { console.error("Weather service unavailable"); }
    };
    fetchWeather();
  }, [farmerData.county]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "county") {
      setFarmerData(prev => ({ ...prev, county: value, constituency: '', ward: '' }));
    } else if (name === "constituency") {
      setFarmerData(prev => ({ ...prev, constituency: value, ward: '' }));
    } else {
      setFarmerData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (!farmerData.name) return alert("Please enter your name first.");
    alert(`Success! Profile updated for ${farmerData.name}.`);
    setActiveTab('Home');
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // PHASE 2 UPDATE: Now pointing to Render Production API
      const response = await fetch('https://coffee-rust-api-nimlord.onrender.com', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setPrediction(data);

      const newEntry = {
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        diagnosis: data.diagnosis,
        severity: data.severity || "N/A",
        confidence: data.confidence || "0",
        ward: farmerData.ward || "National"
      };
      setHistory(prev => [newEntry, ...prev]);

    } catch (error) {
      alert("Connection Error: Ensure your Render API is awake and CORS is configured!");
    } finally { setLoading(false); }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(5, 150, 105);
    doc.text("CoffeeDoc Health Report", 20, 25);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Farmer: ${farmerData.name}`, 20, 45);
    doc.text(`Location: ${farmerData.ward}, ${farmerData.county}`, 20, 55);
    doc.text(`Diagnosis: ${prediction.diagnosis}`, 20, 65);
    doc.text(`Severity: ${prediction.severity}`, 20, 75);
    doc.text("Expert Advice:", 20, 90);
    doc.text(prediction.advice, 20, 100, { maxWidth: 165 });
    doc.save(`${farmerData.name}_Report.pdf`);
  };

  return (
    <div className="flex h-screen bg-stone-50 font-sans text-stone-800 relative overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <nav className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-emerald-900 text-white flex flex-col p-6 shadow-2xl transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0
      `}>
        <div className="flex items-center justify-between mb-10 border-b border-emerald-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl text-emerald-900 shadow-lg"><Leaf size={28} fill="currentColor" /></div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">CoffeeDoc</h1>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">National AI</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLanguage(l => l === 'EN' ? 'SW' : 'EN')} className="p-2 hover:bg-emerald-800 rounded-lg">
              <Globe size={18} />
            </button>
            <button onClick={() => setIsMenuOpen(false)} className="lg:hidden p-2 hover:bg-emerald-800 rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { id: 'Home', label: t.dash, icon: <LayoutDashboard size={20} /> },
            { id: 'Scan', label: t.scanTab, icon: <Camera size={20} /> },
            { id: 'History', label: t.hist, icon: <History size={20} /> },
            { id: 'Advice', label: t.advice, icon: <Leaf size={20} /> },
            { id: 'Profile', label: t.prof, icon: <User size={20} /> },
          ].map((item) => (
            <button key={item.id} 
              onClick={() => {
                setActiveTab(item.id);
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-emerald-700 shadow-inner' : 'hover:bg-emerald-800/50 opacity-70'}`}>
              {item.icon} <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-emerald-800">
          <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">{t.activeUser}</p>
          <p className="text-sm font-black text-white">{farmerData.name || 'System Guest'}</p>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 w-full">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 bg-white rounded-xl shadow-sm border border-stone-200 text-emerald-900"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-2xl md:text-4xl font-black text-stone-900 uppercase tracking-tighter">{activeTab}</h2>
          </div>
          
          <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-2 md:gap-4">
            <div className="text-orange-500"><CloudSun size={24} /></div>
            <div className="text-right">
              <p className="text-[8px] md:text-[10px] font-black text-stone-400 uppercase leading-none">{t.risk}: {weather.risk}</p>
              <p className="text-xs md:text-sm font-bold">{weather.temp} | {weather.hum}</p>
            </div>
          </div>
        </header>

        {activeTab === 'Home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="mb-6">
              <h3 className="text-2xl md:text-3xl font-black text-stone-900">{t.welcome}, {farmerData.name}! 👋</h3>
              <p className="text-stone-500 font-medium text-sm md:text-base">Monitoring {farmerData.variety} in {farmerData.ward || farmerData.county || 'Kenya'}.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-100 text-center">
                <p className="text-stone-400 text-xs font-black mb-2 uppercase tracking-widest">Variety</p>
                <h3 className="text-xl md:text-2xl font-black text-emerald-900">{farmerData.variety}</h3>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-100 text-center">
                <p className="text-stone-400 text-xs font-black mb-2 uppercase tracking-widest">{t.risk}</p>
                <h3 className={`text-xl md:text-2xl font-black ${weather.risk === 'High' ? 'text-red-600' : 'text-emerald-700'}`}>{weather.risk}</h3>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-100 text-center">
                <p className="text-stone-400 text-xs font-black mb-2 uppercase tracking-widest">Location</p>
                <h3 className="text-xl md:text-2xl font-black text-emerald-700 italic truncate">{farmerData.ward || farmerData.county}</h3>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
                <h3 className="font-black text-lg md:text-xl mb-4 uppercase tracking-tighter">Regional Trends</h3>
                <div className="h-24 bg-stone-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-stone-200">
                  <p className="text-stone-400 font-bold italic text-sm text-center px-4">
                    Real-time Hotspots detected in {farmerData.county} based on {history.length} recent scans.
                  </p>
                </div>
            </div>
            
            <div className="bg-emerald-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-2xl gap-6">
              <div className="z-10 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-black mb-2">Monitor Coffee Health</h3>
                <p className="text-emerald-200 mb-6 md:mb-8 max-w-sm">AI analysis is optimized for your {farmerData.variety} crop.</p>
                <button onClick={() => setActiveTab('Scan')} className="bg-white text-emerald-900 px-10 py-4 rounded-2xl font-black uppercase">{t.scanBtn}</button>
              </div>
              <Leaf size={300} className="absolute right-[-40px] bottom-[-40px] opacity-10" />
            </div>
          </div>
        )}

      {activeTab === 'Scan' && (
        <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-stone-100 animate-in fade-in duration-500">
          {!previewUrl ? (
            <div className="flex flex-col gap-6">
              <label className="border-4 border-dashed border-emerald-200 bg-emerald-50 rounded-[2rem] h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all group">
                <input type="file" className="hidden" onChange={handleUpload} accept="image/*" capture="environment" />
                <div className="bg-emerald-600 p-6 rounded-full text-white mb-4 shadow-lg group-hover:scale-110 transition-transform"><Camera size={40} /></div>
                <p className="font-black text-emerald-900 uppercase tracking-tight text-center">Open Field Camera</p>
                <p className="text-[10px] md:text-xs text-emerald-600 mt-2 font-bold uppercase italic">Capture Leaf for {farmerData.name}</p>
              </label>

              <label className="border-2 border-stone-200 rounded-[2rem] py-6 flex items-center justify-center gap-4 cursor-pointer hover:bg-stone-50 transition-all">
                <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                <Upload size={20} className="text-stone-400" />
                <p className="font-bold text-stone-600 uppercase text-sm">Choose from Gallery</p>
              </label>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <img src={previewUrl} className="rounded-[2rem] w-full h-56 md:h-72 object-cover shadow-lg" alt="Preview" />
              {loading && (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
                  <div className="animate-pulse text-emerald-700 font-black tracking-widest italic text-sm">AI ANALYZING TISSUE...</div>
                </div>
              )}
              {prediction && (
                <div className={`p-6 md:p-8 rounded-[2rem] animate-in slide-in-from-bottom-4 duration-500 ${prediction.diagnosis === 'Healthy' ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-900'}`}>
                  <div className="flex items-center justify-center gap-2 text-xl md:text-2xl font-black mb-2 uppercase tracking-tighter">
                    {prediction.diagnosis === 'Healthy' ? <CheckCircle /> : <AlertCircle />} {prediction.diagnosis}
                  </div>
                  <p className="font-bold opacity-70 mb-4 text-[10px] md:text-xs uppercase tracking-widest">{t.severity}: {prediction.severity}</p>
                  <div className="bg-white/50 p-4 md:p-6 rounded-2xl text-left text-sm font-medium italic mb-6 shadow-inner">{prediction.advice}</div>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button onClick={() => {setPreviewUrl(null); setPrediction(null);}} className="px-6 py-3 bg-stone-200 hover:bg-stone-300 rounded-xl font-bold transition-colors">Rescan</button>
                    <button onClick={downloadReport} className="px-6 py-3 bg-stone-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 uppercase text-[10px] md:text-xs transition-all shadow-md">
                      <FileText size={16} /> {t.download}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}  

        {activeTab === 'History' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-x-auto animate-in fade-in duration-500">
             <div className="p-6 md:p-8 border-b border-stone-100 flex justify-between items-center min-w-[500px]">
                <h3 className="font-black text-lg md:text-xl uppercase tracking-tighter">Scan Logs</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full">{history.length} SCANS</span>
             </div>
             <table className="w-full text-left min-w-[500px]">
                <thead className="bg-stone-50 border-b border-stone-100">
                   <tr>
                      <th className="p-4 md:p-6 font-black text-[10px] uppercase tracking-widest text-stone-400">Date</th>
                      <th className="p-4 md:p-6 font-black text-[10px] uppercase tracking-widest text-stone-400">Diagnosis</th>
                      <th className="p-4 md:p-6 font-black text-[10px] uppercase tracking-widest text-stone-400">Severity</th>
                      <th className="p-4 md:p-6 font-black text-[10px] uppercase tracking-widest text-stone-400">Location</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                   {history.map((item, index) => (
                     <tr key={index} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4 md:p-6 font-medium text-stone-600 text-sm">{item.date}</td>
                        <td className="p-4 md:p-6">
                           <span className={`font-black px-3 py-1 rounded-lg text-xs ${item.diagnosis === 'Healthy' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>{item.diagnosis}</span>
                           <span className="text-[10px] ml-2 text-stone-400 font-bold">{item.confidence}%</span>
                        </td>
                        <td className="p-4 md:p-6 text-[10px] text-stone-500 font-bold uppercase">{item.severity}</td>
                        <td className="p-4 md:p-6 text-[10px] text-stone-400 font-black italic">{item.ward}</td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'Advice' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className={`p-6 rounded-[2rem] border-2 ${weather.risk === 'High' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center gap-4 mb-3">
                <div className={weather.risk === 'High' ? 'text-red-600' : 'text-emerald-600'}><AlertCircle size={32} /></div>
                <div>
                  <h4 className="font-black text-base md:text-lg uppercase tracking-tight">{weather.risk === 'High' ? "High Infection Risk" : "Low Infection Risk"}</h4>
                  <p className="text-[10px] font-bold text-stone-500">Based on current {farmerData.county} humidity ({weather.hum})</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed font-medium">
                {weather.risk === 'High' 
                  ? `Urgent: High moisture detected. If your ${farmerData.variety} shows yellow spots, apply systemic fungicide (e.g., Green Cop) immediately before the next rain.`
                  : `Conditions are stable. Continue routine scouting of your ${farmerData.variety} blocks every 14 days.`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><CloudSun size={80} /></div>
                <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">April - Main Crop</span>
                <h4 className="font-black text-xl md:text-2xl mt-4 mb-2">Spraying Cycle</h4>
                <ul className="space-y-4 mt-6">
                  <li className="flex gap-3 items-start text-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-900 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">1</div>
                    <p><b>Pre-Rain Protective:</b> Apply Copper Oxychloride to prevent spore germination.</p>
                  </li>
                  <li className="flex gap-3 items-start text-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">2</div>
                    <p><b>Post-Rain Curative:</b> If Rust is visible (&gt;5%), use Tebuconazole-based sprays.</p>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Nutrition</span>
                <h4 className="font-black text-xl md:text-2xl mt-4 mb-2">Fertilizer Guide</h4>
                <p className="text-xs text-stone-500 mb-6">Optimized for <b>{farmerData.acreage} Acres</b> in {farmerData.ward}.</p>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-[10px] font-black uppercase text-stone-400">Recommended</p>
                  <p className="font-bold text-emerald-900 text-sm">NPK 17:17:17 + Zinc</p>
                  <p className="text-[10px] text-stone-500 italic mt-1">Apply 200g per tree during the long rains.</p>
                </div>
              </div>
            </div>

            <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] md:rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <div>
                <h4 className="text-lg md:text-xl font-black mb-1">Need a professional visit?</h4>
                <p className="text-stone-400 text-sm">Contact the Sub-County Agronomist for <b>{farmerData.constituency}</b>.</p>
              </div>
              <button className="bg-emerald-500 hover:bg-emerald-400 w-full md:w-auto px-8 py-4 rounded-2xl font-black uppercase text-xs transition-all">
                Call Extension Officer
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'Profile' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-900 rounded-[2rem] flex items-center justify-center text-white shadow-xl"><User size={40} /></div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-stone-900">Farmer Registration</h3>
                  <p className="text-stone-500 text-sm font-medium">Data used for national disease mapping.</p>
                </div>
              </div>
              <button onClick={handleSave} className="w-full md:w-auto px-10 py-4 bg-emerald-900 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-800 uppercase tracking-tight">Save Changes</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-stone-100 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">Farmer Name</label>
                  <input name="name" value={farmerData.name} onChange={handleInputChange} type="text" className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">Coffee Variety</label>
                  <select name="variety" value={farmerData.variety} onChange={handleInputChange} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl font-bold">
                    <option value="SL28">SL28 (Arabica)</option>
                    <option value="Ruiru 11">Ruiru 11</option>
                    <option value="Batian">Batian</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-stone-100 space-y-6">
                <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full">Regional Calibration</h4>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">County</label>
                  <select name="county" value={farmerData.county} onChange={handleInputChange} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl font-bold text-sm">
                    <option value="">Select County</option>
                    {Object.keys(kenyaData).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">Constituency</label>
                    <select name="constituency" value={farmerData.constituency} onChange={handleInputChange} disabled={!farmerData.county} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl font-bold text-sm disabled:opacity-30">
                      <option value="">Select Constituency</option>
                      {farmerData.county && Object.keys(kenyaData[farmerData.county]).map(con => <option key={con} value={con}>{con}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">Ward</label>
                    <select name="ward" value={farmerData.ward} onChange={handleInputChange} disabled={!farmerData.constituency} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl font-bold text-sm disabled:opacity-30">
                      <option value="">Select Ward</option>
                      {farmerData.constituency && kenyaData[farmerData.county][farmerData.constituency].map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;