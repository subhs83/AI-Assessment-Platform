export const shareLink = async ({ title, text, url, showToast }) => {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    showToast("Link copied", "success");
  } catch (err) {
    if (err.name === "AbortError") return;

    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied", "success");
    } catch {
      showToast("Unable to share", "error");
    }
  }
};