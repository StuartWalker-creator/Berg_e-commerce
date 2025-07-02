export default function showPopupMessage(message, type = 'info', duration = 3000) {
    const popup = document.createElement('div');
    popup.className = `popup-message popup-${type}`;
    popup.innerText = message;

    document.body.appendChild(popup);

    // Trigger animation
    requestAnimationFrame(() => {
      popup.classList.add('popup-show');
    });

    // Auto-remove
    setTimeout(() => {
      popup.classList.remove('popup-show');
      popup.addEventListener('transitionend', () => {
        popup.remove();
      });
    }, duration);
  }
