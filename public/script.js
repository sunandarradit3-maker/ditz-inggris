// Client‑side JavaScript for DiTz Store
// Handles translation form submission and updates results dynamically.

document.addEventListener('DOMContentLoaded', () => {
  const translateForm = document.getElementById('translateForm');
  const wordInput = document.getElementById('wordInput');
  const languageSelect = document.getElementById('languageSelect');
  const resultDiv = document.getElementById('translationResult');

  // Translate word when the form is submitted
  translateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const word = wordInput.value.trim().toLowerCase();
    const lang = languageSelect.value;
    if (!word || !lang) {
      resultDiv.textContent = 'Please enter a word and select a language.';
      return;
    }
    try {
      const response = await fetch(`/api/translate?word=${encodeURIComponent(word)}&lang=${encodeURIComponent(lang)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.error) {
        resultDiv.textContent = data.error;
        resultDiv.classList.remove('text-success');
        resultDiv.classList.add('text-danger');
      } else {
        resultDiv.textContent = `"${data.word}" in ${languageSelect.options[languageSelect.selectedIndex].text} is "${data.translation}".`;
        resultDiv.classList.remove('text-danger');
        resultDiv.classList.add('text-success');
      }
    } catch (error) {
      resultDiv.textContent = 'Error retrieving translation.';
      resultDiv.classList.remove('text-success');
      resultDiv.classList.add('text-danger');
    }
  });
});