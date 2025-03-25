function createScratchCanvas(overlay) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size to match the overlay
  canvas.width = overlay.offsetWidth;
  canvas.height = overlay.offsetHeight;

  // Fill the canvas with a gray overlay
  ctx.fillStyle = '#D2F3F9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Style canvas
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '1';

  // Style overlay
  overlay.style.position = 'relative';
  overlay.style.zIndex = '2';

  overlay.appendChild(canvas);

  let isDrawing = false;

  function startDrawing(e) {
      isDrawing = true;
      scratch(e);
  }

  function stopDrawing() {
      isDrawing = false;
      ctx.beginPath();
  }

  function scratch(e) {
      if (!isDrawing) return;

      e.preventDefault(); // prevent scrolling on touch
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', scratch);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', scratch, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);

  return () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#D2F3F9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
}

// When page loads, attach canvas to existing overlay (if any)
document.querySelectorAll('.scratch-card__overlay').forEach(overlay => {
  createScratchCanvas(overlay);
});

// Handle content loading
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', event => {
      const dataId = event.target.getAttribute('data-id');
      const main = document.querySelector('main');

      // Remove old cards
      document.querySelectorAll('.scratch-container:not(#scratchTemplate)').forEach(s => s.remove());

      // Add a loading spinner
      const spinner = document.getElementById('spinner-wrapper');
      spinner.classList.add('active'); // fade in

      // Wait for spinner to fade in before fetching content
      const handleTransitionEnd = () => {
        // Remove the event listener so it doesn't fire multiple times
        spinner.removeEventListener('transitionend', handleTransitionEnd);

        // Now fetch your content
        fetch(`/API/content?id=${dataId}`)
          .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
          })
          .then(data => {
            const renderCard = (item) => {
              const template = document.querySelector('#scratchTemplate');
              const clone = template.cloneNode(true);
              clone.removeAttribute('id');

              const content = clone.querySelector('.scratch-card__content');
              content.innerHTML = '';

              if (item.image) {
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('scratch-card__img');

                const img = document.createElement('img');
                img.src = `/img/${item.image}`;
                img.alt = item.content;
                imgContainer.appendChild(img);

                content.appendChild(imgContainer);
              }

              const code = document.createElement('div');
              code.classList.add('scratch-card__code');
              code.innerText = item.content;
              content.appendChild(code);

              const category = clone.querySelector('.scratch-card__category');
              category.innerText = item.category.charAt(0).toUpperCase() + item.category.slice(1);

              main.appendChild(clone);

              const overlay = clone.querySelector('.scratch-card__overlay');
              if (overlay) {
                overlay.innerHTML = '';
                createScratchCanvas(overlay);
              }
            };

            if (dataId === 'all') {
              data.forEach(renderCard);
            } else {
              renderCard(data);
            }

            // Fade out spinner after a small delay (optional)
            setTimeout(() => {
              spinner.classList.remove('active');
            }, 100); // adjust delay if needed
          })
          .catch(error => {
            console.error('Error fetching content:', error);
            spinner.classList.remove('active');
          });
      };

      // Wait for fade-in transition to finish
      spinner.addEventListener('transitionend', handleTransitionEnd);
  });
});

// Reset button logic
const resetBtn = document.getElementById('reset');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
      document.querySelectorAll('.scratch-card__overlay canvas').forEach(canvas => {
          const ctx = canvas.getContext('2d');
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = '#D2F3F9';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
  });
}
