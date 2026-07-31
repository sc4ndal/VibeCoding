export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/vision/analyze', {
    method: 'POST',
    body: formData,
  });

  return res.json();
}
