/* Reusable quiz component.
 * Usage in a lesson:
 *   <div class="quiz" id="quiz1"></div>
 *   <script type="application/json" data-quiz="quiz1">
 *     {"questions": [{"q": "...", "answers": ["...","...","...","..."], "correct": 0, "explain": "..."}]}
 *   </script>
 *   <script src="../assets/quiz.js"></script>
 * Answers are checked on click with immediate feedback; correct index is per-question
 * (lessons vary the position and keep all options the same length).
 */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('script[type="application/json"][data-quiz]').forEach((cfg) => {
    const root = document.getElementById(cfg.dataset.quiz);
    if (!root) return;
    const data = JSON.parse(cfg.textContent);
    const total = data.questions.length;
    let answered = 0;
    const progress = document.createElement("div");
    progress.className = "quiz-progress";
    progress.textContent = `0 / ${total} answered`;
    root.appendChild(progress);

    data.questions.forEach((q, qi) => {
      const box = document.createElement("div");
      box.className = "quiz-question";
      const num = document.createElement("span");
      num.className = "q-num";
      num.textContent = `Question ${qi + 1} of ${total}`;
      const text = document.createElement("p");
      text.className = "q-text";
      text.textContent = q.q;
      const answers = document.createElement("div");
      answers.className = "quiz-answers";
      const explain = document.createElement("p");
      explain.className = "quiz-explain";
      explain.textContent = q.explain || "";

      q.answers.forEach((ans, ai) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = ans;
        btn.addEventListener("click", () => {
          answered += 1;
          progress.textContent = `${answered} / ${total} answered`;
          try { // record the answer for later review by the teacher
            const key = "lean-course-quiz:" + location.pathname + "#" + cfg.dataset.quiz;
            const arr = JSON.parse(localStorage.getItem(key) || "[]");
            arr.push({ q: qi + 1, question: q.q, chosen: ai, correctIndex: q.correct, wasCorrect: ai === q.correct, at: new Date().toISOString() });
            localStorage.setItem(key, JSON.stringify(arr));
          } catch (e) { /* storage unavailable — quiz still works */ }
          answers.querySelectorAll("button").forEach((b) => (b.disabled = true));
          if (ai === q.correct) {
            btn.classList.add("correct");
          } else {
            btn.classList.add("wrong");
            answers.children[q.correct].classList.add("correct");
          }
          explain.classList.add("show");
          if (answered === total) {
            const done = document.createElement("p");
            done.className = "quiz-done";
            done.style.display = "block";
            done.textContent = `Quiz complete — ${total}/${total} questions attempted. Review the explanations above.`;
            root.appendChild(done);
          }
        });
        answers.appendChild(btn);
      });

      box.append(num, text, answers, explain);
      root.appendChild(box);
    });
  });
});
