<div align="center">

# Citewell

**Citations without the headache.**

Free · No ads · No AI

</div>

---

Citewell is a clean, fast citation generator that automatically fetches metadata from URLs, DOIs, ISBNs, and YouTube links — so you spend less time formatting and more time writing.

## ✨ Features

- **Auto-fetch metadata** — paste a link and Citewell does the research for you
- **Four citation styles** — APA 7th, MLA 9th, Chicago 17th, and Harvard
- **Four source types** — journal articles, books, websites, and YouTube videos
- **Smart form** — fields auto-populated from the source are highlighted; missing fields prompt you to fill them in
- **Switch styles instantly** — change citation format after generating without re-entering data
- **Save & copy** — save multiple citations per session and copy them individually or all at once
- **Edit fields** — go back and correct any detail before or after generating
- **No account required** — fully client-side, nothing stored on a server

## 🔍 Supported Inputs

| Input type | Example | Data source |
|---|---|---|
| DOI | `10.1038/s41586-020-2649-2` | [CrossRef](https://api.crossref.org) |
| ISBN | `978-0-14-199034-7` | [Open Library](https://openlibrary.org) / [Google Books](https://books.google.com) |
| URL | `https://www.bbc.com/news/…` | [Microlink](https://microlink.io) |
| YouTube link | `https://youtu.be/…` | [noembed](https://noembed.com) |
| Book title | `Sapiens` | [Google Books](https://books.google.com) |

## 📚 Citation Styles

- **APA 7th edition** — American Psychological Association
- **MLA 9th edition** — Modern Language Association
- **Chicago 17th edition** — University of Chicago Press
- **Harvard** — author–date referencing

## 🛠 Tech Stack

| | |
|---|---|
| Framework | [React 19](https://react.dev) |
| Bundler | [Vite](https://vitejs.dev) |
| Fonts | Playfair Display · Lora · DM Sans (Google Fonts) |
| Styling | Inline styles — no CSS framework |
| Analytics | Google Analytics (anonymous page views) |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## 🗂 Project Structure

```
src/
├── main.jsx        # React entry point
├── App.jsx         # Root component (renders Citewell)
├── citewell.jsx    # Full application — citation logic, API fetching, UI
├── index.css       # Global reset/base styles
└── App.css         # Unused Vite scaffold (safe to ignore)
```

## 📖 How It Works

1. **Paste** a URL, DOI, ISBN, YouTube link, or book title into the search bar
2. Citewell **detects the input type** and queries the appropriate API
3. A **pre-filled form** appears showing which fields were found (green) and which need your input (amber)
4. Select your **citation style** and click **Format citation**
5. **Copy** the result to your clipboard or **save** it to the session list

## 📄 License

This project is open source. See the repository for details.
