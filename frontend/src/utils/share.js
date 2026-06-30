export const shareLink = async ({
  title,
  text,
  url,
  showToast,
  successMessage = "Link copied",
}) => {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    showToast(successMessage, "success");
  } catch (err) {
    if (err.name === "AbortError") return;

    try {
      await navigator.clipboard.writeText(url);
      showToast(successMessage, "success");
    } catch {
      showToast("Unable to share or copy the link", "error");
    }
  }
};