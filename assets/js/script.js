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
if (ar.chapter !== 1 && ar.chapter !== 9 && arabicText.startsWith("بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ")) {
  const parts = arabicText.split("بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ");
  basmalah = "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ";
  arabicText = parts[1].trim();
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
  { start: "1:1", end: "2:141" },
  { start: "2:142", end: "2:252" },
  { start: "2:253", end: "3:92" },
  { start: "3:93", end: "4:23" },
  { start: "4:24", end: "4:147" },
  { start: "4:148", end: "5:81" },
  { start: "5:82", end: "6:110" },
  { start: "6:111", end: "7:87" },
  { start: "7:88", end: "8:40" },
  { start: "8:41", end: "9:92" },
  { start: "9:93", end: "11:5" },
  { start: "11:6", end: "12:52" },
  { start: "12:53", end: "14:52" },
  { start: "15:1", end: "16:128" },
  { start: "17:1", end: "18:74" },
  { start: "18:75", end: "20:135" },
  { start: "21:1", end: "22:78" },
  { start: "23:1", end: "25:20" },
  { start: "25:21", end: "27:55" },
  { start: "27:56", end: "29:45" },
  { start: "29:46", end: "33:30" },
  { start: "33:31", end: "36:27" },
  { start: "36:28", end: "39:31" },
  { start: "39:32", end: "41:46" },
  { start: "41:47", end: "45:37" },
  { start: "46:1", end: "51:30" },
  { start: "51:31", end: "57:29" },
  { start: "58:1", end: "66:12" },
  { start: "67:1", end: "77:50" },
  { start: "78:1", end: "114:6" }
];

if (viewParam === "juz" && !urlParams.get("juz")) {
  content.innerHTML = `<h4 class="mb-4">📖 Juz Index</h4>`;
  juzRanges.forEach((range, i) => {
    content.innerHTML += `
      <div class="mb-2">
        <a href="?view=juz&juz=${i + 1}" class="btn btn-outline-primary w-100 text-start">
          📘 Juz ${i + 1} (${range.start} – ${range.end})
        </a>
      </div>`;
  });
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
        <h4 class="mb-4">Juz ${juzId} (${range.start} – ${range.end})</h4>`;

      paginated.forEach(v => {
        const name = surahNames[v.surah] || { transliteration: "" };
        const translation = englishVerses.find(e => e.chapter === v.surah && e.verse === v.ayah)?.text || "";
        content.innerHTML += `
          <div class="mb-3 border-bottom pb-2">
            <div class="text-muted small mb-1"><a href="?verse=${v.surah}:${v.ayah}" class="text-decoration-none">Surah ${v.surah}:${v.ayah} (${name.transliteration})</a></div>
            <div class="fs-5 arabic">${v.text}</div>
            <div class="english">${translation}</div>
          </div>`;
      });

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
    <table class="table table-hover">
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
    </table>`;
  document.title = "Tafsir Index";
  return;
}

// === BEGIN TAFSIR HANDLER === //
const tafsirSources = {
  "saadi-en": { type: "txt", file: "/quran/assets/data/tafsir.saadi.txt" },
  "saadi-ar": { type: "json", path: "/quran/assets/data/tafsirs/saadi-ar" },
  "saadi-ru": { type: "json", path: "/quran/assets/data/tafsirs/saadi-ru" },
  "kathir-en": { type: "json", path: "/quran/assets/data/tafsirs/ibn-kathir" }
};

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
              <div class="english">${data.text}</div>
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
        <div>
          <a href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${cid}" class="w-100 text-start">
            Surah ${cid} (${n.transliteration})
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
            <a href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${e.chapter}:${e.rangeStr}" class="list-group-item list-group-item-action">
              Ayah ${e.rangeStr}
            </a>`;
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
          <div>
            <a href="?view=tafsirs&author=${authorParam}&lang=${langParam}&verse=${cid}" class="w-100 text-start">
              Surah ${cid} (${n.transliteration})
            </a>
          </div>`;
      });
      document.title = `${titleParam}`;
    });
  return;
}
// === END TAFSIR HANDLER === //


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

