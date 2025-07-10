function normalizeArabic(str) {
  return str
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED]/g, '')
    .replace(/[\u0670\u0640]/g, '')
    .replace(/\u0627\u0654/g, 'أ')
    .replace(/\u0627\u0655/g, 'إ')
    .replace(/ٱ/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim();
}

  function handleSearch(event) {
    event.preventDefault();
    const query = document.getElementById("searchInput").value.trim();
    if (query) {
      window.location.href = `?q=${encodeURIComponent(query)}`;
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const verseParam = urlParams.get("verse");
  const viewParam = urlParams.get("view");
  const searchQuery = urlParams.get("q")?.toLowerCase();
  const content = document.getElementById("content");
  const arabicURL = `/quran/assets/data/quran.txt?v=${Date.now()}`;
  const englishURL = "/quran/assets/data/en.hilali.txt";
  const surahNamesURL = "/quran/assets/data/chapter.names.txt";
  const tafsirURL = `/quran/assets/data/tafsir.saadi.txt?v=${Date.now()}`;
  const saadiURL = "/quran/assets/data/saadi.translation.txt";
  const quranSimpleURL = `/quran/assets/data/quran-simple-clean.txt?v=${Date.now()}`;

  if (searchQuery) {
    document.getElementById("searchInput").value = searchQuery;
  }

content.innerHTML = `
  <div class="text-center py-5">
    <div class="mx-auto mb-3">
      <div class="spinner-border text-primary" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
  </div>`;

  Promise.all([
    fetch(arabicURL).then(res => res.text()),
    fetch(quranSimpleURL).then(res => res.text()),
    fetch(englishURL).then(res => res.text()),
    fetch(surahNamesURL).then(res => res.text()),
    fetch(tafsirURL).then(res => res.text()),
    fetch(saadiURL).then(res => res.text())
  ])
    .then(([arabicText, quranSimpleText, englishText, surahNamesText, tafsirText, saadiText]) => {
      const parseVerses = (text) => {
        return text.trim().split("\n").map(line => {
          const [chapter, verse, ...rest] = line.split("|");
          return {
            key: `${chapter}|${verse}`,
            chapter: parseInt(chapter),
            verse: parseInt(verse),
            text: rest.join("|").trim()
          };
        });
      };

      const arabicVerses = parseVerses(arabicText);
      const quranSimpleVerses = parseVerses(quranSimpleText);
      const englishVerses = parseVerses(englishText);
      const saadiVerses = parseVerses(saadiText);

  const tafsirMap = tafsirText.trim().split("\n").reduce((acc, line) => {
    if (!line.includes('|')) return acc;
    const [chapter, verse, ...rest] = line.split("|");
    if (!chapter || !verse || rest.length === 0) return acc;
    const key = `${chapter.trim()}|${verse.trim()}`;
    acc[key] = rest.join("|").trim();
    return acc;
  }, {});

const isSimpleArabic = localStorage.getItem("arabic_mode") === "simple";
const selectedArabicVerses = isSimpleArabic ? quranSimpleVerses : arabicVerses;
const verses = selectedArabicVerses.map(ar => {
const en = englishVerses.find(e => e.key === ar.key);
const saadi = saadiVerses.find(s => s.key === ar.key);
const tafsir = tafsirMap[ar.key] || "";

let arabicText = ar.text;
let basmalah = "";
const basmalahPatterns = [
  "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ",
  "بسم الله الرحمن الرحيم"
];

if (ar.chapter !== 1 && ar.chapter !== 9) {
  for (const pattern of basmalahPatterns) {
    if (arabicText.startsWith(pattern)) {
      basmalah = pattern;
      arabicText = arabicText.slice(pattern.length).trim();
      break;
    }
  }
}
  return {
    chapter: ar.chapter,
    verse: ar.verse,
    arabic: arabicText,
    english: en ? en.text : "(No translation)",
    saadi: saadi ? saadi.text : "(No Saadi translation)",
    tafsir: tafsir,
    basmalah: basmalah
  };
});

const surahNames = surahNamesText.trim().split('\n').reduce((acc, line) => {
  const [num, translit, english, type = '', arabic = ''] = line.split('|');
  acc[parseInt(num)] = {
    transliteration: translit,
    english,
    type: type.trim(),
    arabic: arabic.trim()
  };
  return acc;
}, {});

const highlight = (text, keyword) => {
  if (!keyword) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

const filterType = localStorage.getItem("quran_filter_type") || "all";

const urlParams = new URLSearchParams(window.location.search);
const viewParam = urlParams.get("view");
const authorParam = urlParams.get("author");
const langParam = urlParams.get("lang");
const verseParam = urlParams.get("verse");
const authorTitles = {
  kathir: "Tafsir Ibn Kathir",
  saadi: "Tafsir As-Sa'di"
};
const titleParam = authorTitles[authorParam] || "Tafsir";
const juzRanges = [
  { start: "1:1", end: "2:141", info: "1:1-7 – 2:1-141" },
  { start: "2:142", end: "2:252", info: "2:142 – 2:252" },
  { start: "2:253", end: "3:92", info: "2:253-286 – 3:1-92" },
  { start: "3:93", end: "4:23", info: "3:93-200 – 4:1-23" },
  { start: "4:24", end: "4:147", info: "4:24 – 4:147" },
  { start: "4:148", end: "5:81", info: "4:148-176 – 5:1-81" },
  { start: "5:82", end: "6:110", info: "5:82-120 – 6:1-110" },
  { start: "6:111", end: "7:87", info: "6:111-165 – 7:1-87" },
  { start: "7:88", end: "8:40", info: "7:88-206 – 8:1-40" },
  { start: "8:41", end: "9:92", info: "8:41-75 – 9:1-92" },
  { start: "9:93", end: "11:5", info: "9:93-129 , 10:1-109 , 11:1-5" },
  { start: "11:6", end: "12:52", info: "11:6-123 – 12:1-52" },
  { start: "12:53", end: "14:52", info: "12:53 , 13:1-43 , 14:1-52" },
  { start: "15:1", end: "16:128", info: "15:1-99 – 16:1-128" },
  { start: "17:1", end: "18:74", info: "17:1-111 – 18:1-74" },
  { start: "18:75", end: "20:135", info: "18:75-110 , 19:1-98 , 20:1-135" },
  { start: "21:1", end: "22:78", info: "21:1-112 – 22:1-78" },
  { start: "23:1", end: "25:20", info: "23:1-118 , 24:1-64 , 25:1-20" },
  { start: "25:21", end: "27:55", info: "25:21-77 , 26:1-227 , 27:1-55" },
  { start: "27:56", end: "29:45", info: "27:56-93 , 28:1-88 , 29:1-45" },
  { start: "29:46", end: "33:30", info: "29:46-69 , 30:1-60 , 31:1-34 , 32:1-30 , 33:1-30" },
  { start: "33:31", end: "36:27", info: "33:31-73 , 34:1-54 , 35:1-45 , 36:1-27" },
  { start: "36:28", end: "39:31", info: "36:28-83 , 37:1-182 , 38:1-88 , 39:1-31" },
  { start: "39:32", end: "41:46", info: "39:32-75 , 40:1-85 , 41:1-46" },
  { start: "41:47", end: "45:37", info: "41:47-54 , 42:1-53 , 43:1-89 , 44:1-59 , 45:1-37" },
  { start: "46:1", end: "51:30", info: "46:1-35 , 47:1-38 , 48:1-29 , 49:1-18 , 50:1-45 , 51:1-30" },
  { start: "51:31", end: "57:29", info: "51:31-60 , 52:1-49 , 53:1-62 , 54:1-55 , 55:1-78 , 56:1-96 , 57:1-29" },
  { start: "58:1", end: "66:12", info: "58:1-22 , 59:1-24 , 60:1-13 , 61:1-14 , 62:1-11 , 63:1-11 , 64:1-18 , 65:1-12 , 66:1-12" },
  { start: "67:1", end: "77:50", info: "67:1-30 , 68:1-52 , 69:1-52 , 70:1-44 , 71:1-28 , 72:1-28 , 73:1-20 , 74:1-56 , 75:1-40 , 76:1-31 , 77:1-50" },
  { start: "78:1", end: "114:6", info: "78:1-40 , 79:1-46 , 80:1-42 , 81:1-29 , 82:1-19 , 83:1-36 , 84:1-25 , 85:1-22 , 86:1-17 , 87:1-19 , 88:1-26 , 89:1-30 , 90:1-20 , 91:1-15 , 92:1-21 , 93:1-11 , 94:1-8 , 95:1-8 , 96:1-19 , 97:1-5 , 98:1-8 , 99:1-8 , 100:1-11 , 101:1-11 , 102:1-8 , 103:1-3 , 104:1-9 , 105:1-5 , 106:1-4 , 107:1-7 , 108:1-3 , 109:1-6 , 110:1-3 , 111:1-5 , 112:1-4 , 113:1-5 , 114:1-6" }
];

// === BEGIN QURANIC JUZ === //
if (viewParam === "juz" && !urlParams.get("juz")) {
  content.innerHTML = `<h4 class="mb-4">Juz Index</h4>`;
  const juzList = juzRanges.map((range, i) => {
  const [startSurah] = range.start.split(":").map(Number);
  const [endSurah] = range.end.split(":").map(Number);
  const startName = surahNames[startSurah]?.transliteration || `Surah ${startSurah}`;
  const endName = surahNames[endSurah]?.transliteration || `Surah ${endSurah}`;
    return `
     <div class="col col-md-4 col-12 mb-3">
     <div class="card card-body m-0 p-3 h-100 card-hover">
      <a href="?view=juz&juz=${i + 1}" class="list-group-item list-group-item-action w-100 text-start">
        <h5 class="mb-1 fw-bold">Juz ${i + 1}</h5>
        <p class="mb-1 small">${startName} ${range.start} – ${endName} ${range.end}</p>
        <p class="mb-1 small d-none">${startName} – ${endName} ${range.info}</p>
      </a></div></div>`;
  }).join("");
  content.innerHTML += `<div class="row">${juzList}</div>`;
  return;
}
if (viewParam === "juz" && urlParams.get("juz")) {
  const juzId = parseInt(urlParams.get("juz"));
  const page = parseInt(urlParams.get("page") || 1);
  const pageSize = 20;
  const range = juzRanges[juzId - 1];
  if (!range) return;

  const [startSurah, startAyah] = range.start.split(":").map(Number);
  const [endSurah, endAyah] = range.end.split(":").map(Number);

  fetch("/quran/assets/data/quran.txt")
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split("\n");
      const verses = lines.map(line => {
        const [s, a, t] = line.split("|");
        return { surah: parseInt(s), ayah: parseInt(a), text: t };
      });

      const filtered = verses.filter(v => {
        const key = `${v.surah}:${v.ayah}`;
        return (
          (v.surah > startSurah || (v.surah === startSurah && v.ayah >= startAyah)) &&
          (v.surah < endSurah || (v.surah === endSurah && v.ayah <= endAyah))
        );
      });

      const totalPages = Math.ceil(filtered.length / pageSize);
      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

      const breadcrumb = `
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="?view=juz">Juz Index</a></li>
            <li class="breadcrumb-item active" aria-current="page">Juz ${juzId}</li>
          </ol>
        </nav>`;

      content.innerHTML = `
        ${breadcrumb}
        <h4 class="page-title m-0">Juz ${juzId}</h4>
        <p class="small mb-4">${range.info}</p>
      `;
      paginated.forEach(v => {
        const name = surahNames[v.surah] || { transliteration: "" };
        const translation = englishVerses.find(e => e.chapter === v.surah && e.verse === v.ayah)?.text || "";
        content.innerHTML += `
          <div class="mb-3 pb-2 verse-block">
            <div class="text-muted small mb-1">
             <a href="?verse=${v.surah}:${v.ayah}" class="text-decoration-none">
              ${name.transliteration} <span class="badge badge-primary">${v.surah}:${v.ayah}</span>
             </a>
             ${renderAudioButton(v.surah, v.ayah)}
            </div>
            <div class="fs-5 arabic">
             ${v.text}
             <button class="btn btn-sm small border-0 icon-copy" data-copy="${v.text}" onclick="copyTextFromData(this)"></button>
            </div>
            <div class="english">
             ${translation}
             <button class="btn btn-sm small border-0 icon-copy" data-copy="${translation.replace(/"/g, '&quot;')}" onclick="copyTextFromData(this)"></button>
            </div>
          </div>`;
      });
    initializeCopyIcons();
    initializeAudioIcons();
      content.innerHTML += `
        <nav class="mt-4 d-flex justify-content-between align-items-center">
          ${page > 1
            ? `<a class="btn btn-outline-primary" href="?view=juz&juz=${juzId}&page=${page - 1}">&laquo; Prev</a>`
            : "<span></span>"}
          <span>Page ${page} of ${totalPages}</span>
          ${page < totalPages
            ? `<a class="btn btn-outline-primary" href="?view=juz&juz=${juzId}&page=${page + 1}">Next &raquo;</a>`
            : ""}
        </nav>`;
    });
    return;
}
// === END OF QURANIC JUZ === //

// === BEGIN QURANIC TOPICS === //
if (viewParam === "topics") {
  const currentPage = parseInt(urlParams.get("page")) || 1;
  const pageSize = 30;

  fetch("/quran/assets/data/topics.txt")
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split("\n");
      const total = lines.length;
      const totalPages = Math.ceil(total / pageSize);

      const start = (currentPage - 1) * pageSize;
      const paginated = lines.slice(start, start + pageSize);

      content.innerHTML = `
        <h4 class="mb-4">Topics</h4>
        <div class="table-responsive">
          <table class="table table-bordered table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th style="width: 60%">Topic</th>
                <th style="width: 40%">Verse References</th>
              </tr>
            </thead>
            <tbody id="topicsTableBody"></tbody>
          </table>
        </div>`;

      const tableBody = document.getElementById("topicsTableBody");

      paginated.forEach(line => {
        const [topic, refs] = line.split("|");
        if (!topic || !refs) return;

        const links = refs.split(",").map(ref => {
          const trimmed = ref.trim();
          return `<a href="?verse=${trimmed}" class="text-decoration-none">${trimmed}</a>`;
        }).join(", ");

        tableBody.innerHTML += `
          <tr>
            <td>${topic}</td>
            <td>${links}</td>
          </tr>`;
      });

      // Pagination controls
      content.innerHTML += `
        <nav class="mt-4 d-flex justify-content-between align-items-center">
          ${currentPage > 1
            ? `<a class="btn btn-outline-primary" href="?view=topics&page=${currentPage - 1}">&laquo; Previous</a>`
            : "<span></span>"}
          <span>Page ${currentPage} of ${totalPages}</span>
          ${currentPage < totalPages
            ? `<a class="btn btn-outline-primary" href="?view=topics&page=${currentPage + 1}">Next &raquo;</a>`
            : ""}
        </nav>`;
    })
    .catch(err => {
      content.innerHTML = `<p class="text-danger">❌ Failed to load topics file.</p>`;
      console.error(err);
    });

  return;
}
// === END OF QURANIC TOPICS === //

// === BEGIN WIDGET RECENT SCHOLAR COMMENTARIES === //
let currentCommentaryPage = 1;
const commentaryPerPage = 15;
let allCommentaries = [];

function renderCommentaryPage(page) {
  const container = document.getElementById("recent-commentary-list");
  const pageInfo = document.getElementById("commentary-page-info");

  if (!container || !pageInfo) return;

  const start = (page - 1) * commentaryPerPage;
  const end = start + commentaryPerPage;
  const items = allCommentaries.slice(start, end);

  container.innerHTML = items.map(item => `
    <a href="?verse=${item.chapter}:${item.verse}&sh=${item.shaykh}" class="text-decoration-none d-block my-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mortarboard me-1" viewBox="0 0 16 16">
        <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM8 8.46 1.758 5.965 8 3.052l6.242 2.913z"/>
        <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46z"/>
      </svg>
      ${item.scholar} on Verse ${item.chapter}:${item.verse}
    </a>
  `).join("");

  pageInfo.textContent = `Page ${page} of ${Math.ceil(allCommentaries.length / commentaryPerPage)}`;
  document.getElementById("prev-page").disabled = page === 1;
  document.getElementById("next-page").disabled = end >= allCommentaries.length;
}

function loadCommentaries() {
  fetch("/quran/assets/data/scholarly.commentary.txt")
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split("\n").reverse();
      allCommentaries = lines
        .map(line => {
          const [ch, vs, scholar] = line.split("|");
          if (!ch || !vs || !scholar) return null;
          const shaykhSlug = scholar.trim().toLowerCase().replace(/[^a-z]+/g, "-");
          return {
            chapter: ch,
            verse: vs,
            scholar: scholar.trim(),
            shaykh: shaykhSlug
          };
        })
        .filter(Boolean);

      // Initial render
      renderCommentaryPage(currentCommentaryPage);

      const prevBtn = document.getElementById("prev-page");
      const nextBtn = document.getElementById("next-page");

      if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentCommentaryPage > 1) {
            currentCommentaryPage--;
            renderCommentaryPage(currentCommentaryPage);
          }
        });

        nextBtn.addEventListener("click", () => {
          const total = Math.ceil(allCommentaries.length / commentaryPerPage);
          if (currentCommentaryPage < total) {
            currentCommentaryPage++;
            renderCommentaryPage(currentCommentaryPage);
          }
        });
      }
    })
    .catch(err => {
      console.warn("Failed to load commentary list:", err);
      const container = document.getElementById("recent-commentary-list");
      if (container) container.innerHTML = "<p class='text-danger'>Failed to load commentary list.</p>";
    });
}
// === END OF WIDGET RECENT SCHOLAR COMMENTARIES === //

