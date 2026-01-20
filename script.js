// ===== SETTINGS YOU CAN EDIT =====
let TOTAL_QUESTIONS = 50;   // Change number of questions here
let TIME_LIMIT = 30 * 60;   // 30 minutes in seconds
// =================================

const landing = document.getElementById("landing-page");
const testPage = document.getElementById("test-page");
const resultPage = document.getElementById("result-page");

const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const retakeBtn = document.getElementById("retakeBtn");
const reviewBtn = document.getElementById("reviewBtn");

const timerEl = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");
const qCounter = document.getElementById("q-counter");

const container = document.getElementById("questions-container");
const reviewContainer = document.getElementById("review-container");

const fileInput = document.getElementById("fileInput");
const manualInput = document.getElementById("manualInput");
const loadBtn = document.getElementById("loadQuestions");

let timer;
let timeLeft = TIME_LIMIT;
let questions = [];
let answers = {};

// -------- SAMPLE DEFAULT QUESTIONS --------
questions = [
  {
    q:"Synonym of 'Abundant'?",
    options:["Scarce","Plentiful","Rare","Little"],
    correct:1
  },
  {
    q:"Antonym of 'Brave'?",
    options:["Courageous","Fearless","Cowardly","Bold"],
    correct:2
  }
];
// ------------------------------------------

startBtn.onclick = () => {
  landing.classList.remove("active");
  testPage.classList.add("active");
  loadQuestionsToUI();
  startTimer();
};

submitBtn.onclick = showResult;

retakeBtn.onclick = () => location.reload();

loadBtn.onclick = loadCustomQuestions;

// ===== TIMER =====
function startTimer(){
  timer = setInterval(()=>{
    let m = Math.floor(timeLeft/60);
    let s = timeLeft % 60;
    timerEl.textContent = `${m}:${s<10?'0':''}${s}`;
    timeLeft--;

    if(timeLeft < 0){
      clearInterval(timer);
      showResult();
    }
  },1000);
}

// ===== LOAD QUESTIONS INTO UI =====
function loadQuestionsToUI(){
  container.innerHTML = "";

  questions.slice(0, TOTAL_QUESTIONS).forEach((item,i)=>{
    let div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `<h4>Q${i+1}. ${item.q}</h4><div class="options">`;

    item.options.forEach((opt,idx)=>{
      div.innerHTML += `
      <label>
        <input type="radio" name="q${i}" value="${idx}">
        ${String.fromCharCode(65+idx)}. ${opt}
      </label>`;
    });

    div.innerHTML += "</div>";
    container.appendChild(div);
  });

  document.querySelectorAll("input").forEach(inp=>{
    inp.addEventListener("change", updateProgress);
  });

  updateProgress();
}

// ===== PROGRESS =====
function updateProgress(){
  let answered = document.querySelectorAll("input:checked").length;
  progressBar.style.width = (answered / TOTAL_QUESTIONS * 100) + "%";
  qCounter.textContent = `Question ${answered} of ${TOTAL_QUESTIONS}`;
}

// ===== LOAD USER QUESTIONS =====
function loadCustomQuestions(){
  if(fileInput.files.length){
    let file = fileInput.files[0];
    let reader = new FileReader();

    reader.onload = e => {
      try{
        questions = JSON.parse(e.target.result);
        alert("Questions loaded from file!");
        loadQuestionsToUI();
      }catch{
        alert("Invalid JSON file!");
      }
    };

    reader.readAsText(file);
  }
  else if(manualInput.value.trim()){
    try{
      questions = JSON.parse(manualInput.value);
      alert("Questions loaded from text!");
      loadQuestionsToUI();
    }catch{
      alert("Invalid JSON format!");
    }
  }
}

// ===== RESULT =====
function showResult(){
  clearInterval(timer);

  let total = TOTAL_QUESTIONS;
  let attempted = document.querySelectorAll("input:checked").length;
  let correct = 0;
  let wrong = 0;

  questions.slice(0,total).forEach((q,i)=>{
    let selected = document.querySelector(`input[name="q${i}"]:checked`);
    if(selected){
      if(parseInt(selected.value) === q.correct) correct++;
      else wrong++;
    }
  });

  let percent = ((correct/total)*100).toFixed(2);

  document.getElementById("totalQ").textContent = total;
  document.getElementById("attempted").textContent = attempted;
  document.getElementById("correct").textContent = correct;
  document.getElementById("wrong").textContent = wrong;
  document.getElementById("marks").textContent = correct;
  document.getElementById("percent").textContent = percent;

  let msg = "Needs Improvement 📚";
  if(percent >= 80) msg = "Excellent 👏";
  else if(percent >= 60) msg = "Good 😊";

  document.getElementById("performance").textContent = msg;

  testPage.classList.remove("active");
  resultPage.classList.add("active");

  buildReview(total);
}

// ===== REVIEW ANSWERS =====
function buildReview(total){
  reviewContainer.innerHTML = "<h3>Answer Review</h3>";

  questions.slice(0,total).forEach((q,i)=>{
    let selected = document.querySelector(`input[name="q${i}"]:checked`);
    let sel = selected ? parseInt(selected.value) : -1;

    let box = document.createElement("div");
    box.className = "question";

    let status = (sel === q.correct) ? "correct" : "wrong";

    box.innerHTML = `
      <h4 class="${status}">Q${i+1}. ${q.q}</h4>
      <p>Your answer: ${ sel>=0 ? q.options[sel] : "Not Attempted" }</p>
      <p class="correct">Correct: ${q.options[q.correct]}</p>
    `;

    reviewContainer.appendChild(box);
  });
}

reviewBtn.onclick = () => {
  reviewContainer.scrollIntoView({behavior:"smooth"});
};
