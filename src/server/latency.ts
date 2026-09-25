export async function simulateLatency() {
  const delay = 200 + Math.floor(Math.random() * 1_301);
  await new Promise((resolve) => setTimeout(resolve, delay));
}
