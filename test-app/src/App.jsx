import { useState, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Palette, Layout, Type, Grid3X3, Download, Settings, Eye, Layers } from 'lucide-react'
import './design-system/tokens.css'
import './App.css'

// Import pages
import Dashboard from './pages/Dashboard'
import ColorTokens from './pages/ColorTokens'
import Typography from './pages/Typography'
import Components from './pages/Components'
import Spacing from './pages/Spacing'
import Export from './pages/Export'

// Theme context
export const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

// Available themes from tokens.json
const themes = [
  { name: 'Advisor SEM/Compare Coverage', slug: 'advisor-sem-compare-coverage', class: 'theme-advisor-sem-compare-coverage' },
  { name: 'ForbesMedia - SEO', slug: 'forbes-media-seo', class: 'theme-forbes-media-seo' },
  { name: 'Health - SEM', slug: 'health-sem', class: 'theme-health-sem' },
  { name: 'Home - SEM', slug: 'home-sem', class: 'theme-home-sem' },
  { name: 'LLM', slug: 'llm', class: 'theme-llm' }
]

function Sidebar() {
  const { currentTheme, setCurrentTheme } = useTheme()
  
  const navItems = [
    { to: '/', icon: Eye, label: 'Dashboard' },
    { to: '/colors', icon: Palette, label: 'Colors' },
    { to: '/typography', icon: Type, label: 'Typography' },
    { to: '/spacing', icon: Grid3X3, label: 'Spacing & Grid' },
    { to: '/components', icon: Layers, label: 'Components' },
    { to: '/export', icon: Download, label: 'Export' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Settings size={24} />
          <span>Design System</span>
        </div>
      </div>
      
      <div className="theme-selector">
        <label>Active Theme</label>
        <select 
          value={currentTheme.slug} 
          onChange={(e) => {
            const theme = themes.find(t => t.slug === e.target.value)
            setCurrentTheme(theme)
          }}
        >
          {themes.map(theme => (
            <option key={theme.slug} value={theme.slug}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to} 
            to={to} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="version-badge">v1.0.0</div>
      </div>
    </aside>
  )
}

function App() {
  const [currentTheme, setCurrentTheme] = useState(themes[0])

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
      <BrowserRouter>
        <div className={`app-container ${currentTheme.class}`}>
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/colors" element={<ColorTokens />} />
              <Route path="/typography" element={<Typography />} />
              <Route path="/spacing" element={<Spacing />} />
              <Route path="/components" element={<Components />} />
              <Route path="/export" element={<Export />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}

export default App
