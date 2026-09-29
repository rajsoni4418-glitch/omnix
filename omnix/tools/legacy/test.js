const b64 = "invalid_b64";
try {
  atob(b64);
} catch (e) {
  console.log(e.message);
}
