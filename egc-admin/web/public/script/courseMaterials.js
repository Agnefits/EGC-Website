document.addEventListener('DOMContentLoaded', () => {
    loadMaterials();
});

async function loadMaterials() {
    try {
        const courseData = JSON.parse(localStorage.getItem('courseData'));

        const response = await fetch('/courses-materials/' + courseData.id);
        if (response.ok) {
            const materials = await response.json();
            displayMaterials(materials);
        } else {
            console.error('Failed to fetch materials', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayMaterials(materials) {
    const container = document.getElementById('materialsContainer');
    container.innerHTML = '';

    materials.forEach(material => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <div class="card-left">
                <div class="menu-icon" onclick="toggleDropdown(${material.id})">&#x2022;&#x2022;&#x2022;</div>
                <span>${material.date}</span>
            </div>
            <div class="card-right">
                <div class = "card-info">
                    <div class= "MaterialSaveAs">${material.saveAs}</div>
                    <div class= "instructorName">${material.instructor}</div>
                </div>
                <a href="/courses/materials/file/${material.id}" target="_blank">
                    <img class="icon" src="/img/file_icon.png" alt="icon">
                </a>
            </div>
            <div id="dropdown-${material.id}" class="dropdown-content2">
                <a href="#" class="edit" onclick="editMaterial(${material.id})">Edit</a>
                <a href="#" class="delete" onclick="deleteMaterial(${material.id})">Delete</a>
            </div>
        `;

        container.appendChild(card);
    });
}

function toggleDropdown(id) {
    let elements = document.getElementsByClassName("dropdown-content2");
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].id != `dropdown-${id}`)
            elements[i].style.display = 'none';
    }

    const dropdown = document.getElementById(`dropdown-${id}`);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

async function editMaterial(id) {

    if (!id) {
        alert('material ID is missing');
        return;
    }

    try {
        const response = await fetch(`/courses/materials/${id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch material details');
        }

        const material = await response.json();
        console.log('Fetched material:', material); // أضف هذا السطر للتحقق من البيانات

        // Ensure the data contains ID
        if (material && material.id) {
            localStorage.setItem('materialData', JSON.stringify(material));
            window.location.href = '/staff/Course/EditMaterial';
        } else {
            throw new Error('material data is incomplete');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching material details');
    }
}

async function deleteMaterial(id) {
    try {
        const response = await fetch(`/delete-material/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            alert('Material deleted successfully!');
            loadMaterials(); // إعادة تحميل المواد بعد الحذف
        } else {
            console.error('Failed to delete material', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function goBack() {
    window.location.href = "/staff/Course/Content";
}

function addMaterial() {
    window.location.href = "/staff/Course/AddMaterial";
}