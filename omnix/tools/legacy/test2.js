async function x() {
try {
  throw { message: "Failed to fetch" };
} catch(err) {
  console.log(err.message);
}
}
x();
