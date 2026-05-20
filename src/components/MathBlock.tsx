import katex from 'katex';

interface Props {
  tex: string;
  block?: boolean;
}

export function MathBlock({ tex, block = true }: Props) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: block,
  });
  return (
    <div
      className="formula"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
