
const API_BASE_URL = 'https://opentdb.com/api.php?amount=5&type=multiple';

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let questionTimer;
let totalTimer;
let questionTimeLeft = 20;
let totalTimeElapsed = 0;
let username = "";
let startTime;


async function startQuiz(category) {
  const nameInput = document.getElementById("username");
  username = nameInput.value.trim();
  startTime = Date.now();

  if (username === "") {
    alert("Ange ditt namn för att starta quizet 😡 !!!");
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}&category=${category}`);
    const data = await response.json();

    questions = data.results.map(item => ({
      question: item.question,
      options: [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5),
      answer: item.correct_answer
    }));

    if (questions.length > 0) {
      document.getElementById("startText").style.display = "none";
      document.getElementById("start-container").style.display = "none";
      document.getElementById("quiz-container").style.display = "block";
      document.getElementById("feedback").style.display = "none";
      document.getElementById("next-btn").style.display = "none";

      
      currentQuestionIndex = 0;
      score = 0;
      questionTimeLeft = 20;
      totalTimeElapsed = 1;
      
      startTotalTimer();
      showQuestion();
    } 

    else {
      alert('Inga frågor hittades för MUSIK/FILM ☠️'); 
    }
  } 

  catch (error) {
    console.error("Kunde inte hämta frågor:", error);
    alert("Något gick fel. Försök igen senare.");
  }
}

function startTotalTimer() {
  totalTimer = setInterval(() => {
    totalTimeElapsed++;
    document.getElementById("total-timer").innerText = `Total tid: ${totalTimeElapsed} sekunder`;
  }, 1000);
}


function showQuestion() {
  resetOptions();
  const currentQuestion = questions[currentQuestionIndex];
  document.getElementById("question").innerHTML = currentQuestion.question;

  currentQuestion.options.forEach(option => {
    const button = document.createElement("button");
    button.innerText = option;
    button.addEventListener("click", selectAnswer);
    document.getElementById("options").appendChild(button);
  });
  
  questionTimeLeft = 20;
  document.getElementById("timer").innerText = `Tid kvar: ${questionTimeLeft} sekunder`;
  clearInterval(questionTimer);
  questionTimer = setInterval(() => {  
    questionTimeLeft--;
    document.getElementById("timer").innerText = `Tid kvar: ${questionTimeLeft} sekunder`;

    if (questionTimeLeft <= 0) {
      clearInterval(questionTimer);
      showFeedback(false);
    }
  }, 1000);

}

function selectAnswer(e) {
  const selectedAnswer = e.target.innerText;
  const correctAnswer = questions[currentQuestionIndex].answer;

  const isCorrect = (selectedAnswer === correctAnswer);
  if (isCorrect) score++;

  clearInterval(questionTimer);
  showFeedback(isCorrect);

  buttonsDoNotWork();
}

function resetOptions() {
  const optionsContainer = document.getElementById("options");
  while (optionsContainer.firstChild) {
    optionsContainer.removeChild(optionsContainer.firstChild);
  }
}


// function selectAnswer(e) {
//   const selectedAnswer = e.target.innerText;
//   const correctAnswer = questions[currentQuestionIndex].answer;

//   const isCorrect = (selectedAnswer === correctAnswer);
//   if (isCorrect) score++;

//   clearInterval(questionTimer);
//   showFeedback(isCorrect);

//   disableOptionButtons();
//}

function buttonsDoNotWork() {
  const optionButtons = document.querySelectorAll("#options button");
  optionButtons.forEach(button => {
    button.disabled = true;
  });
}

function buttonsDoWork() {
  const optionButtons = document.querySelectorAll("#options button");
  optionButtons.forEach(button => {
    button.disabled = false;
  });
}

function showFeedback(isCorrect) {
  const feedbackElement = document.getElementById("feedback");
  feedbackElement.style.display = "block";
  feedbackElement.innerText = isCorrect ? "Rätt svar ✔️" : `Fel svar ❌ Rätt svar var: ${questions[currentQuestionIndex].answer}`;
  document.getElementById("next-btn").style.display = "block";
}


function showNextQuestion() {

    if (currentQuestionIndex === 3) {
      document.getElementById("next-btn").innerText = "Avsluta Quiz";
      document.getElementById("next-btn").addEventListener("click", handleNextButtonClick);
    }

    if (questions.length == currentQuestionIndex + 1) {
      document.getElementById("next-btn").innerText = "Avsluta Quiz";
    } 

    else {
      currentQuestionIndex++;
      document.getElementById("feedback").style.display = "none";
      document.getElementById("next-btn").style.display = "none";
      showQuestion();
      buttonsDoWork(); 
    }
  }


function handleNextButtonClick() {
  
    if (document.getElementById("next-btn").innerText === "Avsluta Quiz") {
        showResult(); }
    else {
        showNextQuestion();
  }    
}


function showResult() {
  clearInterval(questionTimer);
  clearInterval(totalTimer);
  
  const stopTime = Date.now();
  const quizTime = Math.round((stopTime - startTime) / 1000);

  document.getElementById("quiz-container").style.display = "none";
  const result = document.getElementById("result");
  result.style.display = "block";
  result.innerText = `${username}, du fick ${score} av ${questions.length} rätt på ${quizTime} sekunder!`;
  
  saveScore(username, score, quizTime);
  displayHighScores();
}


function saveScore(name, score, quizTime) {
  let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  const newScore = { name, score, quizTime };
  highScores.push(newScore);

  highScores = highScores.sort((a, b) => b.score - a.score).slice(0, 10);
  localStorage.setItem("highScores", JSON.stringify(highScores));
}


function displayHighScores() {
  const result = document.getElementById("result");
  const highScores = JSON.parse(localStorage.getItem("highScores")) || [];

  let highScoreList = "<h2>👑Topplista👑</h2><ul>";
  highScores.forEach(score => {
    highScoreList += `<li>${score.name}: ${score.score} poäng: ${score.quizTime} sekunder</li>`;
  });
  highScoreList += "</ul>";

  result.innerHTML += highScoreList;
}