// === BEGIN TAFSIR HANDLER === //
if (viewParam === "tafsirs" && authorParam && !langParam) {
  content.innerHTML = `
    <div class="alert alert-light mt-4">
      <h4 class="alert-heading">Page Not Found</h4>
      <p>The page you requested requires a <strong>language parameter</strong>. Check url or try it again.</p>
      <hr>
      <p class="mb-0">Example: <code>/quran?view=tafsirs&author=saadi&lang=en</code></p>
    </div>`;
  document.title = "404 Page Not Found";
  return;
}
if (viewParam === "tafsirs" && !authorParam) {
  const breadcrumbHtml = `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/quran/">Home</a></li>
        <li class="breadcrumb-item active" aria-current="page">Tafsir</li>
      </ol>
    </nav>`;

  content.innerHTML = `
    ${breadcrumbHtml}
    <h2 class="page-title">Tafsir</h2>
    <table class="table table-hover table-lg">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Tafsir</th>
          <th scope="col">Language</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">1</th>
          <td><a href="?view=tafsirs&author=saadi&lang=en" class="text-decoration-none">Tafsir As-Sa'di</a></td>
          <td>English</td>
        </tr>
        <tr>
          <th scope="row">2</th>
          <td><a href="?view=tafsirs&author=saadi&lang=ar" class="text-decoration-none">Tafsir As-Sa'di</a></td>
          <td>Arabic</td>
        </tr>
        <tr>
          <th scope="row">3</th>
          <td><a href="?view=tafsirs&author=saadi&lang=ru" class="text-decoration-none">Tafsir As-Sa'di</a></td>
          <td>Russian</td>
        </tr>
        <tr>
          <th scope="row">4</th>
          <td><a href="?view=tafsirs&author=kathir&lang=en" class="text-decoration-none">Tafsir Ibn Kathir</a></td>
          <td>English</td>
        </tr>
      </tbody>
    </table>

  <div class="card card-body" id="recent-commentary-list"></div>
  <div class="pagination-container text-center mt-3">
    <button id="prev-page" class="btn btn-sm btn-outline-secondary me-2">Previous</button>
    <span id="commentary-page-info"></span>
    <button id="next-page" class="btn btn-sm btn-outline-secondary ms-2">Next</button>
  </div>

  `;
  document.title = "Tafsir";
  return;
}

