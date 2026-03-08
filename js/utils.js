// function normalizeDate(value) {
//   if (!value) return "";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "";
//   return d.toISOString().slice(0, 10);
// }

// function formatDate(value) {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "—";
//   return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
// }

// function average(arr) {
//   if (!arr || !arr.length) return null;
//   return arr.reduce((sum, x) => sum + x, 0) / arr.length;
// }

// function distance(a, b) {
//   return Math.hypot(a.x - b.x, a.y - b.y);
// }