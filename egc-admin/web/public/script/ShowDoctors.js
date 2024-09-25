function searchDoctors() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const tableRows = document.querySelectorAll('#doctorsTableBody tr');

    tableRows.forEach(row => {
        // Get the columns for name, department, and email
        const name = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const department = row.querySelector('td:nth-child(6)').textContent.toLowerCase();
        const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();

        // Check if any of the columns contain the search input
        if (name.includes(searchInput) || department.includes(searchInput) || email.includes(searchInput)) {
            row.style.display = ''; // Show the row
        } else {
            row.style.display = 'none'; // Hide the row
        }
    });
}



document.addEventListener('DOMContentLoaded', loadDoctors);

async function loadDoctors() {

    const response = await fetch('/doctors');
    if (!response.ok) {
        throw new Error('Failed to fetch doctors');
    }

    const doctors = await response.json();
    console.log('Fetched doctors:', doctors); // أضف هذا السطر للتحقق من البيانات

    const DoctorsTableBody = document.getElementById('doctorsTableBody');
    if (!DoctorsTableBody) {
        throw new Error('Table body element not found');
    }

    DoctorsTableBody.innerHTML = ''; // Clear the table before adding new rows

    doctors.forEach(doctor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doctor.name || 'N/A'}</td>
            <td>${doctor.email || 'N/A'}</td>
            <td>${doctor.phone || 'N/A'}</td>
            <td>${doctor.username || 'N/A'}</td>
            <td>${doctor.major || 'N/A'}</td>
         
            <td>
                <button class="details-btn edit" data-id="${doctor.id}">Edit</button>
                <button class="details-btn delete" data-id="${doctor.id}">Delete</button>
            </td>
        `;

        DoctorsTableBody.appendChild(row);
    });

    addEventListeners(); // نقل عملية إضافة المستمعات إلى دالة منفصلة

}

function addEventListeners() {
    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', async(event) => {
            const doctorId = event.target.dataset.id;
            if (!doctorId) {
                alert('Doctor ID is missing for delete action');
                return;
            }

            const confirmation = confirm('Are you sure you want to delete this doctor?');
            if (confirmation) {
                try {
                    const deleteResponse = await fetch(`/delete-doctor/${doctorId}`, {
                        method: 'DELETE'
                    });

                    if (!deleteResponse.ok) {
                        throw new Error('Failed to delete doctor');
                    }

                    loadDoctors(); // Reload the list of students after deletion
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error deleting doctor');
                }
            }
        });
    });

    document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', async(event) => {
            const doctorId = event.target.dataset.id;

            if (!doctorId) {
                alert('doctor ID is missing');
                return;
            }

            try {
                const response = await fetch(`/doctors/${doctorId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch doctor details');
                }

                const doctor = await response.json();
                console.log('Fetched doctor:', doctor); // أضف هذا السطر للتحقق من البيانات

                // Ensure the data contains ID
                if (doctor && doctor.id) {
                    localStorage.setItem('doctorData', JSON.stringify(doctor));
                    window.location.href = '/admin/EditDoctor';
                } else {
                    throw new Error('doctor data is incomplete');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching doctor details');
            }
        });
    });
}

document.getElementsByClassName("add-btn")[0].addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/admin/AddDoctor";
});