const tafsirSources = {
  "saadi-en": { type: "txt", file: "/quran/assets/data/tafsir.saadi.txt" },
  "saadi-ar": { type: "json", path: "/quran/assets/data/tafsirs/saadi-ar" },
  "saadi-ru": { type: "json", path: "/quran/assets/data/tafsirs/saadi-ru" },
  "kathir-en": { type: "json", path: "/quran/assets/data/tafsirs/ibn-kathir" }
};

function formatTafsir(text) {
  if (!text) return "";
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, '')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\n+/g, "<br><br>")
    .replace(/"([^"]+?\.)"/g, '<b>"$1"</b>')
    .replace(/\n([^\n]{3,}[\u0600-\u06FF]+[^\n]{3,})\n/g, '<br><br><b>$1</b><br><br>')
    .replace(/#/g, "<br><br>")
    .replace(/\*([^*]+)\*/g, '“<strong>$1</strong>”')
    .replace(/\\n/g, "\n")
    .replace(/\\+"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/\n/g, "<br><br>");
}

if (viewParam === "tafsirs" && authorParam && langParam) {
  const key = `${authorParam}-${langParam}`;
  const source = tafsirSources[key];

  if (!source) {
    content.innerHTML = `
      <div class="alert alert-danger mt-4">
        <h4 class="alert-heading">404 – Tafsir Not Found</h4>
        <p>The tafsir source for <code>${authorParam} (${langParam})</code> is not available.</p>
      </div>`;
    document.title = "404 – Tafsir Not Found";
    return;
  }

  const singleMatch = verseParam?.match(/^(\d+):(\d+)$/);
  const rangeMatch = verseParam?.match(/^(\d+):(\d+)-(\d+)$/);
  const surahOnlyMatch = verseParam?.match(/^\d+$/);
  const chapterId = parseInt(rangeMatch?.[1] || singleMatch?.[1] || surahOnlyMatch);
  const start = parseInt(rangeMatch?.[2] || singleMatch?.[2]);
  const end = parseInt(rangeMatch?.[3] || singleMatch?.[2]);
  const name = surahNames[chapterId] || { transliteration: "" };
  const titleParam = authorTitles[authorParam] || `Tafsir ${authorParam}`;

  // === JSON SOURCE HANDLING (KATHIR, SAADI AR/RU) === //
  if (source.type === "json") {
    const currentPage = parseInt(urlParams.get("page")) || 1;
    const pageSize = 20;
    const totalVerses = verses.filter(v => v.chapter === chapterId).length;
    const startVerse = (currentPage - 1) * pageSize + 1;
    const endVerse = Math.min(startVerse + pageSize - 1, totalVerses);

    if (singleMatch) {
      fetch(`${source.path}/${chapterId}/${start}.json`)
        .then(res => res.json())
        .then(data => {
          const breadcrumb = `
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/quran/">Home</a></li>
                <li class="breadcrumb-item"><a href="?view=tafsirs">Tafsir</a></li>
                <li class="breadcrumb-item"><a href="?view=tafsirs&author=${authorParam}&lang=${langParam}">${titleParam}</a></li>
                <li class="breadcrumb-item"><a href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${chapterId}">Surah ${chapterId}</a></li>
                <li class="breadcrumb-item active" aria-current="page">Ayah ${start}</li>
              </ol>
            </nav>`;

          content.innerHTML = `
            ${breadcrumb}
            <h4>${titleParam} – Surah ${chapterId} (${name.transliteration}) Ayah ${start}</h4>
            <div class="card border-0 p-4 mb-4">
              <div class="english">${formatTafsir(data.text)}</div>
            </div>`;
          document.title = `${titleParam} | Surah ${chapterId}:${start}`;
        })
        .catch(() => {
          content.innerHTML = `<p class="text-danger">Tafsir not found for Surah ${chapterId}:${start}</p>`;
        });
      return;
    }

    if (surahOnlyMatch) {
      const breadcrumb = `
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/quran/">Home</a></li>
            <li class="breadcrumb-item"><a href="?view=tafsirs">Tafsir</a></li>
            <li class="breadcrumb-item"><a href="?view=tafsirs&author=${authorParam}&lang=${langParam}">${titleParam}</a></li>
            <li class="breadcrumb-item active" aria-current="page">Surah ${chapterId}</li>
          </ol>
        </nav>`;

      content.innerHTML = `
        ${breadcrumb}
        <h4 class="mb-4">${titleParam} – Surah ${chapterId} (${name.transliteration})</h4>`;

      for (let v = startVerse; v <= endVerse; v++) {
        content.innerHTML += `
          <div class="mb-2">
            <a href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${chapterId}:${v}" class="btn btn-outline-secondary w-100 text-start">
              Ayah ${v}
            </a>
          </div>`;
      }

      content.innerHTML += `
        <nav class="mt-4 d-flex justify-content-between">
          ${currentPage > 1 ? `<a class="btn btn-outline" href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${chapterId}&page=${currentPage - 1}">&laquo; Previous</a>` : '<span></span>'}
          <div class="align-self-center">Page ${currentPage} of ${Math.ceil(totalVerses / pageSize)}</div>
          ${endVerse < totalVerses ? `<a class="btn btn-outline" href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${chapterId}&page=${currentPage + 1}">Next &raquo;</a>` : ""}
        </nav>`;

      document.title = `${titleParam} | Surah ${chapterId}`;
      return;
    }

    // JSON full index view
    const breadcrumb = `
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/quran/">Home</a></li>
          <li class="breadcrumb-item"><a href="?view=tafsirs">Tafsir</a></li>
          <li class="breadcrumb-item active text-capitalize" aria-current="page">${titleParam}</li>
        </ol>
      </nav>`;

    content.innerHTML = `${breadcrumb}<h4 class="mb-4 text-capitalize">${titleParam}</h4>`;
    for (let cid = 1; cid <= 114; cid++) {
      const n = surahNames[cid] || { transliteration: "" };
      content.innerHTML += `
        <div class="list-group col-12 col-sm-6 col-lg-4 d-flex">
          <a href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${cid}" class="list-group-item list-group-item-action w-100 text-start">
            ${cid}. ${n.transliteration}
          </a>
        </div>`;
    }
    document.title = `${titleParam}`;
    return;
  }

  // === TXT-based TAFSIR ===
  fetch(`${source.file}?v=${Date.now()}`)
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split("\n");
      const entries = lines.map(line => {
        const [chapterStr, rangeStr] = line.split("|");
        return { chapter: parseInt(chapterStr), rangeStr, line };
      });

      if ((rangeMatch || singleMatch) && !isNaN(chapterId) && !isNaN(start)) {
        const matchLine = entries.find(e => {
          if (e.chapter !== chapterId) return false;
          if (e.rangeStr.includes("-")) {
            const [s, eEnd] = e.rangeStr.split("-").map(Number);
            return start >= s && end <= eEnd;
          } else {
            return parseInt(e.rangeStr) === start;
          }
        });

        if (matchLine) {
          const [_, rangeStr, ...rest] = matchLine.line.split("|");
          const rawTafsir = rest.join("|").trim();

          const breadcrumb = `
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/quran/">Home</a></li>
                <li class="breadcrumb-item"><a href="?view=tafsirs">Tafsir</a></li>
                <li class="breadcrumb-item"><a href="?view=tafsirs&author=${authorParam}&lang=${langParam}">${titleParam}</a></li>
                <li class="breadcrumb-item active" aria-current="page">Surah ${chapterId}:${rangeStr}</li>
              </ol>
            </nav>`;

          content.innerHTML = `
            ${breadcrumb}
            <h4>${titleParam} – Surah ${chapterId} (${name.transliteration}) Ayah ${rangeStr}</h4>
            <div class="card border-0 p-4 mb-4">
              <div>${formatTafsir(rawTafsir)}</div>
            </div>`;
          document.title = `${titleParam} | Surah ${chapterId}:${rangeStr}`;
          return;
        }
      }

      if (surahOnlyMatch) {
        const currentPage = parseInt(urlParams.get("page")) || 1;
        const chapterEntries = entries.filter(e => e.chapter === chapterId);
        const pageSize = 20;
        const totalPages = Math.ceil(chapterEntries.length / pageSize);
        const paginated = chapterEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        const breadcrumb = `
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><a href="/quran/">Home</a></li>
              <li class="breadcrumb-item"><a href="?view=tafsirs">Tafsir</a></li>
              <li class="breadcrumb-item"><a href="?view=tafsirs&author=${authorParam}&lang=${langParam}">${titleParam}</a></li>
              <li class="breadcrumb-item active" aria-current="page">Surah ${chapterId}</li>
            </ol>
          </nav>`;

        content.innerHTML = `${breadcrumb}<h4 class="mb-4">${titleParam} – Surah ${chapterId} (${name.transliteration})</h4><div class="list-group">`;
        paginated.forEach(e => {
          content.innerHTML += `
           <div class="list-group">
            <a href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${e.chapter}:${e.rangeStr}" class="list-group-item list-group-item-action">
              Ayah ${e.rangeStr}
            </a></div>`;
        });
        content.innerHTML += `</div>`;

        content.innerHTML += `
          <nav class="mt-4 d-flex justify-content-between">
            ${currentPage > 1 ? `<a class="btn btn-outline" href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${chapterId}&page=${currentPage - 1}">&laquo; Previous</a>` : "<span></span>"}
            <div class="align-self-center">Page ${currentPage} of ${totalPages}</div>
            ${currentPage < totalPages ? `<a class="btn btn-outline" href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${chapterId}&page=${currentPage + 1}">Next &raquo;</a>` : ""}
          </nav>`;

        document.title = `${titleParam} | Surah ${chapterId}`;
        return;
      }
      // TXT full index view
      const uniqueChapters = [...new Set(entries.map(e => e.chapter))];
      const breadcrumb = `
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/quran/">Home</a></li>
            <li class="breadcrumb-item"><a href="?view=tafsirs">Tafsir</a></li>
            <li class="breadcrumb-item active" aria-current="page">${titleParam}</li>
          </ol>
        </nav>`;

      content.innerHTML = `${breadcrumb}<h4 class="mb-4">${titleParam}</h4>`;
      uniqueChapters.forEach(cid => {
        const n = surahNames[cid] || { transliteration: "" };
        content.innerHTML += `
          <div class="list-group col-12 col-sm-6 col-lg-4 d-flex">
            <a href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${cid}" class="list-group-item list-group-item-action w-100 text-start">
              Surah ${cid} (${n.transliteration})
            </a>
          </div>`;
      });
      document.title = `${titleParam}`;
    });
  return;
}
// === END OF TAFSIR HANDLER === //

// === BEGIN FILTED === //
if (!verseParam && !searchQuery) {
  const filterContainer = document.createElement("div");
  filterContainer.className = "mb-5 d-flex gap-2 flex-wrap align-items-center";
  filterContainer.innerHTML = `
    <button class="btn btn-sm btn-ouline btn-surah-filter ripple ${filterType === 'all' ? 'active' : ''}" onclick="setFilter('all')">All</button>
    <button class="btn btn-sm btn-ouline btn-surah-filter riple ${filterType === 'Meccan' ? 'active' : ''}" onclick="setFilter('Meccan')">Meccan</button>
    <button class="btn btn-sm btn-ouline btn-surah-filter riple ${filterType === 'Medinan' ? 'active' : ''}" onclick="setFilter('Medinan')">Medinan</button>
    <button class="btn btn-sm btn-ouline btn-surah-filter riple ${filterType === 'Mufassal' ? 'active' : ''}" onclick="setFilter('Mufassal')">Mufassal</button>
  `;
  content.before(filterContainer);
}

window.setFilter = (type) => {
  localStorage.setItem("quran_filter_type", type);
  location.reload();
};
const chapters = [...new Set(
  verses.filter(v => !isNaN(v.chapter)).map(v => v.chapter)
)];
// === END OF FILTER === //

// === BEGIN SEARCH === //
if (searchQuery) {
  const verseRangeMatch = searchQuery.match(/^(\d+):(\d+)-(\d+)$/);
  const singleVerseMatch = searchQuery.match(/^(\d+):(\d+)$/);
  const surahOnlyMatch = searchQuery.match(/^\d+$/);

  if (verseRangeMatch) {
    const [_, surah, start, end] = verseRangeMatch;
    window.location.href = `?verse=${surah}:${start}-${end}`;
    return;
  }

  if (singleVerseMatch) {
    const [_, surah, ayah] = singleVerseMatch;
    window.location.href = `?verse=${surah}:${ayah}`;
    return;
  }

  if (surahOnlyMatch) {
    window.location.href = `?verse=${searchQuery}`;
    return;
  }

  const normalizedQuery = normalizeArabic(searchQuery);
  const results = verses.filter(v => {
  const normalizedArabic = normalizeArabic(v.arabic);
  const normalizedSaadi = normalizeArabic(v.saadi);
  const normalizedTafsir = normalizeArabic(v.tafsir);

  return (
    normalizedArabic.includes(normalizedQuery) ||
    v.english.toLowerCase().includes(searchQuery) ||
    normalizedSaadi.includes(normalizedQuery) ||
    normalizedTafsir.includes(normalizedQuery)
  );
});

  if (results.length === 0) {
    content.innerHTML = `<p>No results found for "${searchQuery}"</p>`;
    return;
  }

  const grouped = results.reduce((acc, v) => {
    if (!acc[v.chapter]) acc[v.chapter] = [];
    acc[v.chapter].push(v);
    return acc;
  }, {});

  const pad = n => String(n).padStart(3, '0');

  content.innerHTML = `
    <h4 class="mb-4">Search Results for "<mark>${searchQuery}</mark>" (${results.length} matches)</h4>
    ${Object.keys(grouped).map(ch => {
      const chapterName = surahNames[ch]?.transliteration || `Surah ${ch}`;
      return `
 <div class="card border-0">
  <div class="card-header bg-transparent border-bottom">
    <a class="text-decoration-none chapter-name-search" href="?verse=${ch}">Surah ${ch}: ${chapterName}</a>
  </div>
  <div class="card-body">
        ${grouped[ch].map(v => `
          <div class="verse-block p-3 mb-3">
            <div class="d-flex justify-content-start">
             <a href="?verse=${v.chapter}:${v.verse}" class="btn btn-sm ayah-link bg-opacity-75 bg-gradient text-decoration-none">${v.chapter}:${v.verse}</a>
             ${renderAudioButton(v.chapter, v.verse)}
          </div>
            <p class="mb-1 arabic" dir="rtl">
             ${highlight(v.arabic, searchQuery)}
            <button class="btn btn-sm small border-0 icon-copy"
            data-copy="${v.arabic.replace(/"/g, '&quot;')}"
            onclick="copyTextFromData(this)">
           </button>
            </p>
            <p class="mb-1 english">
             <span class="badge small rounded-pill ayah-num bg-opacity-75 bg-gradient fw-light">Hilali</span> ${highlight(v.english, searchQuery)}
           <button class="btn btn-sm small border-0 icon-copy"
            data-copy="${v.english.replace(/"/g, '&quot;')}"
            onclick="copyTextFromData(this)">
           </button>
            </p>
          </div>
        `).join("")}
  </div>
</div>
      `;
    }).join("")}`;
    initializeCopyIcons();
    initializeAudioIcons();
  return;
}
// === END OF SEARCH === //

// === BEGIN VERSES RANGE eg. (?verse=1:2-3) === //
const rangeMatch = verseParam?.match(/^(\d+):(\d+)-(\d+)$/);
  if (rangeMatch) {
    const chapterId = parseInt(rangeMatch[1]);
    const start = parseInt(rangeMatch[2]);
    const end = parseInt(rangeMatch[3]);
    const name = surahNames[chapterId] || {};

    const rangeVerses = verses.filter(v => v.chapter === chapterId && v.verse >= start && v.verse <= end);
    if (rangeVerses.length === 0) {
      content.innerHTML = `<p>No verses found in the specified range.</p>`;
      return;
    }

const pad = n => String(n).padStart(3, '0');
const html = rangeVerses.map(v => `
  <div class="verse-block p-3 mb-3">
    <p><a role="button" href="?verse=${v.chapter}:${v.verse}" class="text-decoration-none btn btn-sm ayah-link">${v.chapter}:${v.verse}</a></p>
    <p class="mb-1 arabic" dir="rtl">
      ${v.arabic}
      <button class="btn btn-sm small border-0 icon-copy"
        data-copy="${v.arabic.replace(/"/g, '&quot;')}"
        onclick="copyTextFromData(this)">
      </button>
    </p>
    <p class="mb-1 english">
      <span class="badge small rounded-pill text-bg-success bg-opacity-75 bg-gradient fw-light">Hilali</span> ${v.english}
      <button class="btn btn-sm small border-0 icon-copy"
        data-copy="${v.english.replace(/"/g, '&quot;')}"
        onclick="copyTextFromData(this)">
      </button>
    </p>
    <div class="btn-group mt-3 mb-3">
     ${renderAudioButton(v.chapter, v.verse)}
     <button class="btn btn-sm small border-0 icon-copy" data-copy="${location.href}" onclick="copyTextFromData(this)">
      <span class="ayah-url-copy">Ayah URL</span>
     </button>
    </div>
  </div>
