/*
 * Wire Sweep — configuration des agences
 * ======================================
 *
 * Pour ajouter, retirer ou modifier une agence, éditez uniquement ce fichier,
 * puis rechargez l'extension (chrome://extensions → bouton ↻ de Wire Sweep).
 *
 * Champs d'une agence :
 *   id       identifiant unique, sans espace (sert à mémoriser la case cochée)
 *   name     nom affiché dans la popup
 *   url      adresse de recherche. Marqueurs possibles :
 *              {q}        → les mots-clés, encodés pour une URL (cas le plus courant)
 *              {payload}  → le résultat du champ « payload » ci-dessous
 *            Sans aucun marqueur, la page est simplement ouverte et les
 *            mots-clés sont copiés dans le presse-papiers (il suffit de coller).
 *
 * Champs avancés (pour les sites qui « emballent » la recherche dans l'URL) :
 *   payload  texte modèle (souvent du JSON) contenant {q}. Ici {q} est inséré
 *            tel quel, avec juste l'échappement JSON des guillemets.
 *   encode   liste d'étapes appliquées au payload, dans l'ordre :
 *              "uri"    → encodage URL (encodeURIComponent)
 *              "hex"    → hexadécimal majuscule (UTF-8)
 *              "gzip"   → compression gzip (faite localement, sans réseau)
 *              "base64" → base64
 */
const AGENCIES = [
  {
    id: "reuters",
    name: "Reuters",
    url: "https://www.reutersconnect.com/all?media-types=pic&search=all%3A{q}"
  },
  {
    id: "afp",
    name: "AFP",
    url: "https://news.afp.com/#/c/main/search/photos?search={payload}",
    payload: '{"languages":["fr"],"sortOrder":"desc","searchTab":"photos","keywords":{"value":"{q}","lang":"fr"}}',
    encode: ["uri", "gzip", "base64", "uri"]
  },
  {
    id: "bloomberg",
    name: "Bloomberg",
    url: "https://mercury.bloomberg.com/search"
  },
  {
    id: "sipa",
    name: "Sipa",
    url: "https://www.sipa.com/search/fr/1/0x{payload}",
    payload: '{"searchbar":"{q}","is_searchandgo":"false","ordermode":"2","orderby":"1","folding":"0"}',
    encode: ["hex"]
  },
  {
    id: "getty-creative",
    name: "Getty Creative",
    url: "https://www.gettyimages.fr/search/2/image-film?agreements=pa%3A243515&family=creative&phrase={q}&sort=best&phraseprocessing=default&excludenudity=false&suppressfamilycorrection=true"
  },
  {
    id: "getty-actu",
    name: "Getty Actu",
    url: "https://www.gettyimages.fr/search/2/image?agreements=pa%3A243515&family=editorial&phrase={q}&sort=best&phraseprocessing=default&groupbyevent=false"
  },
  {
    id: "shutterstock",
    name: "Shutterstock",
    url: "https://www.shutterstock.com/fr/search/{q}?image_type=photo"
  },
  {
    id: "abacapress",
    name: "Abacapress",
    url: "https://search.abacapress.com/recherche"
  },
  {
    id: "rea",
    name: "Rea",
    url: "https://search.reaphoto.com/search/fr/1/0x{payload}",
    payload: '{"searchbar":"{q}","folding":"0"}',
    encode: ["hex"]
  },
  {
    id: "pixpalace",
    name: "Pixpalace",
    url: "https://lesechosleparisien.pixpalace.com/home"
  },
  {
    id: "maxppp",
    name: "MaxPPP",
    url: "https://maxppp.com/search#1"
  }
];
