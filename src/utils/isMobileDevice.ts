// Returns true if the user is on a mobile device
export function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
