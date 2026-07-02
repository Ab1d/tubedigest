const TUBEDIGEST_URL = "http://localhost:3000";

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function renderEmptyState() {
  document.getElementById("root").innerHTML = `
    <div class="popup">
      <div class="header">
        <img src="icons/icon32.png" alt="TubeDigest" />
        <h1>Tube<span>Digest</span></h1>
      </div>
      <div class="empty-state">
        <h2>Not on YouTube</h2>
        <p>Navigate to a YouTube video page, then click this icon again to summarize it instantly.</p>
      </div>
    </div>
  `;
}

function renderVideoCard(tab) {
  const videoId = extractVideoId(tab.url);
  if (!videoId) {
    renderEmptyState();
    return;
  }

  const thumbnail = getThumbnail(videoId);
  const title = tab.title?.replace(/ - YouTube$/, "") || "YouTube Video";

  document.getElementById("root").innerHTML = `
    <div class="popup">
      <div class="header">
        <img src="icons/icon32.png" alt="TubeDigest" />
        <h1>Tube<span>Digest</span></h1>
      </div>
      <div class="video-card">
        <img src="${thumbnail}" alt="${title}" />
        <div class="video-info">
          <h2>${title}</h2>
          <p>${tab.url}</p>
        </div>
      </div>
      <button id="summarizeBtn" class="btn btn-primary">
        Summarize Video
      </button>
      <button id="openAppBtn" class="btn btn-secondary">
        Open TubeDigest
      </button>
    </div>
  `;

  document.getElementById("summarizeBtn").addEventListener("click", () => {
    const btn = document.getElementById("summarizeBtn");
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner"></div> Opening...`;
    const encoded = encodeURIComponent(tab.url);
    window.open(`${TUBEDIGEST_URL}/?url=${encoded}`, "_blank");
    setTimeout(() => window.close(), 300);
  });

  document.getElementById("openAppBtn").addEventListener("click", () => {
    window.open(TUBEDIGEST_URL, "_blank");
    window.close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && (tab.url.includes("youtube.com") || tab.url.includes("youtu.be"))) {
      renderVideoCard(tab);
    } else {
      renderEmptyState();
    }
  });
});
