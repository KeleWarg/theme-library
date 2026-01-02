import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Components from './pages/Components'
import ComponentDetail from './pages/ComponentDetail'
import Foundations from './pages/Foundations'
import Themes from './pages/Themes'
import ThemeEditor from './pages/ThemeEditor'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout pageTitle="Dashboard"><Dashboard /></Layout>
        } />
        <Route path="/components" element={
          <Layout pageTitle="Components"><Components /></Layout>
        } />
        <Route path="/components/:slug" element={
          <Layout pageTitle="Component"><ComponentDetail /></Layout>
        } />
        <Route path="/foundations" element={
          <Layout pageTitle="Foundations"><Foundations /></Layout>
        } />
        <Route path="/themes" element={
          <Layout pageTitle="Themes"><Themes /></Layout>
        } />
        <Route path="/themes/:id" element={
          <ThemeEditor />
        } />
        <Route path="/settings" element={
          <Layout pageTitle="Settings"><Settings /></Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
