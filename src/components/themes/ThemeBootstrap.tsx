// Inlined script that runs before React hydration so the theme is correct
// on first paint (no FOUC). Reads localStorage 'propflow-theme' first;
// falls back to prefers-color-scheme dark → midnight-pro, light → slate-pro.
export function ThemeBootstrap() {
  const code = `
(function(){
  try {
    var saved = localStorage.getItem('propflow-theme');
    var theme;
    if (saved) {
      theme = saved;
    } else {
      var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = dark ? 'midnight-pro' : 'slate-pro';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'midnight-pro');
  }
})();
  `.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