if (searchQuery) {
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
     <audio id="audio-${v.chapter}-${v.verse}" src="https://everyayah.com/data/Nasser_Alqatami_128kbps/${pad(v.chapter)}${pad(v.verse)}.mp3"></audio>
     <button class="btn btn-sm border-0 play icon-audio" onclick="toggleAudio('audio-${v.chapter}-${v.verse}', this)">
     </button>
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
     <audio id="audio-${v.chapter}-${v.verse}" src="https://everyayah.com/data/Nasser_Alqatami_128kbps/${pad(v.chapter)}${pad(v.verse)}.mp3"></audio>
     <button class="btn btn-sm border-0 play icon-audio" onclick="toggleAudio('audio-${v.chapter}-${v.verse}', this)">
     </button>
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

      if (verseParam) {
        const [chapterIdStr, verseIdStr] = verseParam.split(":");
        const chapterId = parseInt(chapterIdStr);
        const verseId = verseIdStr ? parseInt(verseIdStr) : null;

if (verseId) {
  const verse = verses.find(v => v.chapter === chapterId && v.verse === verseId);
  const name = surahNames[chapterId] || { transliteration: "", arabic: "" };

  if (verse) {
    const pad = (n) => String(n).padStart(3, '0');
    const audioURL = `https://everyayah.com/data/Nasser_Alqatami_128kbps/${pad(verse.chapter)}${pad(verse.verse)}.mp3`;
    const prev = verses.find(v => v.chapter === chapterId && v.verse === verseId - 1);
    const next = verses.find(v => v.chapter === chapterId && v.verse === verseId + 1);
    const name = surahNames[chapterId] || { transliteration: "", arabic: "" };

    content.innerHTML = `
      ${breadcrumbHtml}           
      <div class="card border-0">
        <div class="card-body">
          <h3 class="surah-name-arabic me-2 text-center fs-1">surah${String(verse.chapter).padStart(3, '0')}</h3>
          <h3 class="text-center">${name.transliteration} (${name.english})</h3>
          <p><a role="button" href="?verse=${verse.chapter}:${verse.verse}" class="text-decoration-none btn btn-sm ayah-link">${verse.chapter}:${verse.verse}</a></p>
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
${viewParam === 'tafsir' ? `
  <p class="mb-1 mt-3 english">
    <span class="small fw-bold">Tafsir As-Sa'di:</span> <br>
    ${formatTafsir(verse.tafsir)}
  </p>
` : `

`}
          <div class="btn-group mt-3">
           <audio id="audio-${verse.chapter}-${verse.verse}" src="${audioURL}"></audio>
           <button class="btn btn-sm rounded border-0 play icon-audio"
            onclick="toggleAudio('audio-${verse.chapter}-${verse.verse}', this)">
           </button>
           <button class="btn btn-sm small border-0 icon-copy"
            data-copy="${location.href}"
            onclick="copyTextFromData(this)">
            <span class="ayah-url-copy">Ayah URL</span>
           </button>
${verse.tafsir && verse.tafsir !== "(No tafsir available)" ? `
  <a href="?verse=${verse.chapter}:${verse.verse}&view=tafsir" class="btn btn-sm border-0">
    <i class="bi bi-book"></i> Tafsir
  </a>
` : ""}
          </div>
        </div>
      </div>
<nav aria-label="Verse navigation">
  <ul class="pagination justify-content-center my-5 flex-wrap gap-2">
    <li class="page-item ${!prev ? 'disabled' : ''}">
      <a class="page-link d-flex align-items-center gap-2 px-3 rounded shadow-sm" href="?verse=${prev?.chapter}:${prev?.verse}" tabindex="-1">
        <i class="bi bi-arrow-left-circle"></i>
        <span>Previous</span>
        ${prev ? `<small class="text-muted">${prev.chapter}:${prev.verse}</small>` : ""}
      </a>
    </li>
    <li class="page-item ${!next ? 'disabled' : ''}">
      <a class="page-link d-flex align-items-center gap-2 px-3 rounded text-white shadow-sm" href="?verse=${next?.chapter}:${next?.verse}">
        <span>Next</span>
        ${next ? `<small class="text-white-50">${next.chapter}:${next.verse}</small>` : ""}
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
          const chapterHtml = paginatedVerses.map(v => {
          const pad = (n) => String(n).padStart(3, '0');
          const audioURL = `https://everyayah.com/data/Nasser_Alqatami_128kbps/${pad(v.chapter)}${pad(v.verse)}.mp3`;

  let basmalahHTML = "";
  if (v.basmalah && v.basmalah.trim() !== "") {
    basmalahHTML = '<p class="mb-5 arabic fw-semibold text-center">' + v.basmalah + '</p>';
  }

  return `
    <div class="verse-block p-0 mb-0 mt-3">
      ${basmalahHTML} 
      <p><a role="button" href="?verse=${v.chapter}:${v.verse}" class="text-decoration-none btn btn-sm ayah-link">${v.chapter}:${v.verse}</a></p>
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
        <div class="btn-group mt-3 mb-3">
        <audio id="audio-${v.chapter}-${v.verse}" src="https://everyayah.com/data/Nasser_Alqatami_128kbps/${pad(v.chapter)}${pad(v.verse)}.mp3"></audio>
        <button class="btn btn-sm border-0 play icon-audio"
         onclick="toggleAudio('audio-${v.chapter}-${v.verse}', this)">
        </button>
           <button class="btn btn-sm small border-0 icon-copy"
            data-copy="${location.href}"
            onclick="copyTextFromData(this)">
             <span class="ayah-url-copy">Ayah URL</span>
           </button>
        </div>
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
          <h2 class="surah-name-arabic me-2 text-center fs-1">surah${String(chapterId).padStart(3, '0')}</h2>
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
  <div class="card flex-fill h-100 shadow-sm surah-list">
    <a href="?verse=${ch}" class="card-body text-decoration-none p-0 m-0">
      <div class="d-flex">
        <div class="pe-2 w-100">
          <h5 class="card-title mb-1 small">${ch}. ${name.transliteration}</h5>
          <p class="card-text mb-0 small">${name.english || ""}</p>
          <div class="d-flex justify-content-start">
          <small class="text-muted">${verseCount} Ayah${verseCount > 1 ? 's' : ''}</small><br>
          <small class="text-muted" style="margin-left:5px;">${name.type}</small>
          </div>
        </div>
        <div class="ps-2 flex-shrink-0 align-self-center surah-name-arabic">surah${String(ch).padStart(3, '0')}</div>
      </div>
    </a>
  </div>
  `;
  content.appendChild(col);
});

document.title = "Al-Quran";
      }
    })
    .catch(err => {
      console.error("Error loading Quran text:", err);
      content.innerHTML = `<p>Error loading Quran text files.</p>`;
    });

