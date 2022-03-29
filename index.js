const page = Object.fromEntries(
  ["countdown", "form", "prompt", "answer", "score", "start", "reset"].map(
    (id) => [id, document.getElementById(id)]
  )
);
const timerLength = 60 * 1000;

// data State = Stopped
//            | Loading { target: DateTime }
//            | Running { target: DateTime, score: number, prompt: string  }

let state = { kind: "stopped" };

function render() {
  let now = Date.now();
  let time, canStart, canReset;

  switch (state.kind) {
    case "stopped":
      time = durationToString(timerLength);
      canStart = true;
      canReset = false;
      score = 0;
      prompt = "Ready?";
      break;
    case "loading":
      time = durationToString(timerLength);
      canStart = true;
      canReset = false;
      score = 0;
      prompt = durationToLoadingString(state.target - now);
      if (state.target <= now) {
        state = {
          kind: "running",
          target: Date.now() + timerLength,
          score: 0,
          prompt: getExpression(),
        };
      }
      break;
    case "running":
      if (state.target <= now) {
        time = "Done!";
        canStart = true;
        canReset = false;
        prompt = "Game over!";
      } else {
        time = durationToString(state.target - now);
        canStart = false;
        canReset = true;
        prompt = formatExpression(state.prompt);
        page.answer.focus();
      }
      score = state.score;
      break;
  }

  page.countdown.textContent = time;
  page.prompt.textContent = prompt;
  page.score.textContent = `Score: ${score}`;
  page.start.disabled = !canStart;
  page.reset.disabled = !canReset;
  page.answer.disabled = !canReset;

  requestAnimationFrame(render);
}

function start() {
  switch (state.kind) {
    case "stopped":
    case "running":
      state = {
        kind: "loading",
        target: Date.now() + 3 * 1000,
      };
      break;
  }
}

function reset() {
  state = { kind: "stopped" };
}

function submit(e) {
  e.preventDefault();
  switch (state.kind) {
    case "running":
      if (page.answer.value == eval(state.prompt)) {
        state.score += 1;
        correct();
      } else {
        incorrect();
      }
      state.prompt = getExpression();
      page.answer.value = "";
  }
}

page.start.addEventListener("click", start);
page.reset.addEventListener("click", reset);
page.form.addEventListener("submit", submit);
page.form.addEventListener("keypress", filter);
render();

function correct() {
  page.answer.classList.add("correct");
  page.prompt.classList.add("correct");
  setTimeout(() => {
    page.answer.classList.remove("correct");
    page.prompt.classList.remove("correct");
  }, 500);
}

function incorrect() {
  page.answer.classList.add("incorrect");
  page.prompt.classList.add("incorrect");
  setTimeout(() => {
    page.answer.classList.remove("incorrect");
    page.prompt.classList.remove("incorrect");
  }, 500);
}

function durationToString(durn) {
  durn /= 1000;
  let s = durn % 60 | 0;
  durn /= 60;

  let m = durn % 60 | 0;
  durn /= 60;

  let h = durn | 0;

  return (h != 0 ? [h, m, s] : [m, s])
    .map((x) => x.toString().padStart(2, "0"))
    .join(":");
}

function durationToLoadingString(durn) {
  durn /= 1000;
  return (durn % 60 | 0) + 1;
}

function getExpression() {
  const number = () => Math.ceil(Math.random() * 8) + 1;
  return `${number()} * ${number()}`;
}

function formatExpression(exp) {
  return exp.replace("*", "×");
}

function filter(e) {
  if (!((e.which >= 48 && e.which <= 57) || e.key === "Enter")) {
    e.preventDefault();
  }
}
