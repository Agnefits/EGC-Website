const questionNumber = document.querySelector(".question-number");
const questionText = document.querySelector(".question-text");
const optionContainer = document.querySelector(".option-container");
const answersIndicatorContainer = document.querySelector(".answers-indicator");
const homeBox = document.querySelector(".home-box");
const quizBox = document.querySelector(".quiz-box");
const resultBox = document.querySelector(".result-box");

let questionCounter = 0;
let currentQuestion;
let availableQuestion = [];
let availableOptions = [];
let correctAnswers = 0;
let attempt = 0;

// Fetch quizzes from database
async function fetchQuizzes() {
    try {
        const response = await fetch('/student-quizzes/<quizId>'); // Adjust the endpoint as necessary
        const quizzes = await response.json();
        return quizzes.map(quiz => ({
            q: quiz.title,
            options: JSON.parse(quiz.answers), // Assuming answers is a JSON string
            answer: quiz.correctAnswer // Adjust according to your DB schema
        }));
    } catch (error) {
        console.error('Error fetching quizzes:', error);
    }
}

// Check if student already attempted the quiz
async function checkPreviousAttempt() {
    const response = await fetch(`/courses/student-quizzes/<studentId>`); // Adjust the endpoint
    const attempts = await response.json();
    return attempts.some(attempt => attempt.quizId === '<quizId>'); // Check if the quizId matches
}

// Start the quiz
async function startQuiz() {
    const hasAttempted = await checkPreviousAttempt();
    if (hasAttempted) {
        alert('You have already attempted this quiz.');
        return;
    }

    homeBox.classList.add("hide");
    quizBox.classList.remove("hide");

    availableQuestion = await fetchQuizzes();
    getNewQuestion();
    answersIndicator();
}

// Set available questions
function getNewQuestion() {
    questionNumber.innerHTML = " Question " + (questionCounter + 1) + " of " + availableQuestion.length;
    const questionIndex = availableQuestion[Math.floor(Math.random() * availableQuestion.length)];
    currentQuestion = questionIndex;
    questionText.innerHTML = currentQuestion.q;

    const index1 = availableQuestion.indexOf(questionIndex);
    availableQuestion.splice(index1, 1);

    optionContainer.innerHTML = '';
    let animationDelay = 0.15;
    currentQuestion.options.forEach((option, i) => {
        const optonIndex = i; // use original index
        const optionElement = document.createElement("div");
        optionElement.innerHTML = option;
        optionElement.id = optonIndex;
        optionElement.style.animationDelay = animationDelay + 's';
        animationDelay += 0.15;
        optionElement.className = "option";
        optionContainer.appendChild(optionElement);
        optionElement.setAttribute("onclick", "getResult(this)");
    });

    questionCounter++;
}

// Get result of current attempt
function getResult(element) {
    const id = parseInt(element.id);
    if (id === currentQuestion.answer) {
        element.classList.add("correct");
        correctAnswers++;
    } else {
        element.classList.add("wrong");
        const optionLen = optionContainer.children.length;
        for (let i = 0; i < optionLen; i++) {
            if (parseInt(optionContainer.children[i].id) === currentQuestion.answer) {
                optionContainer.children[i].classList.add("correct");
            }
        }
    }
    attempt++;
    unclickableOptions();
}

// Make options unclickable
function unclickableOptions() {
    const optionLen = optionContainer.children.length;
    for (let i = 0; i < optionLen; i++) {
        optionContainer.children[i].classList.add("already-answered");
    }
}

// Next question
function next() {
    if (questionCounter === availableQuestion.length) {
        quizOver();
    } else {
        getNewQuestion();
    }
}

// Handle quiz over
function quizOver() {
    quizBox.classList.add("hide");
    resultBox.classList.remove("hide");
    quizResult();
    recordAttempt({
        quizId: '<quizId>', // Set the appropriate quizId
        studentId: '<studentId>', // Get this from session or local storage
        date: new Date().toISOString(),
        score: correctAnswers
    });
}

// Record attempt in the database
async function recordAttempt(attemptData) {
    try {
        await fetch('/add-student-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attemptData)
        });
    } catch (error) {
        console.error('Error recording attempt:', error);
    }
}

// Get quiz result
function quizResult() {
    resultBox.querySelector(".Total-question").innerHTML = availableQuestion.length;
    resultBox.querySelector(".Total-attempt").innerHTML = attempt;
    resultBox.querySelector(".Total-correct").innerHTML = correctAnswers;
    resultBox.querySelector(".Total-wrong").innerHTML = attempt - correctAnswers;
    const percentage = (correctAnswers / availableQuestion.length) * 100;
    resultBox.querySelector(".Total-Percentage").innerHTML = percentage.toFixed(2) + "%";
    resultBox.querySelector(".Total-Score").innerHTML = correctAnswers + " / " + availableQuestion.length;
}

function myFunction() {
    alert("Successful!");
}

// Starting point
window.onload = async function () {
    homeBox.querySelector(".Total-question").innerHTML = await fetchQuizzes().length; // Assuming this gets the total questions
}