`).join("");
const breadcrumbHtml = `
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="index.html" class="text-decoration-none">Home</a></li>
      <li class="breadcrumb-item"><a href="?verse=${chapterId}" class="text-decoration-none">Surah ${chapterId}</a></li>
      <li class="breadcrumb-item active" aria-current="page">Surah ${chapterId}:${start}-${end}</li>
    </ol>
  </nav>`;
content.innerHTML = `
  ${breadcrumbHtml}
  <div class="card border-0">
    <div class="card-body">
      <h4>${name.transliteration || "Surah"} ${chapterId}:${start}-${end}</h4>
      ${html}
    </div>
  </div>
`;
  initializeCopyIcons(); 
  initializeAudioIcons();
  document.title = `Surah ${name.transliteration || ""} ${chapterId}:${start}-${end}`;
  return;
}
// === END VERSES RANGE eg. (?verse=1:2-3) === //

function loadScholarCommentary(filePath = "/quran/assets/data/scholarly.commentary.txt") {
  return fetch(filePath)
    .then(res => res.text())
    .then(text => {
      return text
        .split("\n")
        .map(line => {
          const [chapter, verse, scholar, source, produced, ...contentParts] = line.split("|");
          return {
            chapter: parseInt(chapter),
            verse: parseInt(verse),
            scholar: scholar?.trim(),
            source: source?.trim(),
            produced: produced?.trim(),
            content: contentParts.join("|").trim()
          };
        });
    });
}
function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}
const shaykhParam = urlParams.get("sh");
if (shaykhParam) {
  loadScholarCommentary().then(commentaries => {
    const matching = commentaries.filter(c =>
      c.chapter === chapterId &&
      c.verse === verseId &&
      slugify(c.scholar) === shaykhParam
    );

    if (matching.length > 0) {
      const commentaryHtml = matching.map(c => `
        <div class="mt-4 p-3 border rounded">
          <h5>Mufti/Shaykh: ${c.scholar}</h5>
          ${c.source ? `<p class="mb-1 text-muted">Source: ${c.source}</p>` : ""}
          ${c.produced ? `<p class="mb-1 text-muted">Produced/Translated by: ${c.produced}</p>` : ""} <hr>
          <div class="english mt-3">${formatTafsir(c.content)}</div>
        </div>
      `).join("");

      const container = document.createElement("div");
      container.innerHTML = `
        <h4 class="mt-4">💬 Scholarly Commentary</h4>
        ${commentaryHtml}
      `;
      content.querySelector(".card").appendChild(container);
    } else {
      content.querySelector(".card").insertAdjacentHTML("beforeend", `
        <div class="alert alert-warning mt-4">No commentary found for this scholar.</div>
      `);
    }
  });
}

// === BEGIN QURAN surahs, verses, etc === //
const [chapterIdStr, verseIdStr] = (verseParam || "").split(":");
const chapterId = parseInt(chapterIdStr);
const verseId = verseIdStr ? parseInt(verseIdStr) : null;
const chapterName = surahNames[chapterId]?.transliteration || `Surah ${chapterId}`;
let breadcrumbHtml = "";

  if (verseParam) {
     const [chapterIdStr, verseIdStr] = verseParam.split(":");
     const chapterId = parseInt(chapterIdStr);
     const verseId = verseIdStr ? parseInt(verseIdStr) : null;

  breadcrumbHtml = `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="/quran/" class="text-decoration-none text-success">Home</a>
        </li>
        <li class="breadcrumb-item">
          <a href="?verse=${chapterId}" class="text-decoration-none text-success">Surah ${chapterId}: ${chapterName}</a>
        </li>
        ${
          verseId !== null
            ? `<li class="breadcrumb-item active" aria-current="page">
${viewParam === 'tafsir' ? `Tafsir of Surah ${chapterId}:${verseId}` :
 viewParam === 'commentary' ? `Commentary of Surah ${chapterId}:${verseId}` :
 `Verse ${chapterId}:${verseId}`}

               </li>`
            : ""
        }
      </ol>
    </nav>`;

  if (verseId) {
    const verse = verses.find(v => v.chapter === chapterId && v.verse === verseId);
    const name = surahNames[chapterId] || { transliteration: "", arabic: "" };

  if (verse) {
    const pad = (n) => String(n).padStart(3, '0');
    const audioURL = `https://everyayah.com/data/Nasser_Alqatami_128kbps/${pad(verse.chapter)}${pad(verse.verse)}.mp3`;
    const prev = verses.find(v => v.chapter === chapterId && v.verse === verseId - 1);
    const next = verses.find(v => v.chapter === chapterId && v.verse === verseId + 1);
    const name = surahNames[chapterId] || { transliteration: "", arabic: "" };
    const shareHTML = generateSocialShareHTML(verse.chapter, verse.verse);
    content.innerHTML = `
      ${breadcrumbHtml}           
      <div class="card border-0">
        <div class="card-body">
          <h3 class="surah-name-arabic me-2 text-center fs-1">surah${String(verse.chapter).padStart(3, '0')}</h3>
          <h3 class="text-center">${name.transliteration} (${name.english})</h3>
          <p><a role="button" href="?verse=${verse.chapter}:${verse.verse}" class="text-decoration-none btn btn-sm ayah-link">${verse.chapter}:${verse.verse}</a> ${renderAudioButton(verse.chapter, verse.verse)}</p>
          <p class="mb-1 arabic" dir="rtl">${verse.arabic}
            <button class="btn btn-sm small border-0 icon-copy"
            data-copy="${verse.arabic.replace(/"/g, '&quot;')}"
            onclick="copyTextFromData(this)">
           </button>
          </p>
          <p class="mb-1 mt-3 english"><span class="badge small rounded-pill text-bg-success bg-opacity-75 bg-gradient fw-light">Hilali</span> <br> ${verse.english}
           <button class="btn btn-sm small border-0 icon-copy"
            data-copy="${verse.english.replace(/"/g, '&quot;')}"
            onclick="copyTextFromData(this)">
           </button>
          </p>
     
        <div class="d-flex justify-content-between mt-3 mb-3">          
           <div>
            <span id="commentary-link-placeholder"></span>
           </div>
           <div>
            <button class="btn btn-sm border-0" type="button" data-bs-toggle="collapse" data-bs-target="#${verse.chapter}-${verse.verse}" aria-expanded="false" aria-controls="${verse.chapter}-${verse.verse}">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16"><path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/></svg>
            </button>
           </div>
         </div>
        ${shareHTML}
    </div>

          </div>
        </div>
      </div>
<nav aria-label="Verse navigation">
  <ul class="pagination justify-content-center my-5 flex-wrap gap-2">
    <li class="page-item ${!prev ? 'disabled' : ''}">
      <a class="page-link d-flex align-items-center gap-2 px-3 rounded shadow-sm" href="?verse=${prev?.chapter}:${prev?.verse}" tabindex="-1">
        <i class="bi bi-arrow-left-circle"></i>
        <span>Prev</span>
        ${prev ? `<small class="text-muted"><span class="badge badge-secondary rounded-fill">${prev.chapter}:${prev.verse}</span></small>` : ""}
      </a>
    </li>
    <li class="page-item ${!next ? 'disabled' : ''}">
      <a class="page-link d-flex align-items-center gap-2 px-3 rounded text-white shadow-sm" href="?verse=${next?.chapter}:${next?.verse}">
        <span>Next</span>
        ${next ? `<small><span class="badge badge-secondary rounded-fill">${next.chapter}:${next.verse}</span></small>` : ""}
        <i class="bi bi-arrow-right-circle"></i>
      </a>
    </li>
  </ul>
</nav>
    `;
    document.title = `Surah ${name.transliteration} ${chapterId}:${verseId}`;
    initializeCopyIcons();
    initializeAudioIcons();
  } else {
    content.innerHTML = `<p>Verse not found.</p>`;
  }

