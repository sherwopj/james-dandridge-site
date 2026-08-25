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

      const link = document.createElement('a');
      link.href = src;
      link.className = 'img-link';
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', 'View full-size image');

      const img = document.createElement('img');
      img.src = src;
      img.alt = caption;
      img.loading = 'lazy';

      const figcaption = document.createElement('figcaption');
      figcaption.textContent = caption;

      link.appendChild(img);
      figure.appendChild(link);
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
const contactStatus = document.getElementById('contact-status');

if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();

    // Honeypot: if this hidden field got filled in, silently drop the submission.
    if (contactForm.botcheck && contactForm.botcheck.checked) {
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const payload = Object.fromEntries(new FormData(contactForm).entries());

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    if (contactStatus) {
      contactStatus.textContent = '';
      contactStatus.className = 'contact-status';
    }

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        if (!data.success) {
          throw new Error(data.message || 'Submission failed');
        }
        contactForm.reset();
        if (contactStatus) {
          contactStatus.textContent = 'Thank you — your message has been sent.';
          contactStatus.classList.add('success');
        }
      })
      .catch(error => {
        console.error(error);
        if (contactStatus) {
          contactStatus.textContent = 'Sorry, something went wrong sending your message. Please try again shortly.';
          contactStatus.classList.add('error');
        }
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Send message';
      });
  });
}
