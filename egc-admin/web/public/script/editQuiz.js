const quizData = JSON.parse(localStorage.getItem('quizData'));

const container = document.getElementById("container");
let questionsNo = 0;

function addQuestion(deletable, questionData) {
    {
        questionsNo++;

        if (questionData) {
            const divId = document.createElement('div');
            divId.innerHTML =
                `<input type="hidden" name="id-${questionsNo}" value="${questionData.id}">`;
            container.appendChild(divId);
        }

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
                <option value="bool" ${questionData && questionData.type == "bool"? "selected" : ""}>True or False</option>
                <option value="multi" ${questionData && questionData.type == "multi"? "selected" : ""}>Multiple Choice</option>
                <option value="short" ${questionData && questionData.type == "short"? "selected" : ""}>Short Answer</option>
              </select>
              </div>
              <div class="q_text">
                  <label for="title-${questionsNo}">Question</label><br>
                  <textarea name="title-${questionsNo}" class="questionTitle" id="title-${questionsNo}" placeholder="Enter your quisetion here" required>${questionData && questionData.title? questionData.title : ""}</textarea>
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

    if (questionData) {
      changeQuestionType(questionsNo);
    }

    document.getElementById(`type-${questionsNo}`).addEventListener("change", (e) => {
      changeQuestionType(questionsNo);
    })

  }
}

document.addEventListener('DOMContentLoaded', loadQuizData);

async function loadQuizData() {

  if (quizData) {
    if (!quizData[0].id) {
      alert('Quiz ID is missing');
      return;
    } else {
      document.getElementById('title').value = quizData[0].title;
      document.getElementById('deadline').value = quizData[0].deadline;
      document.getElementById('time').value = quizData[0].time;


      for (let i = 1; i < quizData.length; i++) {
        addQuestion(i != 1, quizData[i]);
        if (quizData[i].type == "bool") {
          document.getElementById(`radioButton-${quizData[i].correctAnswer == "true"? "T" : "F"}-${questionsNo}`).checked = true;
        } else if (quizData[i].type == "multi") {
          document.getElementById(`answers-A-${questionsNo}`).value = quizData[i].answers[0];
          document.getElementById(`answers-B-${questionsNo}`).value = quizData[i].answers[1];
          document.getElementById(`answers-C-${questionsNo}`).value = quizData[i].answers[2];
          document.getElementById(`answers-D-${questionsNo}`).value = quizData[i].answers[3];

          document.getElementById(`select-${questionsNo}`).value = quizData[i].correctAnswer;
        } else if(quizData[i].type == "short") {
          document.getElementById(`correctAnswer-${questionsNo}`).value = quizData[i].correctAnswer
        }
        document.getElementById(`degree-${questionsNo}`).value = quizData[i].degree;
      }

      localStorage.removeItem('quizData');
    }
  }
}

document.getElementById("add-question").addEventListener("click", function (event) {
  event.preventDefault();
  addQuestion(true);
});


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

document.getElementById("editQuizForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  let formData = new FormData(this);

  fetch('/update-quiz/' + quizData[0].id, {
    method: 'PUT',
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