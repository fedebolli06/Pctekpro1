// Configurazione Instagram Feed
// Compila solo se necessario. Di default il sito usa l'endpoint PHP /api/instagram.php.
// SE il tuo hosting non supporta PHP, puoi esporre temporaneamente un access token (sconsigliato)
// impostando "token" e, opzionalmente, "userId".

window.PCTEK_INSTAGRAM = window.PCTEK_INSTAGRAM || {
  // Per GitHub Pages (senza backend), il feed statico viene aggiornato da GitHub Actions.
  // L'endpoint predefinito punta al JSON generato dallo script pianificato.
  endpoint: 'assets/instagram-feed.json',
  // token: '', // IG Basic Display long-lived token (solo se vuoi chiamare direttamente l'API dal client - sconsigliato)
  // userId: '', // opzionale se usi token client
  count: 6
};
