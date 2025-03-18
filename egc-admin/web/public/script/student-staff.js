async function fetchStaff(department, year) {
  try {
    const response = await fetch(`/showstaff/${department}/${year}`);
    if (response.ok) {
      const staff = await response.json();
      displayStaff(staff);
    } else {
      console.error("Server Error:", await response.text());
    }
    
  } catch (error) {
    console.error("Error fetching staff:", error);
  }
}

function displayStaff(staff) {
  const staffContainer = document.querySelector(".staff");
  staffContainer.innerHTML = ""; // Clear existing staff

  staff.forEach((person) => {
    if (person.doctorName) {
      const doctorDiv = document.createElement("div");
      doctorDiv.classList.add("column");

      doctorDiv.innerHTML = `
        <img class="im" src="${
          person.doctorPhoto ? `/staffImage/${person.doctorEmail}` : "/img/images (2).png"
        }" alt="${person.doctorName}">
        <div class="icon2">
          <a href="mailto:${person.doctorEmail}">
          <img class="img" src="/img/email1.png" alt="Email Icon">
           <p>${person.doctorEmail}</p>
          </a>
        </div>
        <h3>${person.doctorName}</h3>
        <p>${person.doctorMajor}</p>
        
      `;
      staffContainer.appendChild(doctorDiv);
    }

    if (person.assistantName) {
      const assistantDiv = document.createElement("div");
      assistantDiv.classList.add("column");

      assistantDiv.innerHTML = `
        <img class="im" src="${
          person.assistantPhoto ? `/staffImage/${person.assistantEmail}` : "/img/images (2).png"
        }" alt="${person.assistantName}">
        <div class="icon2">
          <a href="mailto:${person.assistantEmail}">
            <img class="img" src="/img/email1.png" alt="Email Icon">
                       <p>${person.assistantEmail}</p>
          </a>
        </div>
        <h3>${person.assistantName}</h3>
        <p>${person.assistantMajor}</p>
      `;
      staffContainer.appendChild(assistantDiv);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  var userData = JSON.parse(localStorage.getItem("userData"));
  var year = userData.year_level;
  var department = userData.department;
  fetchStaff(department, year);
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
        document.querySelector(".profile-details img").src = (userData.role == "Student") ? '/photo/' + userData.id : "/img/images (2).png";
    }
}