// After multiple failed attempts the user must solve a small math problem.
const challenges = new Map();

function createChallenge(username) {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const question = `What is ${a} + ${b}?`;
  const answer = (a + b).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  challenges.set(username, { question, answer, expiresAt });
  return question;
}

function verifyChallenge(username, answer) {
  const rec = challenges.get(username);
  if (!rec) return { ok: false, reason: "no_challenge" };
  if (Date.now() > rec.expiresAt) {
    challenges.delete(username);
    return { ok: false, reason: "expired" };
  }
  if (rec.answer !== answer.toString()) {
    return { ok: false, reason: "wrong" };
  }
  // Onsuccess: remove challenge
  challenges.delete(username);
  return { ok: true };
}

module.exports = { createChallenge, verifyChallenge };
