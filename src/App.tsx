import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Topbar from './components/Topbar'
import Hero from './modules/hero/Hero'
import About from './modules/about/About'
import Projects from './modules/projects/Projects'
import Experience from './modules/experience/Experience'
import Contact from './modules/contact/Contact'

import LangToggle from './components/LangToggle'

function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <main className="min-h-screen px-6 pt-24 pb-16 max-w-4xl mx-auto">
        <Routes>
          <Route path="/"           element={<Hero />} />
          <Route path="/about"      element={<About />} />
          <Route path="/projects"   element={<Projects />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact"    element={<Contact />} />
        </Routes>
      </main>
      <LangToggle />
    </BrowserRouter>
  )
}
export default App