
document.addEventListener('DOMContentLoaded', () => {
    // Load students when the page loads
    loadStudents();

    // Restore checkbox states from localStorage
    restoreCheckboxStates();

    // Add event listeners for dropdowns
    document.getElementById('department').addEventListener('change', loadStudents);
    document.getElementById('yearlevel').addEventListener('change', loadStudents);
    document.getElementById('n_section').addEventListener('change', loadStudents);

    // Add event listener for sorting by name
    document.querySelector('th.sortable').addEventListener('click', () => {
        sortTableByName();
    });

    // Add event listeners for the master checkboxes
    document.getElementById('show-all-grades').addEventListener('change', handleShowAllChange);
    document.getElementById('hide-all-grades').addEventListener('change', handleHideAllChange);
});

async function loadStudents() {
    try {
        const response = await fetch('/students');
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        console.log('Fetched students:', students); // For debugging

        // Get values from dropdowns
        const department = document.getElementById('department').value;
        const yearLevel = document.getElementById('yearlevel').value;
        const section = document.getElementById('n_section').value;

        const studentsTableBody = document.getElementById('studentsTableBody');
        if (!studentsTableBody) {
            throw new Error('Table body element not found');
        }

        studentsTableBody.innerHTML = ''; // Clear table before adding new rows

        // Filter students based on selections
        const filteredStudents = students.filter(student => {
            return (!department || student.department === department) &&
                (!yearLevel || student.year_level === yearLevel) &&
                (!section || student.no_section === section);
        });

        // Display filtered students in the table
        filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name || 'N/A'}</td>
                <td>${student.department || 'N/A'}</td>
                <td>${student.year_level || 'N/A'}</td>
                <td>${student.no_section || 'N/A'}</td>
                <td>${student.total_grade || 'N/A'}</td>
                <td>
                    <input type="checkbox" class="grade-checkbox show-grade" name="gradeVisibility-${student.id}-show" data-id="${student.id}">
                    Show Grade
                    <input type="checkbox" class="grade-checkbox hide-grade" name="gradeVisibility-${student.id}-hide" data-id="${student.id}">
                    Hide Grade
                </td>
                <td>
                    <button class="details-btn show-details" data-id="${student.id}" onclick="window.location.href='/admin/Grades?studentId=${student.id}'">
                        Show Details
                    </button>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });

        // Restore checkbox states after appending rows
        restoreCheckboxStates();

        // Attach event listeners for checkboxes
        document.querySelectorAll('.grade-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading students');
    }
}

function handleShowAllChange(event) {
    const isChecked = event.target.checked;

    if (isChecked) {
        document.getElementById('hide-all-grades').checked = false;

        // Check all 'Show Grade' checkboxes and uncheck 'Hide Grade'
        document.querySelectorAll('.show-grade').forEach(checkbox => {
            checkbox.checked = true;
            localStorage.setItem(checkbox.name, true); // Save to localStorage
        });
        document.querySelectorAll('.hide-grade').forEach(checkbox => {
            checkbox.checked = false;
            localStorage.setItem(checkbox.name, false); // Save to localStorage
        });
    } else {
        document.querySelectorAll('.show-grade').forEach(checkbox => {
            checkbox.checked = false;
            localStorage.setItem(checkbox.name, false); // Save to localStorage
        });
    }
}

function handleHideAllChange(event) {
    const isChecked = event.target.checked;

    if (isChecked) {
        document.getElementById('show-all-grades').checked = false;

        // Check all 'Hide Grade' checkboxes and uncheck 'Show Grade'
        document.querySelectorAll('.hide-grade').forEach(checkbox => {
            checkbox.checked = true;
            localStorage.setItem(checkbox.name, true); // Save to localStorage
        });
        document.querySelectorAll('.show-grade').forEach(checkbox => {
            checkbox.checked = false;
            localStorage.setItem(checkbox.name, false); // Save to localStorage
        });
    } else {
        document.querySelectorAll('.hide-grade').forEach(checkbox => {
            checkbox.checked = false;
            localStorage.setItem(checkbox.name, false); // Save to localStorage
        });
    }
}

function handleCheckboxChange(event) {
    const clickedCheckbox = event.target;
    const id = clickedCheckbox.dataset.id;

    // Uncheck the other checkbox in the same row
    document.querySelectorAll(`input[name^="gradeVisibility-${id}"]`).forEach(checkbox => {
        if (checkbox !== clickedCheckbox) {
            checkbox.checked = false;
            localStorage.setItem(checkbox.name, false); // Save to localStorage
        }
    });

    // Save the state of the clicked checkbox to localStorage
    localStorage.setItem(clickedCheckbox.name, clickedCheckbox.checked);
}

function restoreCheckboxStates() {
    // Restore states for all grade checkboxes
    document.querySelectorAll('.grade-checkbox').forEach(checkbox => {
        const storedValue = localStorage.getItem(checkbox.name);
        checkbox.checked = storedValue === 'true'; // Convert stored value to boolean
    });
}

function sortTableByName() {
    const table = document.querySelector('.students-table');
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const isAscending = table.dataset.sortDirection === 'asc';
    table.dataset.sortDirection = isAscending ? 'desc' : 'asc';

    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[0].textContent.trim(); // Name is in the first column
        const cellB = rowB.children[0].textContent.trim();

        if (cellA > cellB) return isAscending ? 1 : -1;
        if (cellA < cellB) return isAscending ? -1 : 1;
        return 0;
    });

    const tbody = table.querySelector('tbody');
    rows.forEach(row => tbody.appendChild(row)); // Reorder rows in the table
}
