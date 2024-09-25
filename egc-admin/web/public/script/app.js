

const questionNumber = document.querySelector(".question-number");
const questionText = document.querySelector(".question-text");
const optionContainer = document.querySelector(".option-container");
const answersIndicatorContainer = document.querySelector(".answers-indicator");
const homeBox =document.querySelector(".home-box");
const quizBox =document.querySelector(".quiz-box");
const resultBox =document.querySelector(".result-box");

let questionCounter =0;
let currentQuestion;
let availableQuestion = [];
let availableOptions = [];
let correctAnswers = 0;
let attempt = 0;

//push the questions into availableQuestion Array
function setAvailableQuestion(){
    const totalQuestion = quiz.length;
    for(let i =0; i<totalQuestion; i++){
        availableQuestion.push(quiz[i])

    }
}
//set question number and question and options
function getNewQuestion(){
    questionNumber.innerHTML= " Question " + (questionCounter + 1) + " of " + quiz.length;
    //set question text
    //get random question
    const questionIndex = availableQuestion[Math.floor(Math.random() *availableQuestion.length)];
    currentQuestion = questionIndex;
    questionText.innerHTML = currentQuestion.q;
    //get the position of 'questionIndex' from the avalialeQuestion Array
    const index1 = availableQuestion.indexOf(questionIndex);
    //remove the 'questionIndex' from the avalialeQuestion Array so that the question dose not repeat
    availableQuestion.splice(index1,1);
    //show question img
    if(currentQuestion.hasOwnProperty("img")){
        const img =document.createElement("img");
        img.src= currentQuestion.img;
        questionText.appendChild(img);

    }
    //set options
    //get the length of options
    const optionLen = currentQuestion.options.length
    //push options into availableOptions Array
    for(let i=0; i<optionLen; i++){
       availableOptions.push(i)
    }

    optionContainer.innerHTML = '';
    let animationDelay = 0.15;
    //create options html
    for(let i=0; i<optionLen; i++){
        //random option  
        const optonIndex = availableOptions[Math.floor(Math.random() * availableOptions.length )];
        //get the position of 'optionIndex' from the availableOptions 
        const index2 = availableOptions.indexOf(optonIndex);
        //remove the 'optionIndex' from the availableOptions , so that the option dose not repeat
        availableOptions.splice(index2,1);
        const option = document.createElement("div");
        option.innerHTML = currentQuestion.options[optonIndex];
        option.id = optonIndex;
        option.style.animationDelay = animationDelay + 's';
        animationDelay = animationDelay + 0.15;
        option.className = "option";
        optionContainer.appendChild(option)
        option.setAttribute("onclick","getResult(this)");

    }
    questionCounter++
}
//get the result of current attempt question
function getResult(element){
    const id = parseInt(element.id);
     //get the answer by comparing the id of clicked option
    if(id === currentQuestion.answer){
        //set the green color to the correct option
        element.classList.add("correct");
        //add the indicator to correct mark
        updateAnswerIndicator("correct");
        correctAnswers++;
    }
    else{
        //set the red color to the incorrect option
        element.classList.add("wrong");
        //add the indicator to wrong mark
        updateAnswerIndicator("wrong");

        //if answer is incorrect the show the correct option by adding green color the correct option
        const optionLen = optionContainer.children.length;
        for(let i=0; i<optionLen;i++){
            if(parseInt(optionContainer.children[i].id) === currentQuestion.answer){
                optionContainer.children[i].classList.add("correct");
            }
        }
    }
    attempt++;
    unclickableOptions();
}
//make all the options unclickable once the user select a option (RESTICT THE USER TO CHANGE THE OPTION AGAIN)
function unclickableOptions(){
    const optionLen = optionContainer.children.length;
    for(let i=0; i<optionLen; i++){
        optionContainer.children[i].classList.add("already-answered");
    }
}

function answersIndicator(){
    answersIndicatorContainer.innerHTML= '';
    const totalQuestion=quiz.length;
    for(let i=0; i<totalQuestion;i++){
        const indicator =document.createElement("div");
        answersIndicatorContainer.appendChild(indicator);
    }
}
 function updateAnswerIndicator(markType){
    answersIndicatorContainer.children[questionCounter-1].classList.add(markType)
 }

function next(){
    if(questionCounter === quiz.length){
        console.log("quiz over")
        quizOver();
    }
    else{
        getNewQuestion();
    }
}

function quizOver(){
    //hide quiz quizBox
    quizBox.classList.add("hide");
    //show resultBox
    resultBox.classList.remove("hide");
    quizResult();
}
//get the quiz result
function quizResult(){
    resultBox.querySelector(".Total-question").innerHTML= quiz.length;
    resultBox.querySelector(".Total-attempt").innerHTML= attempt;
    resultBox.querySelector(".Total-correct").innerHTML= correctAnswers;
    resultBox.querySelector(".Total-wrong").innerHTML= attempt - correctAnswers;
    const presentage = (correctAnswers/quiz.length)*100;
    resultBox.querySelector(".Total-Precentage").innerHTML= presentage.toFixed(2) + "%";
    resultBox.querySelector(".Total-Score").innerHTML= correctAnswers +" / "+ quiz.length;
}

function myFunction() {
    alert("Sucsessful!");
  }

/////starting point/////

function startQuiz(){

    //hide home box
    homeBox.classList.add("hide");
    //show quiz box
    quizBox.classList.remove("hide");

    //first we will set all questions in availableQuestions Array
    setAvailableQuestion();
    //second we will set call get getNewQuestion(); function
    getNewQuestion();
    //to create indicator of answer
    answersIndicator();
}

window.onload = function(){
    homeBox.querySelector(".Total-question").innerHTML =quiz.length;
}