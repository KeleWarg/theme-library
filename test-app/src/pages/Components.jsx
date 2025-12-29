import { useState } from 'react'
import { useTheme } from '../App'
import { Check, AlertCircle, Info, AlertTriangle, ChevronDown, Search, User, Mail, Lock } from 'lucide-react'

function ComponentSection({ title, children }) {
  return (
    <div className="component-section">
      <h3>{title}</h3>
      <div className="component-showcase">
        {children}
      </div>
    </div>
  )
}

function ButtonShowcase() {
  return (
    <ComponentSection title="Buttons">
      <div className="button-variants">
        <div className="variant-group">
          <h4>Primary</h4>
          <div className="button-row">
            <button className="btn-primary">Default</button>
            <button className="btn-primary" data-state="hover">Hover</button>
            <button className="btn-primary" disabled>Disabled</button>
          </div>
        </div>
        
        <div className="variant-group">
          <h4>Secondary</h4>
          <div className="button-row">
            <button className="btn-secondary">Default</button>
            <button className="btn-secondary" data-state="hover">Hover</button>
            <button className="btn-secondary" disabled>Disabled</button>
          </div>
        </div>
        
        <div className="variant-group">
          <h4>Ghost</h4>
          <div className="button-row">
            <button className="btn-ghost">Default</button>
            <button className="btn-ghost" data-state="hover">Hover</button>
            <button className="btn-ghost" disabled>Disabled</button>
          </div>
        </div>

        <div className="variant-group">
          <h4>Sizes</h4>
          <div className="button-row">
            <button className="btn-primary btn-sm">Small</button>
            <button className="btn-primary">Medium</button>
            <button className="btn-primary btn-lg">Large</button>
          </div>
        </div>
      </div>
    </ComponentSection>
  )
}

function CardShowcase() {
  return (
    <ComponentSection title="Cards">
      <div className="cards-grid">
        <div className="card">
          <div className="card-header">
            <h4>Basic Card</h4>
          </div>
          <div className="card-body">
            <p>This is a basic card component using design system tokens for colors, spacing, and typography.</p>
          </div>
        </div>
        
        <div className="card card-elevated">
          <div className="card-header">
            <h4>Elevated Card</h4>
          </div>
          <div className="card-body">
            <p>An elevated card with additional shadow for visual hierarchy.</p>
          </div>
          <div className="card-footer">
            <button className="btn-ghost">Cancel</button>
            <button className="btn-primary">Confirm</button>
          </div>
        </div>
        
        <div className="card card-outlined">
          <div className="card-header">
            <span className="card-badge">New</span>
            <h4>Featured Card</h4>
          </div>
          <div className="card-body">
            <p>A card with accent colors and featured styling.</p>
          </div>
        </div>
      </div>
    </ComponentSection>
  )
}

function FormShowcase() {
  const [selected, setSelected] = useState('option1')
  const [checked, setChecked] = useState(true)

  return (
    <ComponentSection title="Form Elements">
      <div className="form-showcase">
        <div className="form-group">
          <label>Text Input</label>
          <div className="input-wrapper">
            <Mail size={18} />
            <input type="email" placeholder="Enter your email" />
          </div>
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock size={18} />
            <input type="password" placeholder="Enter password" />
          </div>
        </div>
        
        <div className="form-group">
          <label>Select</label>
          <div className="select-wrapper">
            <select>
              <option>Choose an option</option>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
            <ChevronDown size={18} />
          </div>
        </div>
        
        <div className="form-group">
          <label>Search</label>
          <div className="input-wrapper">
            <Search size={18} />
            <input type="search" placeholder="Search..." />
          </div>
        </div>
        
        <div className="form-group">
          <label>Radio Buttons</label>
          <div className="radio-group">
            {['option1', 'option2', 'option3'].map(opt => (
              <label key={opt} className="radio-label">
                <input 
                  type="radio" 
                  name="radio-demo" 
                  value={opt}
                  checked={selected === opt}
                  onChange={(e) => setSelected(e.target.value)}
                />
                <span>{opt.replace('option', 'Option ')}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span>Checkbox example</span>
          </label>
        </div>
      </div>
    </ComponentSection>
  )
}

function AlertShowcase() {
  return (
    <ComponentSection title="Alerts & Feedback">
      <div className="alerts-stack">
        <div className="alert alert-success">
          <Check size={20} />
          <div>
            <strong>Success!</strong>
            <span>Your changes have been saved successfully.</span>
          </div>
        </div>
        
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>
            <strong>Error</strong>
            <span>Something went wrong. Please try again.</span>
          </div>
        </div>
        
        <div className="alert alert-warning">
          <AlertTriangle size={20} />
          <div>
            <strong>Warning</strong>
            <span>Please review your information before continuing.</span>
          </div>
        </div>
        
        <div className="alert alert-info">
          <Info size={20} />
          <div>
            <strong>Information</strong>
            <span>Here's some helpful context for your task.</span>
          </div>
        </div>
      </div>
    </ComponentSection>
  )
}

function BadgeShowcase() {
  return (
    <ComponentSection title="Badges & Tags">
      <div className="badges-row">
        <span className="badge badge-primary">Primary</span>
        <span className="badge badge-secondary">Secondary</span>
        <span className="badge badge-success">Success</span>
        <span className="badge badge-warning">Warning</span>
        <span className="badge badge-error">Error</span>
        <span className="badge badge-neutral">Neutral</span>
      </div>
      
      <div className="badges-row" style={{ marginTop: '16px' }}>
        <span className="badge badge-outline">Outline</span>
        <span className="badge badge-pill">Pill Badge</span>
        <span className="badge badge-dot">
          <span className="dot" />
          With Dot
        </span>
      </div>
    </ComponentSection>
  )
}

function TableShowcase() {
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Pending' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive' },
  ]

  return (
    <ComponentSection title="Tables">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar">
                      <User size={16} />
                    </div>
                    {row.name}
                  </div>
                </td>
                <td>{row.email}</td>
                <td>
                  <span className={`badge badge-${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </td>
                <td>
                  <button className="btn-ghost btn-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComponentSection>
  )
}

export default function Components() {
  const { currentTheme } = useTheme()

  return (
    <div className="page components-page">
      <header className="page-header">
        <h1>Component Gallery</h1>
        <p className="subtitle">
          Live preview of components using <strong>{currentTheme.name}</strong> theme
        </p>
      </header>

      <div className="components-container">
        <ButtonShowcase />
        <CardShowcase />
        <FormShowcase />
        <AlertShowcase />
        <BadgeShowcase />
        <TableShowcase />
      </div>
    </div>
  )
}
