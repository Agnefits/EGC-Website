const questionNumber = document.querySelector(".question-number");
const questionText = document.querySelector(".question-text");
const optionContainer = document.querySelector(".option-container");
const homeBox = document.querySelector(".home-box");
const quizBox = document.querySelector(".quiz-box");
const resultBox = document.querySelector(".result-box");


let quizTime; // عدد الثواني المتاحة للاختبار
let timerInterval; // لتخزين معرف المؤقت حتى يمكن إيقافه
const timerDisplay = document.querySelector(".timer"); // عنصر لعرض الوقت المتبقي


let questionCounter = 0;
let currentQuestion;
let availableQuestion = [];
let correctAnswers = 0;
let totalScore = 0;
let answers = [];

document.addEventListener('DOMContentLoaded', fetchQuizzes);

const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('quizId');
document.querySelector('.Quiz_id').innerText = quizId;



async function fetchQuizzes() {
    try {
        // جلب البيانات من الـ API
        const response = await fetch(`/student-quizzes/${quizId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { questions, count, time } = await response.json(); // استخراج `time`
        if (time && !isNaN(time)) {
            quizTime = parseInt(time) * 60; // تحويل الدقائق إلى ثوانٍ مع التأكد من أنها رقم صحيح
        } else {
            console.error('Invalid time received:', time);
            quizTime = 0;  // تعيين قيمة افتراضية في حال كانت القيمة غير صالحة
        }

        // فرز الأسئلة حسب ID
        availableQuestion = questions.sort((a, b) => a.id - b.id);

        // لا تعرض الأسئلة إلا إذا لم تكن هناك محاولة سابقة
        const studentId = JSON.parse(localStorage.getItem('userData')).id;
        const previousAttempt = await checkPreviousAttempt(studentId, quizId);

        // إذا كانت هناك محاولة سابقة
        if (previousAttempt) {

            homeBox.classList.add("hide");
            quizBox.classList.add("hide");
            resultBox.classList.remove("hide");
            // عرض النتيجة
            resultBox.querySelector(".Total-Score").innerText = `${previousAttempt.score}`;
        } else {
            document.querySelector('.Total-question').innerText = count;  // عرض عدد الأسئلة
        }

    } catch (error) {
        console.error('Error fetching quizzes:', error);
        alert("Error loading quiz. Please try again later.");
    }
}

function startTimer() {
    if (isNaN(quizTime) || quizTime <= 0) {
        console.error("Invalid quizTime:", quizTime);
        timerDisplay.textContent = "Error: No Time Set"; // عرض رسالة خطأ بدلاً من NaN:NaN
        return;
    }

    function updateTimer() {
        let minutes = Math.floor(quizTime / 60);
        let seconds = quizTime % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (quizTime <= 0) {
            clearInterval(timerInterval);
            quizOver(); // إنهاء الاختبار تلقائيًا عند انتهاء الوقت
        }
        quizTime--;
    }

    updateTimer(); // تحديث الوقت فورًا عند بدء المؤقت
    timerInterval = setInterval(updateTimer, 1000); // تحديث كل ثانية
}

async function checkPreviousAttempt(studentId, quizId) {
    try {
        const response = await fetch(`/courses/student-quizzes/${studentId}/${quizId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const attempts = await response.json();
        console.log('Attempts data:', attempts);  // طباعة البيانات المرسلة من الخادم

        return attempts.find(attempt => attempt.quizId === parseInt(quizId));
    } catch (error) {
        console.error('Error checking previous attempt:', error);
        return null;
    }
}




function getNewQuestion() {
    if (questionCounter >= availableQuestion.length) {
        quizOver();
        return;
    }

    questionNumber.textContent = `Question ${questionCounter + 1} of ${availableQuestion.length}`;

    currentQuestion = availableQuestion[questionCounter];
    questionText.textContent = currentQuestion.title;

    optionContainer.innerHTML = '';

    if (currentQuestion.type === 'bool') {
        currentQuestion.answers.forEach((option) => {
            const optionElement = document.createElement("div");
            optionElement.textContent = option.toLowerCase();
            optionElement.className = "option";
            optionElement.addEventListener("click", () => getResult(optionElement));
            optionContainer.appendChild(optionElement);
        });
    } else if(currentQuestion.type === 'multi') {
        currentQuestion.answers.forEach((option, index) => {
            const optionElement = document.createElement("div");
            optionElement.textContent = `${String.fromCharCode(65 + index)} : ${option}`;
            optionElement.className = "option";
            optionElement.setAttribute('data-index', index); // أضف هذا السطر
            optionElement.addEventListener("click", () => getResult(optionElement));
            optionContainer.appendChild(optionElement);
        });
    }
    else
    {
        const inputElement = document.createElement("input");
        inputElement.type = "text"; // Or "number", "email", etc., as needed
        inputElement.className = "text-answer-input"; // Add a class for styling if you want
        optionContainer.appendChild(inputElement);
    }

    questionCounter++;
}



async function startQuiz() {
    if (availableQuestion.length === 0) {
        alert('No questions available to start the quiz.');
        return;
    }

    homeBox.classList.add("hide");
    quizBox.classList.remove("hide");
    resultBox.classList.add("hide");

    questionCounter = 0;
    correctAnswers = 0;
    totalScore = 0;
    startTimer(); 
    getNewQuestion();
}

function unclickableOptions() {
    Array.from(optionContainer.children).forEach(option => {
        option.classList.add("already-answered");
    });
}

function getResult(element) {
    // const selectedOptionIndex = parseInt(element.id);
    const selectedOptionIndex = parseInt(element.getAttribute('data-index'));

    let selectedOptionValue;

    // تحديد نوع الإجابة وحساب قيمة الإجابة المختارة
    if (currentQuestion.type === 'bool') {
        selectedOptionValue = element.textContent.toLowerCase();
    } else if (currentQuestion.type === 'multi') {
        console.log('Element ID:', element.id);
        console.log('Selected Option Index:', selectedOptionIndex);
        selectedOptionValue = String.fromCharCode(65 + selectedOptionIndex);
        console.log('Selected Option Value:', selectedOptionValue);
    } else {
        // إذا كانت الإجابة من نوع النص المفتوح
        selectedOptionValue = element.previousElementSibling 
            ? element.previousElementSibling.value.trim().toLowerCase() 
            : "";
    }

    // إعداد بيانات الإجابة
    const answerData = {
        answers: selectedOptionValue,
        questionId: currentQuestion.id,
        studentId: JSON.parse(localStorage.getItem('userData')).id
    };

    answers.push(answerData);
    recordAnswers(); // تسجيل الإجابة في مكان تخزين البيانات

    // مقارنة الإجابة مع الإجابة الصحيحة
    let correctAnswer = currentQuestion.correctAnswer;

    // التحقق من الإجابة الصحيحة بناءً على نوع السؤال
    if (selectedOptionValue === correctAnswer) {
        element.classList.add("correct");
        correctAnswers++;
        totalScore += currentQuestion.degree;
    } else {
        element.classList.add("wrong");
        showCorrectAnswer(); // وظيفة جديدة لإظهار الإجابة الصحيحة
    }

    unclickableOptions(); // منع النقر على الخيارات بعد اختيار إجابة

    // الانتقال إلى السؤال التالي أو إنهاء الاختبار
    if (questionCounter >= availableQuestion.length) {
        setTimeout(quizOver, 1000);
    } else {
        setTimeout(getNewQuestion, 1000);
    }
}

// وظيفة لإظهار الإجابة الصحيحة
function showCorrectAnswer() {
    if (currentQuestion.type === 'bool') {
        Array.from(optionContainer.children).forEach(option => {
            if (option.textContent.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) {
                option.classList.add("correct");
            }
        });
    } else if (currentQuestion.type === 'multi') {
        const optionLen = optionContainer.children.length;
        for (let i = 0; i < optionLen; i++) {
            if (String.fromCharCode(65 + i) === currentQuestion.correctAnswer) {
                optionContainer.children[i].classList.add("correct");
            }
        }
    } else {
        // إذا كانت الإجابة مفتوحة، قم بإظهار الإجابة الصحيحة
        const inputElement = document.createElement("div");
        inputElement.textContent = `Correct Answer: ${currentQuestion.correctAnswer}`;
        inputElement.classList.add("correct-answer");
        optionContainer.appendChild(inputElement);
    }
}


function next()
{
    if (questionCounter >= availableQuestion.length) {
        setTimeout(quizOver, 1000); // الانتقال إلى النهاية بعد فترة قصيرة
    } else {
        setTimeout(getNewQuestion, 1000); // عرض السؤال التالي بعد فترة قصيرة
    }
}

async function quizOver() {
    clearInterval(timerInterval); // إيقاف المؤقت عند انتهاء الاختبار
    quizBox.classList.add("hide");
    resultBox.classList.remove("hide");
    quizResult();

    const attemptData = {
        date: new Date().toISOString(),
        score: totalScore,
        quizId: quizId,
        studentId: JSON.parse(localStorage.getItem('userData')).id,
    };
    await recordAttempt(attemptData);
}


function quizResult() {
    resultBox.querySelector(".Total-question").textContent = availableQuestion.length; // Use availableQuestion.length
    resultBox.querySelector(".Total-correct").textContent = correctAnswers;
    resultBox.querySelector(".Total-wrong").textContent = availableQuestion.length - correctAnswers; // Use availableQuestion.length

    const percentage = (correctAnswers / availableQuestion.length) * 100; // Use availableQuestion.length
    resultBox.querySelector(".Total-Percentage").textContent = `${percentage.toFixed(2)}%`;
    resultBox.querySelector(".Total-Score").textContent = `${totalScore} / ${availableQuestion.length * currentQuestion.degree}`; 

// Use availableQuestion.length
}


function myFunction() {
    window.location.href = '/student/AllQuizzes';
}

async function recordAnswers() {
    const studentId = JSON.parse(localStorage.getItem('userData')).id;

    console.log('Sending answers:', {
        quizId: quizId,
        studentId: studentId,
        answers: answers
    });

    try {
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
        alert("Error saving answers. Please try again later.");
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
