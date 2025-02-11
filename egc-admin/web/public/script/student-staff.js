// Function to fetch staff details from the backend
async function fetchStaff(studentId) {
    try {
      const response = await fetch(`http://localhost:8080?studentId=${studentId}`);
      const staff = await response.json();
  
      // Call display function to show the data on the page
      displayStaff(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  }
  
  // Function to dynamically display staff on the page
  function displayStaff(staff) {
    const staffContainer = document.querySelector('.staff');
    staffContainer.innerHTML = ''; // Clear existing staff
  
    // Iterate through each staff member and create HTML structure
    staff.forEach(person => {
      const staffDiv = document.createElement('div');
      staffDiv.classList.add('column');
      
      staffDiv.innerHTML = `
        <img class="im" src="${person.photo}" alt="${person.name}">
        <div class="icon2">
          <a href="mailto:${person.email}"><img class="img" src="/img/email1.png" alt="Email Icon"></a>
        </div>
        <h3>${person.name}</h3>
        <p>${person.major}</p>
        <b><p>Office Hours: ${person.office_hours || "Not available"}</p></b>
      `;
  
      staffContainer.appendChild(staffDiv);
    });
  }
  
  // Fetch staff details when the page loads, using a sample studentId
  document.addEventListener('DOMContentLoaded', () => {
    const studentId = 1; // Replace this with the dynamic student ID logic
    fetchStaff(studentId);
  });


  
  
  let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
});

function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
}

const logout = document.getElementById("log_out");
logout.addEventListener("click", () => {
    localStorage.clear("userData");
    location.href = "/home";
});


var userData = JSON.parse(localStorage.getItem("userData"));
if (userData) {
    document.getElementsByClassName("profile")[0].getElementsByClassName("name")[0].innerText = userData.name;
    document.getElementsByClassName("profile")[0].getElementsByClassName("email")[0].innerText = userData.email;
    if (userData.photo) {
        document.querySelector(".profile-details img").src = (userData.role == "Student") + '/photo/' + userData.id;
    }
}