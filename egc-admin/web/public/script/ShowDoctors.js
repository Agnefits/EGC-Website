document.addEventListener('DOMContentLoaded', () => {
    loadDoctors();

    document.getElementById('major').addEventListener('change', loadDoctors);
});

async function loadDoctors() {
    const response = await fetch('/doctors');
    if (!response.ok) {
        throw new Error('Failed to fetch doctors');
    }

    const doctors = await response.json();
    console.log('Fetched doctors:', doctors);

    const DoctorsTableBody = document.getElementById('doctorsTableBody');
    if (!DoctorsTableBody) {
        throw new Error('Table body element not found');
    }

    DoctorsTableBody.innerHTML = ''; // Clear the table before adding new rows
    const selectedMajor = document.getElementById('major').value;
    const filtereddoctors = doctors.filter(doctor => {
        return !selectedMajor || doctor.major === selectedMajor;
    });

    filtereddoctors.forEach(doctor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doctor.name || 'N/A'}</td>
            <td>${doctor.email || 'N/A'}</td>
            <td>${doctor.phone || 'N/A'}</td>
            <td>${doctor.username || 'N/A'}</td>
            <td>${doctor.major || 'N/A'}</td> 
            <td>
                <button class="details-btn show-details showCV ${doctor.cvFile? "" : "btn-disabled"}" data-id="${doctor.id}" ${doctor.cvFile? "" : "disabled"}>
                    Show Cvs
                </button>
            </td>
            <td>
                <button class="details-btn edit" data-id="${doctor.id}">Edit</button>
                <button class="details-btn delete" data-id="${doctor.id}">Delete</button>
            </td>
        `;

        DoctorsTableBody.appendChild(row);
    });

    addEventListeners();
}

function addEventListeners() {
    // document.querySelectorAll('.delete').forEach(button => {
    //     button.addEventListener('click', async (event) => {
    //         const doctorId = event.target.dataset.id;
    //         if (!doctorId) {
    //             alert('Doctor ID is missing for delete action');
    //             return;
    //         }

    //         // const confirmation = confirm('Are you sure you want to delete this doctor?');
    //         // if (confirmation) {
    //             try {
    //                 showPopup();

    //                 const deleteResponse = await fetch(`/delete-doctor/${doctorId}`, {
    //                     method: 'DELETE'
    //                 });

    //                 if (!deleteResponse.ok) {
    //                     throw new Error('Failed to delete doctor');
    //                 }

    //                 loadDoctors(); // Reload the list of doctors after deletion

    //                 // عرض البوب أب بعد نجاح الحذف

    //             } catch (error) {
    //                 console.error('Error:', error);
    //                 alert('Error deleting doctor');
    //             }
    //         // }
    //     });
    //});


    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', async (event) => {
            const doctorId = event.target.dataset.id;
            if (!doctorId) {
                alert('Doctor ID is missing for delete action');
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
                    const deleteResponse = await fetch(`/delete-doctor/${doctorId}`, {
                        method: 'DELETE'
                    });
    
                    if (!deleteResponse.ok) {
                        throw new Error('Failed to delete doctor');
                    }
    
                    loadDoctors(); // Reload the list of doctors after deletion
    
                    // Show success popup after deletion
                    showPopup();
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error deleting doctor');
                }
            }
        });
    });

    document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', async (event) => {
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
                console.log('Fetched doctor:', doctor);

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

    document.querySelectorAll('.showCV').forEach(button => {
        button.addEventListener('click', async (event) => {
            const doctorId = event.target.dataset.id;

            if (!doctorId) {
                alert('doctor ID is missing');
                return;
            }
            window.open('/doctors/cvFile/' + doctorId, "_blank");
        });
    });
}

function showPopup() {
    Swal.fire({
        icon: 'success',
        title: 'success !',
        text: 'The doctor has been deleted',
        width: '320px',
        heightAuto: false,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        backdrop: false,
        customClass: {
            popup: 'custom-popup',
            icon: 'custom-icon'
        },
    });
}

document.getElementsByClassName("add-btn")[0].addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/admin/AddDoctor";
});