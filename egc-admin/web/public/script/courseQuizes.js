document.addEventListener('DOMContentLoaded', () => {
    loadQuizzes();
});

async function loadQuizzes() {
    try {
        const courseData = JSON.parse(localStorage.getItem('courseData'));

        const response = await fetch('/courses-quizzes/' + courseData.id);
        if (response.ok) {
            const quizzes = await response.json();
            displayQuizzes(quizzes);
        } else {
            console.error('Failed to fetch quizzes', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayQuizzes(quizzes) {
    const container = document.getElementById('quizzesContainer');
    container.innerHTML = '';

    quizzes.forEach(quizzes => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <div class="card-left">
                <div class="menu-icon" onclick="toggleDropdown(${quizzes.id})">&#x2022;&#x2022;&#x2022;</div>
<span>${quizzes.deadline.replace("T", " ")}</span>
            </div>
            <div class="card-right" onclick="showQuizDetails(${quizzes.id})">
                <div class = "card-info">
                    <div class= "quizTitle">${quizzes.title}</div>
                    <div class= "instructorName">${quizzes.instructor}</div>
                </div>
                <img class="icon" src="/img/file_icon.png" alt="icon">
            </div>
            <div id="dropdown-${quizzes.id}" class="dropdown-content2">
                <a href="#" class="edit" onclick="editQuiz(${quizzes.id})">Edit</a>
                <a href="#" class="delete" onclick="deleteQuiz(${quizzes.id})">Delete</a>
            </div>
        `;

        container.appendChild(card);
    });
}

function toggleDropdown(id) {
    let elements = document.getElementsByClassName("dropdown-content2");
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].id != `dropdown-${id}`)
            elements[i].style.display = 'none';
    }

    const dropdown = document.getElementById(`dropdown-${id}`);
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

async function showQuizDetails(id) {

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
            window.location.href = '/staff/Course/QuizDetails';
        } else {
            throw new Error('quiz data is incomplete');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching quiz details');
    }
}

function goBack() {
    window.location.href = "/staff/Course/Content";
}

function addQuiz() {
    window.location.href = "/staff/Course/AddQuiz";
}