import { credibility, testimonialPlaceholders, testimonials } from '../content/copy'
import { SectionIndex } from '../components/ui'
import { FadeUp, LineReveal } from '../components/motion'

export function Testimonials() {
  const isPlaceholder = testimonials.length === 0
  const list = isPlaceholder ? testimonialPlaceholders : testimonials
  const [featured, ...rest] = list

  return (
    <section className="voices panel panel--outline" aria-labelledby="voices-title">
      <header className="voices__head">
        <SectionIndex index={credibility.index} label={credibility.label} />
        <LineReveal
          id="voices-title"
          className="voices__title display"
          label={credibility.title}
          lines={['Palavras de quem', <em key="s">sentou à mesa</em>]}
        />
        {isPlaceholder && (
          <p className="voices__note muted">
            <span className="demo-flag">Espaço reservado</span>
            Esta área recebe somente avaliações reais e autorizadas pelo autor. Nenhum depoimento aqui foi inventado.
          </p>
        )}
      </header>

      <div className="voices__body">
        {featured && (
          <FadeUp className={`quote quote--featured ${isPlaceholder ? 'is-placeholder' : ''}`}>
            <figure>
              <span className="quote__mark display" aria-hidden="true">
                “
              </span>
              <blockquote className="quote__text">{featured.quote}</blockquote>
              <figcaption className="quote__by">
                <span className="label">{featured.author}</span>
                <span className="muted">{featured.source}</span>
              </figcaption>
            </figure>
          </FadeUp>
        )}

        <div className="voices__rest">
          {rest.map((t, i) => (
            <FadeUp key={i} delay={0.08 * (i + 1)} className={`quote ${isPlaceholder ? 'is-placeholder' : ''}`}>
              <figure>
                <blockquote className="quote__text">{t.quote}</blockquote>
                <figcaption className="quote__by">
                  <span className="label">{t.author}</span>
                  <span className="muted">{t.source}</span>
                </figcaption>
              </figure>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
