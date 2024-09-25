const quizData = JSON.parse(localStorage.getItem('quizData'));

document.addEventListener('DOMContentLoaded', loadQuizData);


async function loadQuizData() {

    if (quizData) {
        if (!quizData[0].id) {
            alert('Quiz ID is missing');
            return;
        } else {
            document.getElementById('instructor').innerText = quizData[0].instructor;
            document.getElementById('title').innerText = quizData[0].title;
            document.getElementById('date').innerText = "Uploaded on: " + quizData[0].date.split(" ")[0];
            document.getElementById('deadline').innerText = "Deadline on: " + quizData[0].deadline;
            let degree = 0;
            for (let i = 1; i < quizData.length; i++)
                degree += quizData[i].degree;
            document.getElementById('degree').innerText = degree + " Degrees";
            document.getElementById('questions').innerText = (quizData.length - 1) + " Questions";

        }
    }

    loadStudentQuizzes();
}

function toggleDropdown(id) {
    let elements = document.getElementsByClassName("dropdown-content2");

    const dropdown = document.getElementById(`dropdown`);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

async function editQuiz(id) {

    if (!id) {
        alert('quiz ID is missing');
        return;
    }

    try {
        const response = await fetch(`/courses/quizzes/${id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch quiz details');
        }

        const quiz = await response.json();
        console.log('Fetched quiz:', quiz); // أضف هذا السطر للتحقق من البيانات

        // Ensure the data contains ID
        if (quiz && quiz[0].id) {
            localStorage.setItem('quizData', JSON.stringify(quiz));
            window.location.href = '/staff/Course/EditQuiz';
        } else {
            throw new Error('quiz data is incomplete');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching quiz details');
    }
}

async function deleteQuiz(id) {
    try {
        const response = await fetch(`/delete-quiz/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            alert('Quiz deleted successfully!');
            loadQuizzes(); // إعادة تحميل المواد بعد الحذف
        } else {
            console.error('Failed to delete quiz', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

let fullDegree;
async function loadStudentQuizzes() {
    try {
        const quizData = JSON.parse(localStorage.getItem('quizData'));

        fullDegree = quizData.degree;

        const response = await fetch('/student-quizzes/' + quizData[0].id);
        if (response.ok) {
            const quizzes = await response.json();
            displayStudentQuizzes(quizzes);
        } else {
            console.error('Failed to fetch quizzes', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayStudentQuizzes(quizzes) {
    const container = document.getElementById('quizzesContainer');

    quizzes.forEach(quiz => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <div class="card-left">
                <span>${quiz.date.split(" ")[0]}</span>
                <span class="studentDegree"> Degree: ${quiz.score}</span>
            </div>
            <div class="card-right">
                <div class= "studentName">${quiz.student}</div>
                <img class="icon" src="/img/file_icon.png" alt="icon">
            </div>  
        `;

        container.appendChild(card);
    });
}

function goBack() {
    window.location.href = "/staff/Course/Quizzes";
}