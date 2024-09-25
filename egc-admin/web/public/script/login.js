// const input = document.getElementsByClassName("login_password_field")[0];
// const toggle = document.getElementsByClassName("login_password_icon")[0];

// toggle.addEventListener("click", () => {
//     if (input.type === "password") {
//         input.type = "text";
//         toggle.setAttribute("src", "/img/show_password.png");
//     } else {
//         input.type = "password";
//         toggle.setAttribute("src", "/img/hide_password.png");
//     }
// });



// Toggle password visibility
const input = document.getElementsByClassName("login_password_field")[0];
const toggle = document.getElementsByClassName("login_password_icon")[0];

toggle.addEventListener("click", () => {
    if (input.type === "password") {
        input.type = "text";
        toggle.setAttribute("src", "/img/show_password.png");
    } else {
        input.type = "password";
        toggle.setAttribute("src", "/img/hide_password.png");
    }
});

// Handle form submission
document.getElementById('login_form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the default way

    const formData = new FormData(this); // Automatically handles file inputs

    try {
        const response = await fetch('/login', {
            method: 'POST',
            body: formData // Send FormData object directly
        });

        if (!response.ok) {
            // Assuming the server sends error messages in the response body
            const errorMessage = await response.text();
            alert(errorMessage);
        } else {
            const data = await response.json();
            localStorage.setItem('userData', JSON.stringify(data));

            // Set user type in localStorage based on server response
            if (data.userType === 'doctor') {
                localStorage.setItem('userType', 'doctor');
            } else if (data.userType === 'teaching_assistant') {
                localStorage.setItem('userType', 'teaching_assistant');
            }

            window.location.href = '/home';
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});





// document.getElementById('login_form').addEventListener('submit', async function(event) {
//     event.preventDefault(); // Prevent the form from submitting the default way

//     const formData = new FormData(this); // Automatically handles file inputs

//     const response = await fetch('/login', {
//         method: 'POST',
//         body: formData // Send FormData object directly
//     });

//     if (!response.ok) {
//         alert(response.headers.get('message'));
//     } else {
//         const data = await response.json();
//         localStorage.setItem('userData', JSON.stringify(data));

//         // تعيين نوع المستخدم بناءً على البيانات المستلمة من السيرفر
//         if (data.userType === 'doctor') {
//             localStorage.setItem('userType', 'doctor');
//         } else if (data.userType === 'teaching_assistant') {
//             localStorage.setItem('userType', 'teaching_assistant');
//         }

//         window.location.href = '/home';
//     }
// });


















// /*
// loginForm.addEventListener("submit", (e) => {
//     e.preventDefault();

//     let privilage = "";
//     const radios = document.querySelectorAll("input[type=radio]");
//     for (let i = 0; i < radios.length; i++) {
//         if (radios[i].checked) {
//             privilage = radios[i].value;
//             break;
//         }
//     }

//     window.location.href = "ahahaha?privilage=" + privilage;
// });*/