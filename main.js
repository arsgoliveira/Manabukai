document.addEventListener('DOMContentLoaded', () => {
  const torii = document.getElementById('torii');
  if (torii) {
    torii.addEventListener('click', () => {
      window.location.href = 'home.html';
    });
  }
});
