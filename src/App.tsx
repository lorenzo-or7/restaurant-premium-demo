import { MotionConfig } from 'motion/react'
import { Navbar } from './sections/Navbar'
import { Hero } from './sections/Hero'
import { Manifesto } from './sections/Manifesto'
import { Experience } from './sections/Experience'
import { Menu } from './sections/Menu'
import { Gallery } from './sections/Gallery'
import { Testimonials } from './sections/Testimonials'
import { Reservation } from './sections/Reservation'
import { Location } from './sections/Location'
import { FinalCta, Footer } from './sections/Closing'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo" className="page" tabIndex={-1}>
        <Hero />
        <Manifesto />
        <Experience />
        <Menu />
        <Gallery />
        <Testimonials />
        <Reservation />
        <Location />
        <FinalCta />
        <Footer />
      </main>
    </MotionConfig>
  )
}
