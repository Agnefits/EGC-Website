document.addEventListener('DOMContentLoaded', () => {
    loadTeachingAssistants();

    // إضافة مستمع حدث لقائمة الأقسام
    document.getElementById('major').addEventListener('change', loadTeachingAssistants);
});

async function loadTeachingAssistants() {
    try {
        const response = await fetch('/teaching-assistants');
        if (!response.ok) {
            throw new Error('Failed to fetch teaching assistants');
        }

        const teachingAssistants = await response.json();
        console.log('Fetched teaching assistants:', teachingAssistants);

        const teachingAssistantsTableBody = document.getElementById('teachingAssistantsTableBody');
        if (!teachingAssistantsTableBody) {
            throw new Error('Table body element not found');
        }

        teachingAssistantsTableBody.innerHTML = ''; // Clear the table before adding new rows

        // الحصول على قيمة القسم المحدد
        const selectedMajor = document.getElementById('major').value;

        // فلترة المساعدين بناءً على القسم المحدد
        const filteredTeachingAssistants = teachingAssistants.filter(teachingAssistant => {
            return !selectedMajor || teachingAssistant.major === selectedMajor;
        });

        filteredTeachingAssistants.forEach(teachingAssistant => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${teachingAssistant.name || 'N/A'}</td>
                <td>${teachingAssistant.email || 'N/A'}</td>
                <td>${teachingAssistant.phone || 'N/A'}</td>
                <td>${teachingAssistant.username || 'N/A'}</td>
                <td>${teachingAssistant.major || 'N/A'}</td>
                <td>
                    <button class="details-btn show-details showCV ${teachingAssistant.cvFile? "" : "btn-disabled"}" data-id="${teachingAssistant.id}" ${teachingAssistant.cvFile? "" : "disabled"}>
                        Show Cvs
                    </button>
                </td>
                <td>
                    <button class="details-btn edit" data-id="${teachingAssistant.id}">Edit</button>
                    <button class="details-btn delete" data-id="${teachingAssistant.id}">Delete</button>
                </td>
            `;
            teachingAssistantsTableBody.appendChild(row);
        });

        addEventListeners(); // إضافة مستمعات الأحداث لأزرار التعديل والحذف
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading teaching assistants');
    }
}

function addEventListeners() {
    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', async (event) => {
            const teachingAssistantId = event.target.dataset.id;
            if (!teachingAssistantId) {
                alert('Teaching Assistant ID is missing for delete action');
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
                    const deleteResponse = await fetch(`/delete-teaching-assistant/${teachingAssistantId}`, {
                        method: 'DELETE'
                    });
    
                    if (!deleteResponse.ok) {
                        throw new Error('Failed to delete Teaching Assistant');
                    }
    
                    // Reload the list of teaching assistants after successful deletion
                    loadTeachingAssistants();
    
                    // Show success popup after deletion
                    showPopup();
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error deleting Teaching Assistant');
                }
            }
        });
    });
    document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', async(event) => {
            const teachingAssistantId = event.target.dataset.id;

            if (!teachingAssistantId) {
                alert('Teaching Assistant ID is missing');
                return;
            }

            try {
                const response = await fetch(`/teaching-assistants/${teachingAssistantId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch Teaching Assistant details');
                }

                const teachingAssistant = await response.json();
                console.log('Fetched Teaching Assistant:', teachingAssistant);

                if (teachingAssistant && teachingAssistant.id) {
                    localStorage.setItem('teachingAssistantData', JSON.stringify(teachingAssistant));
                    window.location.href = '/admin/EditTeachingAssistant';
                } else {
                    throw new Error('Teaching Assistant data is incomplete');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error fetching Teaching Assistant details');
            }
        });
    });

    document.querySelectorAll('.showCV').forEach(button => {
        button.addEventListener('click', async(event) => {
            const teachingAssistantId = event.target.dataset.id;

            if (!teachingAssistantId) {
                alert('Teaching Assistant ID is missing');
                return;
            }
            window.open('/teaching-assistants/cvFile/' + teachingAssistantId, "_blank");
        });
    });
}

document.getElementsByClassName("add-btn")[0].addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/admin/AddTeachingAssistant";
});
function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'success!',
        text: 'The teaching assistant has been deleted',
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