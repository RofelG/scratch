const canvas = document.createElement('canvas');
const overlay = document.querySelector('.scratch-card__overlay');
overlay.appendChild(canvas);

const ctx = canvas.getContext('2d');
let isDrawing = false;

// Set canvas size to match the overlay
canvas.width = overlay.offsetWidth;
canvas.height = overlay.offsetHeight;

// Fill the canvas with a gray overlay
ctx.fillStyle = '#D2F3F9';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Ensure the canvas allows transparency
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '1';
overlay.style.position = 'relative';
overlay.style.zIndex = '2';

// Listen for mouse and touch events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', scratch);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', scratch);
canvas.addEventListener('touchend', stopDrawing);

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

    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

function resetScratchCard() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#D2F3F9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Optional: Reset the scratch card
if (document.getElementById('reset')) {
    document.getElementById('reset').addEventListener('click', () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#D2F3F9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
}

// Attach event listeners to all buttons with the class 'btn'
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', event => {
        // Get the data-id attribute from the clicked button
        const dataId = event.target.getAttribute('data-id');

        // Call your API endpoint with the data-id as a query parameter
        fetch(`/API/content?id=${dataId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Assume the API returns JSON in the format { content: "New content here" }
                document.querySelector('.scratch-card__code').innerText = data.content;
                
                // Optionally, reset the scratch card overlay so users can scratch to reveal the new content
                resetScratchCard();
            })
            .catch(error => {
                console.error('Error fetching content:', error);
            });
    });
});