# Idées pour TabulaPix

*[English](ROADMAP.md) · **Français***

Pistes envisagées pour de futures versions, avec ce qui a déjà été décidé. Rien n'est encore programmé.

---

## 1. Envoyer une agence à un collègue (copier / coller)

**Besoin.** Paul a ajouté l'agence Magnum ; Alice ne l'a pas. Il veut la lui envoyer sans compte, sans serveur.

**Principe retenu.**
- Dans le crayon d'une agence, un bouton **Partager** copie un court code (ex. `TabulaPix:agence:eyJu…`) qui contient l'agence : nom, adresse, modèle, étapes d'encodage ou champ à remplir.
- Paul colle ce code dans Slack, Teams ou un e-mail. C'est la messagerie de la rédaction qui sert de transport : TabulaPix ne fait toujours aucune requête réseau.
- Chez Alice, **+ Ajouter une agence** reconnaît le code (presse-papiers ou collage) et propose « Ajouter Magnum ? ». L'agence est vérifiée comme une agence ajoutée à la main ; si elle remplit un champ, Chrome demande l'autorisation pour son site.

**Prolongements.**
- Partager un **dossier entier** (ex. « People » et ses agences).
- Import en mode **« ajouter »** plutôt que « remplacer » : récupérer les agences et dossiers d'un fichier sans perdre les siens.

**Écarté.** La détection automatique des TabulaPix du même réseau : impossible sans serveur (une extension ne voit pas le réseau local), et contraire à la promesse « aucun serveur, aucune requête réseau ». Pour toute une rédaction, une configuration poussée par le service informatique (Chrome Entreprise) reste possible.

---

## 2. Coffre chiffré des identifiants d'agence (facultatif)

**Besoin.** Dans beaucoup de services photo, les identifiants des comptes d'agence (souvent partagés) circulent **en clair** dans un tableur ou un document du Drive, accessible à tout le service. Un coffre chiffré dans TabulaPix serait un vrai progrès, à condition de régler aussi le **partage** au sein de l'équipe.

**Première version envisagée (sans connexion automatique).**
- Dans le crayon d'une agence, une section facultative **Identifiants** (identifiant, mot de passe).
- Dans la liste : **Copier l'identifiant** / **Copier le mot de passe** ; le presse-papiers est vidé au bout de 30 secondes. Aucun remplissage de page dans un premier temps.
- **Chiffrement** : AES-GCM (WebCrypto, intégré à Chrome), clé dérivée d'une **phrase secrète** avec PBKDF2-SHA-256 (600 000 itérations ou plus) et un sel aléatoire. Seul le texte chiffré est enregistré ; la phrase secrète ne l'est jamais.
- **Déverrouillage** une fois par session, verrouillage automatique (ex. 15 minutes, ou à la fermeture de Chrome).
- **Coffre d'équipe** : le responsable exporte les identifiants dans un fichier **toujours chiffré** avec une phrase secrète d'équipe, transmise à part (jamais avec le fichier). Chaque collègue l'importe et le déverrouille. Le fichier de configuration habituel ne contient jamais d'identifiants.
- Aucune autorisation supplémentaire, rien ne part sur le réseau.

**Limites à annoncer clairement.**
- Phrase secrète oubliée : coffre illisible, sans récupération possible.
- Quiconque a le fichier **et** la phrase a tous les accès (comme le tableur aujourd'hui — mais le fichier seul ne suffit plus). Au départ d'un membre de l'équipe : changer la phrase et les mots de passe.
- TabulaPix n'est pas audité comme un gestionnaire de mots de passe professionnel.

**À prévoir.**
- Déclarer au Chrome Web Store la gestion d'« informations d'authentification » ; adapter la fiche (« aucun mot de passe enregistré **en clair**, ni transmis ») et la politique de confidentialité.
- Audit de sécurité spécifique avant publication ; version dédiée (ex. 3.6.0).

**Alternative éprouvée à mentionner aux utilisateurs.** KeePassXC (gratuit, audité) avec un fichier `.kdbx` sur le Drive du service : même principe, si la rédaction accepte d'installer un logiciel.