const [chapterIdStr, verseIdStr] = (verseParam || "").split(":");
const chapterId = parseInt(chapterIdStr);
const verseId = verseIdStr ? parseInt(verseIdStr) : null;
let breadcrumbHtml = "";
if (verseParam) {
  breadcrumbHtml = `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/quran/" class="text-decoration-none text-success">Home</a></li>
        <li class="breadcrumb-item"><a href="?verse=${chapterId}" class="text-decoration-none text-success">Surah ${chapterId}</a></li>
${verseId !== null ? `
  <li class="breadcrumb-item active" aria-current="page">
    ${viewParam === 'tafsir' ? `Tafsir of Surah ${chapterId}:${verseId}` : `Surah ${chapterId}:${verseId}`}
  </li>
` : ""}
      </ol>
    </nav>
  `;
}

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

function formatTafsir(text) {
  if (!text) return "";

  return text
    .replace(/#/g, "<br><br>")
    .replace(/\*([^*]+)\*/g, '“<strong>$1</strong>”')
    .replace(/\\n/g, "\n")           // Convert escaped newlines to real line breaks
    .replace(/\\+"/g, '"')           // Replace escaped double quotes
    .replace(/\\\\/g, "\\")          // Handle double backslashes
    .replace(/\n/g, "<br><br>");         // Optionally convert line breaks to <br> in HTML
}
function cleanTafsirText(text) {
  return text
    .replace(/\\n/g, '\n')    // Convert escaped newlines to real line breaks
    .replace(/\\r/g, '')      // Remove carriage returns
    .replace(/\\t/g, ' ')     // Convert tabs to space
    .replace(/\\\\/g, '\\')   // Replace double backslashes with single
    .replace(/\\"/g, '"')     // Replace escaped quotes
    .replace(/\\'/g, "'");    // Replace escaped single quotes
}
