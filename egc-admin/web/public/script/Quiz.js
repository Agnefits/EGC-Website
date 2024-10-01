const questionNumber = document.querySelector(".question-number");
const questionText = document.querySelector(".question-text");
const optionContainer = document.querySelector(".option-container");
const answersIndicatorContainer = document.querySelector(".answers-indicator");
const homeBox = document.querySelector(".home-box");
const quizBox = document.querySelector(".quiz-box");
const resultBox = document.querySelector(".result-box");

let questionCounter = 0;
let currentQuestion;
let availableOptions = [];
let correctAnswers = 0;
let attempt = 0;

// Fetch quizzes from database
// Get the quizId from the URL
// استخراج quizId من عنوان الـ URL
// استخراج quizId من عنوان الـ URL
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('quizId');

let availableQuestion = []; // مصفوفة لتخزين الأسئلة

async function fetchQuizzes() {
    try {
        const response = await fetch(`/student-quizzes/${quizId}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const quizzes = await response.json();
        console.log('Fetched quizzes:', quizzes); // طباعة الأسئلة في وحدة التحكم

        if (!quizzes || quizzes.length === 0) {
            console.error('No quizzes found or empty response:', quizzes);
            document.querySelector('.Total-question').innerText = '0';
            return;
        }

        availableQuestion = quizzes; // تخزين الأسئلة في المصفوفة
        document.querySelector('.Total-question').innerText = availableQuestion.length; // عرض عدد الأسئلة

        getNewQuestion(); // بدء عرض السؤال الأول
    } catch (error) {
        console.error('Error fetching quizzes:', error);
    }
}

// استدعاء الدالة عند تحميل الصفحة
window.onload = fetchQuizzes;



async function checkPreviousAttempt() {
    const studentId = JSON.parse(localStorage.getItem('userData')).id;
    const response = await fetch(`/courses/student-quizzes/${studentId}`);
    const attempts = await response.json();
    return attempts.some(attempt => attempt.quizId === quizId); // Compare with the current quizId
}


// Start the quiz
function startQuiz() {
    // تحقق من أن هناك أسئلة متاحة
    if (availableQuestion.length === 0) {
        alert('No questions available to start the quiz.');
        return;
    }

    // إخفاء قسم التعليمات وعرض قسم الكويز
    document.querySelector('.quiz-info').classList.add("hide");
    document.querySelector('.quiz-box').classList.remove("hide");

    // استدعاء دالة لعرض السؤال الأول
    getNewQuestion();
    answersIndicator(); // تأكد من أن هذه الدالة تستدعي أيضًا
}





// Set available questions
function getNewQuestion() {
    if (availableQuestion.length === 0) {
        alert('No more questions available.');
        return;
    }

    questionNumber.innerHTML = " Question " + (questionCounter + 1) + " of " + availableQuestion.length;

    // احصل على سؤال عشوائي
    const questionIndex = availableQuestion[Math.floor(Math.random() * availableQuestion.length)];
    currentQuestion = questionIndex;
    questionText.innerHTML = currentQuestion.q;

    // احصل على موضع 'questionIndex' من مصفوفة 'availableQuestion'
    const index1 = availableQuestion.indexOf(questionIndex);
    // إزالة 'questionIndex' من مصفوفة 'availableQuestion' حتى لا يتكرر السؤال
    availableQuestion.splice(index1, 1);

    // إعداد الخيارات
    optionContainer.innerHTML = ''; // مسح خيارات الإجابة السابقة
    currentQuestion.options.forEach((option, i) => {
        const optionElement = document.createElement("div");
        optionElement.innerHTML = option;
        optionElement.id = i; // استخدام المعرف الأصلي
        optionElement.className = "option";
        optionContainer.appendChild(optionElement);
        optionElement.setAttribute("onclick", "getResult(this)"); // تعيين وظيفة النقر
    });

    questionCounter++; // زيادة عدد الأسئلة
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
    const studentId = JSON.parse(localStorage.getItem('userData')).id;
    
    quizBox.classList.add("hide");
    resultBox.classList.remove("hide");
    quizResult();

    recordAnswers(collectedAnswers); // حفظ إجابات الطالب
    
    recordAttempt({
        quizId: quizId,
        studentId: studentId,
        date: new Date().toISOString(),
        score: correctAnswers // إرسال النتيجة
    });
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