document.getElementById('copy').addEventListener('click', async () => {
  const field = document.getElementById('feedback');
  const status = document.getElementById('status');
  if (!field.value.trim()) { status.textContent = 'Write your feedback first.'; field.focus(); return; }
  try { await navigator.clipboard.writeText(field.value); status.textContent = 'Copied. Paste it into the place where you received the launch link.'; }
  catch { field.select(); status.textContent = 'Select and copy the draft using your browser.'; }
});
