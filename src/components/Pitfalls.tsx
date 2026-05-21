import { useI18n } from '../i18n';
import { getPlaygroundActions, scrollToPlayground } from '../context/playgroundActions';

export function Pitfalls() {
  const { t } = useI18n();
  const actions = getPlaygroundActions();

  const tryFreeze = () => {
    scrollToPlayground();
    actions?.setFreezeA(true);
  };

  const tryComplex = () => {
    scrollToPlayground();
    actions?.setModelCParams?.();
  };

  const tryScale = () => {
    scrollToPlayground();
    actions?.resetAll();
  };

  return (
    <section id="pitfalls" className="pitfalls-section">
      <div className="container wide pitfalls-wrap">
        <h2 className="pitfalls-heading">{t.pitfalls.title}</h2>
        <div className="pitfalls-band">
          <article className="card warn pitfalls-primary">
            <h3>{t.pitfalls.freezeTitle}</h3>
            <p>{t.pitfalls.freezeP1}</p>
            <button type="button" onClick={tryFreeze}>
              {t.pitfalls.tryIt}: {t.playground.freezePitfall}
            </button>
          </article>

          <div className="pitfalls-divider" role="separator" aria-hidden="true" />

          <ul className="pitfalls-faq">
            <li className="card pitfalls-faq-item">
              <strong>{t.pitfalls.scaleTitle}</strong>
              <p>{t.pitfalls.scaleBody}</p>
              <button type="button" onClick={tryScale}>
                {t.pitfalls.tryIt}
              </button>
            </li>
            <li className="card pitfalls-faq-item">
              <strong>{t.pitfalls.nepTitle}</strong>
              <p>{t.pitfalls.nepBody}</p>
            </li>
            <li className="card pitfalls-faq-item pitfalls-faq-item-wide">
              <strong>{t.pitfalls.complexTitle}</strong>
              <p>{t.pitfalls.complexBody}</p>
              <button type="button" onClick={tryComplex}>
                {t.pitfalls.tryIt}: Model C
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
