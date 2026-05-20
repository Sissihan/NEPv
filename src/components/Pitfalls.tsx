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
    <section id="pitfalls">
      <div className="container">
        <h2>{t.pitfalls.title}</h2>
        <div className="card warn">
          <h3>{t.pitfalls.freezeTitle}</h3>
          <p>{t.pitfalls.freezeP1}</p>
          <button type="button" onClick={tryFreeze}>
            {t.pitfalls.tryIt}: {t.playground.freezePitfall}
          </button>
        </div>

        <ul className="pitfalls-faq">
          <li className="card">
            <strong>{t.pitfalls.scaleTitle}</strong>
            <p>{t.pitfalls.scaleBody}</p>
            <button type="button" onClick={tryScale}>
              {t.pitfalls.tryIt}
            </button>
          </li>
          <li className="card">
            <strong>{t.pitfalls.nepTitle}</strong>
            <p>{t.pitfalls.nepBody}</p>
          </li>
          <li className="card">
            <strong>{t.pitfalls.complexTitle}</strong>
            <p>{t.pitfalls.complexBody}</p>
            <button type="button" onClick={tryComplex}>
              {t.pitfalls.tryIt}: Model C
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
}
