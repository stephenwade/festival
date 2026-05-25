import spinnerCssHref from './spinner.css?url';

export function Spinner() {
  return (
    <>
      <link rel="stylesheet" precedence="any" href={spinnerCssHref} />
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    </>
  );
}
