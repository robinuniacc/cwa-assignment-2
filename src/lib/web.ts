function setCookie(name: string, value: string) {
  try {
    const encoded = encodeURIComponent(value);
    document.cookie = `${name}=${encoded}; path=/; samesite=lax`;
  } catch {
    // ignore cookie write errors
    console.error(`Couldn't write cookie ${name}`);
  }
}

export { setCookie };