fetch("/quran/assets/data/scholarly.commentary.txt")
  .then(res => res.text())
  .then(text => {
    const commentaries = text.split("\n").map(line => {
      const [ch, vs, scholar, source, ...rest] = line.split("|");
      return {
        chapter: parseInt(ch),
        verse: parseInt(vs),
        scholar: scholar?.trim(),
        source: source?.trim(),
        content: rest.join("|").trim()
      };
    });

    // Filter all scholars for current verse
    const matching = commentaries.filter(c => c.chapter === chapterId && c.verse === verseId);
    if (matching.length > 0) {
      const links = matching.map(c => `
        <a href="?verse=${c.chapter}:${c.verse}&sh=${slugify(c.scholar)}" class="badge text-bg-info text-decoration-none me-2">
          ${c.scholar}
        </a>
      `).join(" ");
      document.getElementById("commentary-link-placeholder").innerHTML = links;
    }
  })
  .catch(err => {
    console.warn("Commentary load failed:", err);
  });

} else {
          const chapterVerses = verses.filter(v => v.chapter === chapterId);
          if (chapterVerses.length === 0) {
            content.innerHTML = `<p>Chapter not found.</p>`;
            return;
          }
          const verseCount = chapterVerses.length;
          const name = surahNames[chapterId] || { arabic: "", english: "" };
          const pageParam = parseInt(urlParams.get("page")) || 1;
          const perPage = 20;
          const totalPages = Math.ceil(verseCount / perPage);
          const paginatedVerses = chapterVerses.slice((pageParam - 1) * perPage, pageParam * perPage);

fetch("/quran/assets/data/scholarly.commentary.txt")
  .then(res => res.text())
  .then(txt => {
    const commentaryLines = txt.split("\n").filter(Boolean);
    const commentaryMap = new Map();
    commentaryLines.forEach(line => {
      const [ch, vs, scholar] = line.split("|");
      const key = `${parseInt(ch)}:${parseInt(vs)}`;
      if (!commentaryMap.has(key)) {
        commentaryMap.set(key, new Set());
      }
      commentaryMap.get(key).add(scholar.trim());
    });

          const chapterHtml = paginatedVerses.map(v => {
          const pad = (n) => String(n).padStart(3, '0');
          const audioURL = `https://everyayah.com/data/Nasser_Alqatami_128kbps/${pad(v.chapter)}${pad(v.verse)}.mp3`;
          const shareHTML = generateSocialShareHTML(v.chapter, v.verse);

  let basmalahHTML = "";
  if (v.basmalah && v.basmalah.trim() !== "") {
    basmalahHTML = '<p class="mb-5 arabic fw-semibold text-center">' + v.basmalah + '</p>';
  }

      const key = `${v.chapter}:${v.verse}`;
      if (commentaryMap.has(key)) {
        const scholars = Array.from(commentaryMap.get(key));
        commentaryLinks = scholars.map(name => {
          const slug = slugify(name);
          return `<a href="?verse=${key}&sh=${slug}" class="text-decoration-none me-1 btn btn-sm border-0"><span class="badge badge-primary">${name}</span></a>`;
        }).join(" ");
      }

  return `
    <div class="verse-block p-0 mb-0 mt-3">
      ${basmalahHTML} 
      <p><a role="button" href="?verse=${v.chapter}:${v.verse}" class="text-decoration-none btn btn-sm ayah-link">         ${v.chapter}:${v.verse}</a> ${renderAudioButton(v.chapter, v.verse)}
      </p>
      <p class="mb-3 arabic" dir="rtl">${v.arabic}
           <button class="btn btn-sm small border-0 icon-copy"
            data-copy="${v.arabic.replace(/"/g, '&quot;')}"
            onclick="copyTextFromData(this)">
           </button>
      </p>
      <p class="mb-1 english mt-3">
        <span class="badge small rounded-pill ayah-num bg-opacity-75 bg-gradient fw-light">Hilali</span> ${v.english}
           <button class="btn btn-sm small border-0 icon-copy"
            data-copy="${v.english.replace(/"/g, '&quot;')}"
            onclick="copyTextFromData(this)">
           </button>
      </p>
        <div class="d-flex justify-content-between mt-3 mb-3">          
           <div>
            ${commentaryLinks}
           </div>
           <div>
            <button class="btn btn-sm border-0" type="button" data-bs-toggle="collapse" data-bs-target="#${v.chapter}-${v.verse}" aria-expanded="false" aria-controls="${v.chapter}-${v.verse}">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16"><path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/></svg>
            </button>
           </div>
         </div>
        ${shareHTML}
    </div>
  `;
}).join("");

let paginationHtml = `
  <nav class="mt-4 d-flex justify-content-between">
    ${pageParam > 1 ? `<a class="btn btn-outline" href="?verse=${chapterId}&page=${pageParam - 1}">&laquo; Previous</a>` : "<span></span>"}
    <div class="align-self-center">Page ${pageParam} of ${totalPages}</div>
    ${pageParam < totalPages ? `<a class="btn btn-outline" href="?verse=${chapterId}&page=${pageParam + 1}">Next &raquo;</a>` : ""}
  </nav>
`;
          content.innerHTML = `
          ${breadcrumbHtml}
          <h2 class="surah-name-arabic me-2 text-center fs-1 d-none">surah${String(chapterId).padStart(3, '0')}</h2>
          <div class="text-center m-0 p-0" id="surah-svg-${chapterId}"></div>
          <h3 class="text-center m-0 p-0">${name.transliteration} (${name.english})</h3>
          <h4 class="text-center m-0 p-0">${verseCount} Verses</h4>
            <div class="card border-0">
              <div class="card-body">
                ${chapterHtml}
              </div>
            </div>
            ${paginationHtml}
          `;
          document.title = `Surah ${name.transliteration}`;
          initializeCopyIcons();
          initializeAudioIcons();

const svgContainer = document.getElementById(`surah-svg-${chapterId}`);
fetch(`/quran/assets/svg/${chapterId}.svg`)
  .then(res => {
    if (!res.ok) throw new Error(`Failed to load SVG ${chapterId}`);
    return res.text();
  })
  .then(svg => {
    if (document.body.classList.contains('dark-theme')) {
      svg = svg.replace(/fill="[^"]*"/g, 'fill="#ffffff"');
    }
    // Force size (optional: adjust numbers as needed)
    svg = svg
      .replace(/width="[^"]*"/i, 'width="100"')
      .replace(/height="[^"]*"/i, 'height="100"')
      .replace(/viewBox="[^"]*"/i, match => match || 'viewBox="0 0 100 100"'); // fallback
    svgContainer.innerHTML = svg;
  })
  .catch(err => {
    console.error(err);
    svgContainer.textContent = `#${chapterId}`;
  });
  });
        }
      } else {
        const chapters = [...new Set(
          verses
            .filter(v => !isNaN(v.chapter))
            .map(v => v.chapter)
        )];

content.innerHTML = ""; // clear loading

chapters.forEach(ch => {
  const name = surahNames[ch] || {};
  const isMufassal = ch >= 50 && ch <= 114;

  if (filterType === "Meccan" && name.type !== "Meccan") return;
  if (filterType === "Medinan" && name.type !== "Medinan") return;
  if (filterType === "Mufassal" && !isMufassal) return;

  const verseCount = verses.filter(v => v.chapter === ch).length;
  const col = document.createElement("div");
  col.className = "col-12 col-sm-6 col-lg-4 d-flex";
  col.innerHTML = `
  <div class="card flex-fill h-100 shadow-sm card-hover">
    <a href="?verse=${ch}" class="card-body text-decoration-none p-0 m-0" title="Surah ${name.transliteration}">
      <div class="d-flex">
        <div class="pe-3 w-100">
          <p class="badge badge-primary rounded-fill">${ch}</p>
          <h5 class="m=0 p-0 h6 fw-bold">${name.transliteration}</h5>
          <p class="mb-0 m-0 p-0 small en-verse">${name.english || ""}</p>
        </div>
        <div class="ps-1 flex-shrink-0 align-self-center text-center justify-content-center">
         <div id="surah-svg-${ch}"></div>
         <p class="text-muted small verse-count">${verseCount} Ayah${verseCount > 1 ? 's' : ''}</p>
         <p class="small text-muted m-0 p-0 d-none">${name.type}</p>
        </div>
      </div>
    </a>
  </div>
  `;
  content.appendChild(col);
  const svgContainer = col.querySelector(`#surah-svg-${ch}`);
  fetch(`/quran/assets/svg/${ch}.svg`)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load SVG ${ch}`);
      return res.text();
    })
    .then(svg => {
    if (document.body.classList.contains('dark-theme')) {
      svg = svg.replace(/fill="[^"]*"/g, 'fill="#ffffff"');
    }
      svgContainer.innerHTML = svg;
    })
    .catch(err => {
      console.error(err);
      svgContainer.textContent = `#${ch}`; // fallback text
    });
 });
  document.title = "Al-Quran Al-Karim";
      }
    })
    .catch(err => {
      console.error("Error loading Quran text:", err);
      content.innerHTML = `<p>Error loading Quran text files.</p>`;
    });
