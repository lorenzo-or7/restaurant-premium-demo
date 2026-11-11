import { manifesto } from '../content/copy'
import { Img, SectionIndex } from '../components/ui'
import { FadeUp, ImageReveal, Parallax, ScrollWords } from '../components/motion'

const roman = ['i', 'ii', 'iii']

export function Manifesto() {
  return (
    <section id="manifesto" className="manifesto panel" aria-labelledby="manifesto-title">
      <div className="manifesto__head">
        <SectionIndex index={manifesto.index} label={manifesto.label} />
        <h2 id="manifesto-title" className="visually-hidden">
          Manifesto da casa
        </h2>
      </div>

      <div className="manifesto__grid">
        <ScrollWords text={manifesto.statement} className="manifesto__statement" />

        <div className="manifesto__media manifesto__media--a">
          <ImageReveal from="bottom">
            <Parallax distance={40}>
              <Img name="citrus" sizes="(min-width: 1024px) 28vw, 60vw" position="50% 55%" />
            </Parallax>
          </ImageReveal>
        </div>

        <div className="manifesto__media manifesto__media--b">
          <ImageReveal from="left" delay={0.1}>
            <Img name="plums" sizes="(min-width: 1024px) 20vw, 40vw" />
          </ImageReveal>
        </div>

        <ol className="manifesto__pillars">
          {manifesto.pillars.map((p, i) => (
            <FadeUp as="li" key={p.title} delay={i * 0.08} className="pillar">
              <span className="pillar__num serif-italic" aria-hidden="true">
                {roman[i]}.
              </span>
              <h3 className="pillar__title display">{p.title}</h3>
              <p className="pillar__text muted">{p.text}</p>
            </FadeUp>
          ))}
        </ol>
      </div>
    </section>
  )
}
