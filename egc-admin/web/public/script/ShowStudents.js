
document.addEventListener('DOMContentLoaded', () => {
    // Load students when the page loads
    loadStudents();

    // Add event listeners for dropdowns
    document.getElementById('department').addEventListener('change', loadStudents);
    document.getElementById('yearlevel').addEventListener('change', loadStudents);
    document.getElementById('n_section').addEventListener('change', loadStudents);
});

async function loadStudents() {
    try {
        const response = await fetch('/students');
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        console.log('Fetched students:', students); // For debugging

        const studentsTableBody = document.getElementById('studentsTableBody');
        if (!studentsTableBody) {
            throw new Error('Table body element not found');
        }

        studentsTableBody.innerHTML = ''; // Clear the table before adding new rows

        // Get values from dropdowns
        const department = document.getElementById('department').value;
        const yearLevel = document.getElementById('yearlevel').value;
        const section = document.getElementById('n_section').value;

        // Filter students based on selections
        const filteredStudents = students.filter(student => {
            return (!department || student.department === department) &&
                (!yearLevel || student.year_level === yearLevel) &&
                (!section || student.No_section == section);
        });

        filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name || 'N/A'}</td>
                <td>${student.department || 'N/A'}</td>
                <td>${student.year_level || 'N/A'}</td>
                <td>${student.email || 'N/A'}</td>
                <td>${student.phone || 'N/A'}</td>
                <td>${student.national_id || 'N/A'}</td>
                <td>${student.gender || 'N/A'}</td>
                <td>${student.username || 'N/A'}</td>
                <td>
                    <button class="details-btn edit" data-id="${student.id}">Edit</button>
                    <button class="details-btn delete" data-id="${student.id}">Delete</button>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });

        addEventListeners(); // Add event listeners for buttons after loading students
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading students');
    }
}

function addEventListeners() {
    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', async (event) => {
            const studentId = event.target.dataset.id;
            if (!studentId) {
                alert('student ID is missing for delete action');
                return;
            }
    
            // Show SweetAlert2 confirmation popup
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });
    
            if (result.isConfirmed) {
                try {
                    const deleteResponse = await fetch(`/delete-student/${studentId}`, {
                        method: 'DELETE'
                    });
    
                    if (!deleteResponse.ok) {
                        throw new Error('Failed to delete student');
                    }
    
                    loadStudents(); // Reload the list of doctors after deletion
    
                    // Show success popup after deletion
                    showPopup();
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error deleting student');
                }
            }
        });
    });

    document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', async(event) => {
            const studentId = event.target.dataset.id;

            if (!studentId) {
                alert('Student ID is missing');
                return;
            }

            try {
                const response = await fetch(`/students/${studentId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch student details');
                }

                const student = await response.json();
                console.log('Fetched student:', student); // For debugging

                // Ensure the data contains ID
                if (student && student.id) {
                    localStorage.setItem('studentData', JSON.stringify(student));
                    window.location.href = '/admin/EditStudent';
                } else {
                    throw new Error('Student data is incomplete');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching student details');
            }
        });
    });
}

document.getElementsByClassName("add-btn")[0].addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/admin/AddStudent";
});
function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'success!',
        text: 'The student has been deleted',
        width: '320px',
        heightAuto: false,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        backdrop: false,
        customClass: {
            popup: 'custom-popup',
            icon: 'custom-icon'
        }
    });

 
}