// === END QURAN surahs, verses, etc === //

// === BEGIN COPY === //
function copyTextFromData(btn) {
  const text = btn.getAttribute("data-copy");
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
           fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 
                 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 
                 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
      </svg> Copied`;
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
    }, 1500);
  });
}
function insertCopyIcon(btn) {
  const icon = document.createElement("span");
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
         fill="currentColor" class="bi bi-copy me-1" viewBox="0 0 16 16">
      <path fill-rule="evenodd"
            d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 
            1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 
            0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 
            2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
    </svg>`;
  // Only prepend if not already injected
  if (!btn.querySelector("svg")) {
    btn.prepend(icon);
  }
}
function initializeCopyIcons() {
  document.querySelectorAll(".icon-copy").forEach(insertCopyIcon);
}
// === END OF COPY === //

// === BEGIN AUDIO === //
function insertAudioIcon(btn) {
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
         fill="currentColor" class="bi bi-play-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093
               A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407
               l3.5-2.5a.5.5 0 0 0 0-.814z"/>
    </svg>`;
}
function initializeAudioIcons() {
  document.querySelectorAll(".icon-audio").forEach(insertAudioIcon);
}
function toggleAudio(audioId, btn) {
  const audio = document.getElementById(audioId);
  if (!audio) return;

  // Pause all other audio players
  document.querySelectorAll('audio').forEach(a => {
    if (a !== audio) a.pause();
  });

  if (audio.paused) {
    audio.play();
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
        class="bi bi-pause-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 
        2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 
        2.5 0v-3.5C11 5.56 10.44 5 9.75 5"/>
      </svg>`;
  } else {
    audio.pause();
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
        class="bi bi-play-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 
        5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/>
      </svg>`;
  }

  audio.onended = () => {
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
        class="bi bi-play-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 
        5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/>
      </svg>`;
  };
}
// === END OF AUDIO === //

