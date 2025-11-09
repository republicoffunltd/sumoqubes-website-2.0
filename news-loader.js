// News loader for homepage and news page
const NEWS_STORAGE_KEY = 'sumo_qubes_news';
const REMOVED_NEWS_KEY = 'sumo_qubes_news_removed';

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatTitleHtml(title) {
  const safe = (title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return safe.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
}

function getRemovedSlugs() {
  try {
    const stored = localStorage.getItem(REMOVED_NEWS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (error) {
    console.warn('Unable to read removed article slugs:', error);
    return [];
  }
}

function getArticleSlug(article) {
  if (!article) return '';
  if (article.slug) return article.slug;
  const plainTitle = stripHtml(article.title || '');
  return plainTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getArticlesFromLocalStorage() {
  try {
    const stored = localStorage.getItem(NEWS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to read local news articles:', error);
    return [];
  }
}

async function getArticlesFromJson() {
  try {
    const response = await fetch('news-articles.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = await response.json();
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to load news-articles.json:', error);
    return [];
  }
}

function mergeArticles(primary = [], secondary = []) {
  const map = new Map();
  primary.forEach(article => {
    const slug = getArticleSlug(article);
    if (!slug) return;
    map.set(slug, { ...article, slug });
  });
  secondary.forEach(article => {
    const slug = getArticleSlug(article);
    if (!slug) return;
    map.set(slug, { ...article, slug });
  });
  return Array.from(map.values());
}

async function loadNews(limit = null) {
  const [jsonArticles, localArticles] = await Promise.all([
    getArticlesFromJson(),
    Promise.resolve(getArticlesFromLocalStorage())
  ]);

  let articles = mergeArticles(jsonArticles, localArticles);

  const removedSlugs = new Set(getRemovedSlugs());
  if (removedSlugs.size) {
    articles = articles.filter(article => !removedSlugs.has(getArticleSlug(article)));
  }

  if (!articles.length && localArticles.length) {
    articles = localArticles.map(article => ({ ...article, slug: getArticleSlug(article) }));
  }

  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (limit) {
    articles = articles.slice(0, limit);
  }

  return articles;
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function createNewsCard(article, linkToArticle = false) {
  const slug = getArticleSlug(article);
  const card = document.createElement('div');
  card.className = 'news-item';

  const title = document.createElement('h3');
  title.className = 'news-subheader';
  title.innerHTML = formatTitleHtml(article.title);
  card.appendChild(title);

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'news-image-wrapper';

  const image = document.createElement('img');
  image.src = article.image;
  const plainTitle = stripHtml(article.title || '');
  image.alt = plainTitle || 'News image';
  image.loading = 'lazy';

  imageWrapper.appendChild(image);

  const moreButton = document.createElement('button');
  moreButton.className = 'news-more';
  moreButton.textContent = '+';

  moreButton.onclick = () => {
    const target = linkToArticle ? `/article.html?slug=${slug}` : `article.html?slug=${slug}`;
    window.location.href = target;
  };

  imageWrapper.appendChild(moreButton);
  card.appendChild(imageWrapper);

  return card;
}

// Load news for homepage (latest 4 articles)
async function loadHomeNews() {
  const newsGrid = document.querySelector('.news-grid');
  if (!newsGrid) return;
  
  const articles = await loadNews(4);
  
  if (articles.length === 0) {
    newsGrid.innerHTML = '<p style="color: white; text-align: center; width: 100%;">No news articles found. Add some in the CMS!</p>';
    return;
  }
  
  newsGrid.innerHTML = '';
  articles.forEach(article => {
    newsGrid.appendChild(createNewsCard(article, false));
  });
}

// Load all news for news page
async function loadAllNews() {
  const newsGrid = document.getElementById('newsGrid');
  if (!newsGrid) return;
  
  const articles = await loadNews();
  
  if (articles.length === 0) {
    newsGrid.innerHTML = '<p class="no-news">No news articles found yet. Check back soon!</p>';
    return;
  }
  
  newsGrid.innerHTML = '';
  articles.forEach(article => {
    newsGrid.appendChild(createNewsCard(article, true));
  });
}

// Auto-load based on page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNews);
} else {
  initNews();
}

function initNews() {
  // Check if we're on the homepage
  if (document.querySelector('.news') && document.querySelector('.banner')) {
    loadHomeNews();
  }
  // Check if we're on the news page
  else if (document.querySelector('.news-page')) {
    loadAllNews();
  }
}
