const emailCharCodes = [106, 97, 109, 101, 115, 64, 100, 97, 110, 100, 114, 105, 100, 103, 101, 46, 99, 111, 109];

function decodeEmail() {
  return String.fromCharCode(...emailCharCodes);
}

const imageMarkerPattern = /^\[\[image:\s*([^|]+?)\s*\|\s*(.+?)\s*\]\]$/i;

function renderExcerpt(text, container) {
  const blocks = text
    .split(/\r?\n\s*\r?\n/)
    .map(block => block.trim())
    .filter(Boolean);

  container.innerHTML = '';

  blocks.forEach(block => {
    if (/^\*+$/u.test(block)) {
      const divider = document.createElement('div');
      divider.className = 'section-divider';
      divider.textContent = '•';
      container.appendChild(divider);
      return;
    }

    const imageMatch = block.match(imageMarkerPattern);
    if (imageMatch) {
      const [, src, caption] = imageMatch;
      const figure = document.createElement('figure');
      figure.className = 'excerpt-figure';

      const img = document.createElement('img');
      img.src = src;
      img.alt = caption;
      img.loading = 'lazy';

      const figcaption = document.createElement('figcaption');
      figcaption.textContent = caption;

      figure.appendChild(img);
      figure.appendChild(figcaption);
      container.appendChild(figure);
      return;
    }

    const paragraph = document.createElement('p');
    paragraph.textContent = block.replace(/\*+/g, '');
    container.appendChild(paragraph);
  });
}

function loadExcerpt(url, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  fetch(url, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Excerpt file not found');
      }
      return response.text();
    })
    .then(text => renderExcerpt(text, container))
    .catch(error => {
      container.innerHTML = '<p>Unable to load the excerpt at this time. Please try again later.</p>';
      console.error(error);
    });
}

loadExcerpt('excerpt.txt', 'excerpt-content');
loadExcerpt('excerpt-2.txt', 'excerpt-2-content');
loadExcerpt('excerpt-3.txt', 'excerpt-3-content');

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const recipient = decodeEmail();
    const subject = encodeURIComponent(`Website message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
}