function formatTafsir(text) {
  if (!text) return "";
  return text
    .replace(/#/g, "<br><br>")
    .replace(/\*([^*]+)\*/g, '“<strong>$1</strong>”')
    .replace(/\\n/g, "\n")
    .replace(/\\+"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/\n/g, "<br><br>");
}
function renderAudioButton(chapter, verse) {
  const pad = (n) => String(n).padStart(3, '0');
  const id = `audio-${chapter}-${verse}`;
  const src = `https://everyayah.com/data/Nasser_Alqatami_128kbps/${pad(chapter)}${pad(verse)}.mp3`;
  return `
    <audio id="${id}" src="${src}"></audio>
    <button class="btn btn-sm border-0 play icon-audio" onclick="toggleAudio('${id}', this)"></button>
  `;
}

function generateSocialShareHTML(chapter, verse) {
  const shareUrl = `${location.origin}${location.pathname}?verse=${chapter}:${verse}`;
  const encodedUrl = encodeURIComponent(shareUrl);

  return `
<div class="collapse mb-2" id="${chapter}-${verse}">
  <div class="card card-body">
    <div>
      <h6>Share on:</h6>

      <a class="btn btn-primary btn-sm mt-1 small" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-facebook" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/></svg> Facebook 
      </a>

      <a class="btn btn-primary btn-sm mt-1 small" href="https://twitter.com/intent/tweet?url=${encodedUrl}" target="_blank" rel="noopener">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-twitter-x" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg> Twitter
      </a>

      <a class="btn btn-primary btn-sm mt-1 small" href="https://www.threads.net/intent/post?url=${encodedUrl}" target="_blank" rel="noopener">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-threads" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/></svg> Threads
      </a>

      <a class="btn btn-primary btn-sm mt-1 small" href="https://t.me/share/url?url=${encodedUrl}" target="_blank" rel="noopener">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telegram" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/></svg> Telegram
      </a>

      <a class="btn btn-primary btn-sm mt-1 small" href="https://wa.me/?text=${encodedUrl}" target="_blank" rel="noopener">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg> WhatsApp
      </a>

      <button class="btn border-0 icon-copy"
        data-copy="${shareUrl}"
        onclick="copyTextFromData(this)">
        <span class="ayah-url-copy">Ayah URL</span>
      </button>
    </div>
  </div>
</div>
  `;
}