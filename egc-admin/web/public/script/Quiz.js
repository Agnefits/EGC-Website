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
    fetchQuizzes();
});

const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('quizId');
document.querySelector('.Quiz_id').innerText = quizId; 

async function fetchQuizzes() {
    try {
        const response = await fetch(`/student-quizzes/${quizId}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const { questions, count } = await response.json();
        console.log('Fetched quizzes:', questions);

        if (!questions || questions.length === 0) {
            console.error('No quizzes found or empty response:', questions);
            document.querySelector('.Total-question').innerText = '0';
            return;
        }

        availableQuestion = questions.sort((a, b) => a.id - b.id); 
        document.querySelector('.Total-question').innerText = count;
    } catch (error) {
        console.error('Error fetching quizzes:', error);
    }
}


function getNewQuestion() {
    if (questionCounter >= availableQuestion.length) {
        alert('No more questions available.');
        return;
    }

    questionNumber.innerHTML = "Question " + (questionCounter + 1) + " of " + availableQuestion.length;

    currentQuestion = availableQuestion[questionCounter];

    console.log('Current Question:', currentQuestion);

    questionText.innerHTML = currentQuestion.title;

    optionContainer.innerHTML = '';
    currentQuestion.answers.forEach((option, i) => {
        const optionElement = document.createElement("div");
        optionElement.innerHTML = String.fromCharCode(65 + i) + " : " + option;
        optionElement.id = i;
        optionElement.className = "option";
        optionContainer.appendChild(optionElement);
        optionElement.setAttribute("onclick", "getResult(this)");
    });

    questionCounter++; 
}

function next() {
    if (questionCounter >= availableQuestion.length) {
        quizOver();
    } else {
        getNewQuestion();
    }
}

function startQuiz() {
    if (availableQuestion.length === 0) {
        alert('No questions available to start the quiz.');
        return;
    }

    homeBox.classList.add("hide");
    quizBox.classList.remove("hide");

    getNewQuestion();
}

function unclickableOptions() {
    const optionLen = optionContainer.children.length;
    for (let i = 0; i < optionLen; i++) {
        optionContainer.children[i].classList.add("already-answered");
    }
}

let totalScore = 0; 
let answers = []; 

function getResult(element) {
    const id = parseInt(element.id);
    const selectedOptionValue = String.fromCharCode(65 + id); 

    const answerData = {
        answers: selectedOptionValue, 
        questionId: currentQuestion.id, 
        studentId: JSON.parse(localStorage.getItem('userData')).id 
    };

    answers.push(answerData); 
    recordAnswers();

    if (selectedOptionValue === currentQuestion.correctAnswer) {
        console.log('Correct Answer Selected!');
        element.classList.add("correct");
        correctAnswers++;
        totalScore += currentQuestion.degree; 
    } else {
        console.log('Wrong Answer Selected!');
        element.classList.add("wrong");
        const optionLen = optionContainer.children.length;
        for (let i = 0; i < optionLen; i++) {
            if (String.fromCharCode(65 + i) === currentQuestion.correctAnswer) {
                optionContainer.children[i].classList.add("correct");
            }
        }
    }
    unclickableOptions();

    setTimeout(() => {
        next();
    }, 1000);
}

async function quizOver() {
    quizBox.classList.add("hide");
    resultBox.classList.remove("hide");
    quizResult();

    const attemptData = {
        date: new Date().toISOString(), 
        score: totalScore,
        quizId: quizId, 
        studentId: JSON.parse(localStorage.getItem('userData')).id 
    };
    await recordAttempt(attemptData); 
}

function quizResult() {
    console.log('Total Questions:', questionCounter);
    console.log('Total Attempts:', attempt);
    console.log('Correct Answers:', correctAnswers);

    resultBox.querySelector(".Total-question").innerHTML = questionCounter;
    resultBox.querySelector(".Total-correct").innerHTML = correctAnswers;
    resultBox.querySelector(".Total-wrong").innerHTML = questionCounter - correctAnswers;
    
    const percentage = (correctAnswers / questionCounter) * 100;
    resultBox.querySelector(".Total-Percentage").innerHTML = percentage.toFixed(2) + "%";
    resultBox.querySelector(".Total-Score").innerHTML = `${totalScore} / ${questionCounter * currentQuestion.degree}`; 
}

function myFunction() {
    window.location.href = '/student/AllQuizzes'; 
}

async function recordAnswers() {
    const studentId = JSON.parse(localStorage.getItem('userData')).id;

    try {
        console.log({
            quizId: quizId, 
            studentId: studentId,
            answers: answers 
        });

        await fetch('/add-student-question-answers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quizId: quizId,
                studentId: studentId,
                answers: answers 
            })
        });        

        answers = [];
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
