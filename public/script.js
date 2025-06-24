const shortenedUrls = [];

async function shortenUrl() {
  const longUrl = document.getElementById("longUrl").value;
  if (!longUrl.trim()) return;

  const response = await fetch("/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: longUrl }),
  });

  const data = await response.json();
  if (data.shortId) {
    const shortLink = `${window.location.origin}/${data.shortId}`;
    shortenedUrls.push({
      shortId: data.shortId,
      longUrl,
      shortLink,
      analytics: null,
    });
    renderUrls();
    document.getElementById("longUrl").value = "";
  }
}

async function fetchAnalytics(index) {
  const { shortId } = shortenedUrls[index];
  const response = await fetch(`/url/analytics/${shortId}`);
  const data = await response.json();

  shortenedUrls[index].analytics = data;
  renderUrls();
}

function renderUrls() {
  const container = document.getElementById("shortenedUrlsContainer");
  container.innerHTML = "";

  shortenedUrls.forEach((urlData, index) => {
    const card = document.createElement("div");
    card.className = "url-card";
    card.innerHTML = `
      <p><strong>Original URL:</strong> ${urlData.longUrl}</p>
      <p><strong>Short URL:</strong> <a href="${urlData.shortLink}" target="_blank">${urlData.shortLink}</a></p>
      <button onclick="fetchAnalytics(${index})">View Analytics</button>
    `;

    if (urlData.analytics) {
      const analyticsDiv = document.createElement("div");
      analyticsDiv.className = "analytics";
      const clicks = urlData.analytics.totalClicks;
      const historyItems = urlData.analytics.visitHistory
        .map((v) => `<li>${new Date(v.timestamp).toLocaleString()}</li>`)
        .join("");

      analyticsDiv.innerHTML = `
        <p><strong>Total Clicks:</strong> ${clicks}</p>
        <ul>${historyItems}</ul>
      `;
      card.appendChild(analyticsDiv);
    }

    container.appendChild(card);
  });
}
