document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.assignment button[type="submit"]');

  buttons.forEach((button) => {
      button.addEventListener('click', (event) => {
          event.preventDefault(); // Prevent default form submission behavior

          const assignmentDiv = event.target.closest('.assignment');
          const fileInput = assignmentDiv.querySelector('input[type="file"]');
          if (fileInput.files.length === 0) {
              alert('Please upload a file before submitting.');
          } else {
              alert('Assignment submitted successfully: ' + fileInput.files[0].name);
              fileInput.value = ''; // Clear the file input
          }
      });
  });
});

document.getElementById('search-button').addEventListener('click', () => {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const assignments = document.querySelectorAll('.assignment');

    assignments.forEach(assignment => {
        const title = assignment.querySelector('h3').textContent.toLowerCase();

        if (title.includes(searchTerm)) {
            assignment.style.display = 'block';
        } else {
            assignment.style.display = 'none';
        }
    });
});



document.addEventListener("DOMContentLoaded", () => {
    const assignments = document.querySelectorAll('.assignment');
    const count = assignments.length;
    
    // Store the count in localStorage
    localStorage.setItem('assignmentCount', count);
});






