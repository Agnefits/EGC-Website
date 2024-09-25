const container = document.getElementById("container");
let questionsNo = 0;

function addQuestion(deletable) {
    {
        questionsNo++;

        const question = document.createElement('div');
        question.className = 'question-container';
        question.id = 'question-' + questionsNo;

        question.innerHTML = `
            <br>
            <hr>
            <div class="type_q">
              <label for="type-${questionsNo}">Question Type</label>
              <select name="type-${questionsNo}" class="type_of_Quisetion" class="t_quiz" id="type-${questionsNo}" required>
                <option value="">Please select</option>
                <option value="bool">True or False</option>
                <option value="multi">Multiple Choice</option>
                <option value="short">Short Answer</option>
              </select>
              </div>
              <div class="q_text">
                  <label for="title-${questionsNo}">Question</label><br>
                  <textarea name="title-${questionsNo}" class="questionTitle" id="title-${questionsNo}" placeholder="Enter your quisetion here" required></textarea>
              </div>
              <div id="q-content-${questionsNo}" dataType="none">
              </div>
              ${deletable? 
              `<button class="remove-quiz">
                  <h5 onclick="removeQuestion(${questionsNo})">Remove Question</h5>
              </button>`:""}
            </div>
        `;

    container.appendChild(question);

    document.getElementById(`type-${questionsNo}`).addEventListener("change", (e) => {
      changeQuestionType(questionsNo);
    })

  }
}

document.getElementById("add-question").addEventListener("click", function(event) {
    event.preventDefault();
    addQuestion(true);
});

document.addEventListener('DOMContentLoaded', addQuestion(false));


function removeQuestion(questionsId) {
  document.getElementById('question-' + questionsId).remove();
}

function changeQuestionType(questionsId) {
  const type = document.getElementById(`type-${questionsId}`).value;
  const questionContent = document.getElementById(`q-content-${questionsId}`);


  if (type == questionContent.dataType)
    return;
  else {
    const degree = questionContent.dataType ? document.getElementById(`degree-${questionsId}`).value : 0;
    switch (type) {
      case "":
        questionContent.innerHTML = ``;
        break;
      case "bool":
        questionContent.innerHTML = `  
            <div class="correctAnswer" id="corectAnswer-${questionsId}">
              <label> Correct Answer : </label>
              <input type="radio" id="radioButton-T-${questionsId}" name="correctAnswer-${questionsId}" value="true" required>
              <label for="radioButton-T-${questionsId}">True</label>
              <input type="radio" id="radioButton-F-${questionsId}" name="correctAnswer-${questionsId}" value="false" required>
              <label for="radioButton-F-${questionsId}">False</label>
              <br>
              <br>
              <label for="degree-${questionsId}">Degree</label>
              <input type="number" id="degree-${questionsId}" name="degree-${questionsId}" class="degree" placeholder="Enter Degree" value="${degree}" required>
            </div>
            `
        break;
      case "multi":
        questionContent.innerHTML = ` 
            <div class="answer-choice">
                <label for="answers-A-${questionsId}">Answer A</label>
                <input type="text" id="answers-A-${questionsId}" name ="answers-A-${questionsId}" class="Choice" placeholder="Enter Answer A" required>
            </div>
            <div class="answer-choice">
                <label for="answers-B-${questionsId}">Answer B</label>
                <input type="text" id="answers-B-${questionsId}" name ="answers-B-${questionsId}" class="Choice" placeholder="Enter Answer B" required>
            </div>
            <div class="answer-choice">
                <label for="answers-C-${questionsId}">Answer C</label>
                <input type="text" id="answers-C-${questionsId}" name ="answers-C-${questionsId}" class="Choice" placeholder="Enter Answer C" required>
            </div>
            <div class="answer-choice">
                <label for="answers-D-${questionsId}">Answer D</label>
                <input type="text" id="answers-D-${questionsId}" name ="answers-D-${questionsId}" class="Choice" placeholder="Enter Answer D" required>
            </div>
            <div class="correctAnswer" id="corectAnswer-${questionsId}">
            <label for="select-${questionsId}">Correct Answer</label>
            <select id="select-${questionsId}" name="correctAnswer-${questionsId}" class="type_of_Quisetion" required>
                    <option value="">Check Answer</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            <br>
            <br>
              <label>Degree</label>
              <input type="number" id="degree-${questionsId}" name="degree-${questionsId}" class="degree" placeholder="Enter Degree" value="${degree}" required>
        </div>
        `
        break;
      case "short":
        questionContent.innerHTML = `  
        <div class="correctAnswer" id="corectAnswer-${questionsId}">
            <label for="correctAnswer-${questionsId}">Correct Answer</label>
            <input type="text" class="c_a" id="correctAnswer-${questionsId}" name="correctAnswer-${questionsId}" placeholder="Correct Answer" required>
            <br>
            <br>
             <label>Degree</label>
              <input type="number" id="degree-${questionsId}" name="degree-${questionsId}" class="degree" placeholder="Enter Degree" value="${degree}" required>
         </div>`
        break;

    }
  }
  questionContent.dataType = type;
}

document.getElementById("addQuizForm").addEventListener("submit", function (event) {
  event.preventDefault();
  let formData = new FormData(this);

  const courseData = JSON.parse(localStorage.getItem('courseData'));

  formData.append("courseId", courseData.id);

  const userData = JSON.parse(localStorage.getItem('userData'));

  if (userData["role"] == 'Doctor')
    formData.append("doctorId", userData.id);
  else
    formData.append("teaching_assistantId", userData.id);

  // Send quiz data via POST request
  fetch('/add-quiz', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.text())
    .then(result => {
      alert(result);
      window.location.href = '/staff/Course/Quizzes';
    })
    .catch(error => {
      console.error('Error:', error);
    });
});