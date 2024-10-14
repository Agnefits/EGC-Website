
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
        button.addEventListener('click', async(event) => {
            const teachingAssistantId = event.target.dataset.id;
            if (!teachingAssistantId) {
                alert('Teaching Assistant ID is missing for delete action');
                return;
            }

            const confirmation = confirm('Are you sure you want to delete this Teaching Assistant?');
            if (confirmation) {
                try {
                    const deleteResponse = await fetch(`/delete-teaching-assistant/${teachingAssistantId}`, {
                        method: 'DELETE'
                    });

                    if (!deleteResponse.ok) {
                        throw new Error('Failed to delete Teaching Assistant');
                    }

                    loadTeachingAssistants(); // إعادة تحميل قائمة المساعدين بعد الحذف
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
}

document.getElementsByClassName("add-btn")[0].addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/admin/AddTeachingAssistant";
});
