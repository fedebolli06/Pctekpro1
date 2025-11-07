Metti qui le foto degli interventi (JPG/PNG/WebP).

Come aggiornare la galleria:
- Aggiungi le immagini in questa cartella (es. assets/interventi/pulizia1.jpg)
- Apri il file assets/interventi.json e aggiungi una riga con:
  {
    "src": "assets/interventi/nome-file.jpg",
    "thumb": "assets/interventi/nome-file.jpg",  // opzionale: miniatura
    "title": "Titolo breve dell'intervento",
    "alt": "Descrizione accessibile della foto"
  }

Suggerimenti:
- Comprimere le foto (1200-1600px lato lungo) per caricamenti rapidi.
- Se vuoi, crea anche versioni "thumb" più leggere per l'anteprima.
