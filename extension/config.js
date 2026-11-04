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
 *            Sans aucun marqueur (et sans « fill »), la page est simplement
 *            ouverte et les mots-clés sont copiés dans le presse-papiers.
 *
 * Champs avancés (pour les sites qui « emballent » la recherche dans l'URL) :
 *   payload  texte modèle (souvent du JSON) contenant {q}. Ici {q} est inséré
 *            tel quel, avec juste l'échappement JSON des guillemets.
 *   encode   liste d'étapes appliquées au payload, dans l'ordre :
 *              "uri"    → encodage URL (encodeURIComponent)
 *              "hex"    → hexadécimal majuscule (UTF-8)
 *              "gzip"   → compression gzip (faite localement, sans réseau)
 *              "base64" → base64
 *
 * Pour les sites dont l'adresse ne peut pas contenir la recherche :
 *   fill     { input: "sélecteur CSS du champ", submit: "sélecteur CSS du bouton" }
 *            L'extension ouvre la page, tape les mots-clés dans le champ puis
 *            clique sur le bouton (« submit » est facultatif : sinon, Entrée).
 *            « delay » (facultatif, en millisecondes, 300 par défaut) : pause
 *            avant de taper puis avant de cliquer, pour les sites lents.
 *            ⚠ Le domaine doit aussi figurer dans "host_permissions" du
 *            fichier manifest.json, sinon Chrome refuse de remplir le champ.
 *            Pour trouver un sélecteur : clic droit sur le champ → Inspecter →
 *            clic droit sur la ligne surlignée → Copier → Copier le sélecteur.
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
    url: "https://mercury.bloomberg.com/search",
    fill: {
      input: "form.searchbar input.react-autosuggest__input",
      submit: ".search-go-button",
      delay: 1200
    }
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
    id: "adobe-stock",
    name: "Adobe Stock",
    url: "https://stock.adobe.com/fr/search?k={q}"
  },
  {
    id: "abacapress",
    name: "Abacapress",
    url: "https://search.abacapress.com/recherche",
    fill: {
      input: "#fullTextInput",
      submit: "#simpleSearchForm button[type=submit]"
    }
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
    url: "https://lesechosleparisien.pixpalace.com/home",
    fill: {
      input: "#search-field",
      submit: "#pw_search_form input[type=submit]"
    }
  },
  {
    id: "maxppp",
    name: "MaxPPP",
    url: "https://maxppp.com/search?p_p_id=listenersearchresults_WAR_searchportlet&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_listenersearchresults_WAR_searchportlet_search={q}&_listenersearchresults_WAR_searchportlet_match=a&_listenersearchresults_WAR_searchportlet_sort=d&_listenersearchresults_WAR_searchportlet_struts.portlet.action=%2Fview%2FdisplaySearchResults"
    // Si cette adresse ne marche pas, remplacez la ligne « url » ci-dessus par :
    // url: "https://maxppp.com/search",
    // fill: { input: "#search" }
  }
];
