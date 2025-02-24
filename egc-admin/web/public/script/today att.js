async function fetchAttendance(date) {
  try {
      const response = await fetch(`/today_attendance/${date}`);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const attendanceData = await response.json();

      const studentsTableBody = document.getElementById('studentsTableBody');
      studentsTableBody.innerHTML = '';

      let totalStudents = 0;
      let totalPresent = 0;
      let totalAbsent = 0;

      attendanceData.forEach(student => {
          totalStudents++; 

          if (student.status === 'P') {
              totalPresent++;
          } else if (student.status === 'A') {
              totalAbsent++;
          }

          const listItem = document.createElement('li');
          listItem.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="margin-left: auto;">Student Name : ${student.name || 'N/A'} Status : ${student.status || 'N/A'}</span>
              </div>
          `;
          studentsTableBody.appendChild(listItem);

          // استدعاء دالة markAttendance بعد إضافة كل عنصر
          markAttendance(listItem, student.status); // تطبيق الألوان بناءً على حالة الحضور
      });

      document.getElementById('totalStudents').textContent = totalStudents;
      document.getElementById('totalPresent').textContent = totalPresent;
      document.getElementById('totalAbsent').textContent = totalAbsent;
  } catch (error) {
      console.error('Error fetching attendance data:', error);
  }
}


async function loadStudents() {
  const department = document.getElementById('department').value;
  const yearLevel = document.getElementById('yearlevel').value;
  const section = document.getElementById('n_section').value;
  const course = document.getElementById('course').value;
  const dateValue = document.getElementById('date').value; 

  if (!dateValue) {
      console.error("Date is not selected!");
      return;
  }

  try {
      let response = await fetch(`/admin/courses/${department}/${yearLevel}`);

      if (!response.ok) {
          throw new Error('Failed to fetch courses');
      }

      const courses = await response.json();
      const CourseSelect = document.getElementById('course');
      if (!CourseSelect) {
          throw new Error('Table body element not found');
      }
      CourseSelect.innerHTML = "<option value=''>Select Course</option>";

      courses.forEach(course => {
          const option = document.createElement('option');
          option.value = course.id;
          option.textContent = course.name;
          CourseSelect.appendChild(option);
      });

      response = await fetch('/students');
      if (!response.ok) throw new Error('Failed to fetch students');

      const students = await response.json();
      const sectionSelect = document.getElementById('n_section');
      const sections = [];
      sectionSelect.innerHTML = "<option value=''>Select Section</option>";
      students.forEach(element => {
          if (!sections.includes(element.No_section)) {
              sections.push(element.No_section);
              const option = document.createElement('option');
              option.value = element.No_section;
              option.textContent = "Section " + element.No_section;
              sectionSelect.appendChild(option);
          }
      });
    
        const dateValue = document.getElementById('date').value; 
      fetchAttendance(dateValue); 

  } catch (error) {
      console.error('Error:', error);
      alert('Error loading students');
  }
}

document.getElementById('department').addEventListener('change', loadStudents);
document.getElementById('yearlevel').addEventListener('change', loadStudents);
document.getElementById('course').addEventListener('change', loadStudents);
document.getElementById('n_section').addEventListener('change', loadStudents);
document.getElementById('date').addEventListener('change', loadStudents);

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toLocaleDateString('en-CA');
  document.getElementById('date').value = today; 
});

  
  function markAttendance(listItem, status) {
  
    listItem.classList.remove('present', 'absent');
    listItem.style.backgroundColor = '';

    if (status === 'P') {
      listItem.classList.add('present');
      listItem.style.backgroundColor = '#c6efce'; 
    } else if (status === 'A') {
      listItem.classList.add('absent');
      listItem.style.backgroundColor = '#ffc7ce'; 
    }
  
    updateAttendanceSummary();
  }
  
  function updateAttendanceSummary() {
    const totalStudents = document.getElementById('studentsTableBody').getElementsByTagName('li').length;
    let totalPresent = 0;
    let totalAbsent = 0;
  
    const listItems = document.querySelectorAll('#studentsTableBody li');
    listItems.forEach(listItem => {
      if (listItem.classList.contains('P')) {
        totalPresent++;
      } else if (listItem.classList.contains('A')) {
        totalAbsent++;
      }
    });
  
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalPresent').textContent = totalPresent;
    document.getElementById('totalAbsent').textContent = totalAbsent;
  }
  
  