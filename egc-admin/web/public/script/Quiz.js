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
let correctAnswers = 0;
let attempt = 0;

document.addEventListener('DOMContentLoaded', (event) => {
    fetchQuizzes(); // استدعاء الدالة عند تحميل الصفحة
});

const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('quizId');
document.querySelector('.Quiz_id').innerText = quizId; 

async function fetchQuizzes() {
    try {
        const response = await fetch(`/student-quizzes/${quizId}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const { questions, count } = await response.json();
        console.log('Fetched quizzes:', questions); // تسجيل الأسئلة المحمّلة

        if (!questions || questions.length === 0) {
            console.error('No quizzes found or empty response:', questions);
            document.querySelector('.Total-question').innerText = '0';
            return;
        }

        availableQuestion = questions; 
        document.querySelector('.Total-question').innerText = count; 
    } catch (error) {
        console.error('Error fetching quizzes:', error);
    }
}

// Set available questions
function getNewQuestion() {
    if (availableQuestion.length === 0) {
        alert('No more questions available.');
        return;
    }

    questionNumber.innerHTML = "Question " + (questionCounter + 1) + " of " + availableQuestion.length;

    const questionIndex = Math.floor(Math.random() * availableQuestion.length);
    currentQuestion = availableQuestion[questionIndex];
    
    console.log('Current Question:', currentQuestion); // تسجيل السؤال الحالي

    questionText.innerHTML = currentQuestion.title;

    optionContainer.innerHTML = '';
    currentQuestion.answers.forEach((option, i) => {
        const optionElement = document.createElement("div");
        optionElement.innerHTML = option;
        optionElement.id = i;
        optionElement.className = "option";
        optionContainer.appendChild(optionElement);
        optionElement.setAttribute("onclick", "getResult(this)");
    });

    availableQuestion.splice(questionIndex, 1);
    questionCounter++; 
}

// Start the quiz
function startQuiz() {
    if (availableQuestion.length === 0) {
        alert('No questions available to start the quiz.');
        return;
    }

    // إخفاء قسم التعليمات وعرض قسم الكويز
    homeBox.classList.add("hide");
    quizBox.classList.remove("hide");

    // استدعاء دالة لعرض السؤال الأول
    getNewQuestion();
}


// Make options unclickable
function unclickableOptions() {
    const optionLen = optionContainer.children.length;
    for (let i = 0; i < optionLen; i++) {
        optionContainer.children[i].classList.add("already-answered");
    }
}


// Get result of current attempt
function getResult(element) {
    const id = parseInt(element.id);
    console.log('Selected Option ID:', id); // تسجيل الخيار المحدد
    console.log('Correct Answer ID:', currentQuestion.correctAnswer); // تسجيل الإجابة الصحيحة

    if (id === currentQuestion.correctAnswer) {
        element.classList.add("correct");
        correctAnswers++;
    } else {
        element.classList.add("wrong");
        const optionLen = optionContainer.children.length;
        for (let i = 0; i < optionLen; i++) {
            if (parseInt(optionContainer.children[i].id) === currentQuestion.correctAnswer) {
                optionContainer.children[i].classList.add("correct");
            }
        }
    }
    attempt++;
    unclickableOptions();

    setTimeout(() => {
        next();
    }, 1000);
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
}

// Get quiz result
function quizResult() {
    console.log('Total Questions:', questionCounter);
    console.log('Total Attempts:', attempt);
    console.log('Correct Answers:', correctAnswers);

    resultBox.querySelector(".Total-question").innerHTML = questionCounter;
    resultBox.querySelector(".Total-attempt").innerHTML = attempt;
    resultBox.querySelector(".Total-correct").innerHTML = correctAnswers;
    resultBox.querySelector(".Total-wrong").innerHTML = attempt - correctAnswers;
    const percentage = (correctAnswers / questionCounter) * 100;
    resultBox.querySelector(".Total-Percentage").innerHTML = percentage.toFixed(2) + "%";
    resultBox.querySelector(".Total-Score").innerHTML = correctAnswers + " / " + questionCounter;
}


function myFunction() {
    alert("Successful!");
}

async function recordAnswers(answers) {
    try {
        await fetch('/add-student-question-answers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quizId: quizId,
                studentId: JSON.parse(localStorage.getItem('userData')).id,
                answers: answers // Send the selected answers
            })
        });
    } catch (error) {
        console.error('Error recording answers:', error);
    }
}

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
