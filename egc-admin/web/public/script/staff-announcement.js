document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('message-form');

    if (messageForm) {
        messageForm.addEventListener('submit', async function(event) { // Use 'function' to maintain 'this' context
            event.preventDefault();

            // Create FormData object from the form
            const formData = new FormData(this); // Automatically handles file inputs
            
            const description = document.getElementById('description').value.trim();

            if (!description) {
                alert('Please enter a description');
                return;
            }

            // Fetch course data from localStorage
            const courseData = JSON.parse(localStorage.getItem('courseData'));
            formData.append("courseId", courseData.id); // Append courseId to formData

            // Fetch user data from localStorage
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            // Add senderId and role (either doctor or teaching assistant) to the form
            formData.append("senderId", userData.id);
            formData.append("senderName", userData.name); // Add sender's name
            formData.append("senderRole", userData.role); // role should be 'Doctor' or 'Teaching Assistant'

            // Append doctor or teaching assistant ID based on the role
            if (userData["role"] === 'Doctor') {
                formData.append("doctorId", userData.id);
            } else {
                formData.append("teaching_assistantId", userData.id);
            }

            try {
                const response = await fetch('/add-announcement', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Announcement sent successfully!');
                    loadAnnouncements(); // Load updated announcements
                    messageForm.reset(); // Reset form after success
                } else {
                    alert('Failed to send announcement');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });

        async function loadAnnouncements() {
            const messagesContainer = document.getElementById('messages-container');
        
            try {
                const response = await fetch('/courses/announcements');
                if (response.ok) {
                    const announcements = await response.json();
                    console.log(announcements); // Check the structure of the response
                    messagesContainer.innerHTML = '';
        
                    announcements.forEach(announcement => {
                        const announcementDiv = document.createElement('div');
                        announcementDiv.classList.add('announcement');
        
                        let fileName = '';
                        if (announcement.file && typeof announcement.file === 'string' && announcement.file !== '') {
                            fileName = announcement.file.split('/').pop();
                        }
        
                        announcementDiv.innerHTML = `
                            <strong>Sender: ${announcement.senderName}</strong>
                            <p><strong>Description:</strong> ${announcement.description}</p>
                            ${fileName ? `
                                <div class="file-item">
                                    <p><strong>File:</strong> 
                                    <a href="${announcement.file}" target="_blank">${fileName}</a></p>
                                </div>` : '<p>No file attached</p>'}
                            <p><strong>Date:</strong> ${new Date(announcement.date).toLocaleString()}</p>
                        `;
        
                        messagesContainer.appendChild(announcementDiv);
                    });
                } else {
                    messagesContainer.innerHTML = '<p>Failed to load announcements</p>';
                }
            } catch (error) {
                console.error('Error loading announcements:', error);
                messagesContainer.innerHTML = '<p>An error occurred while loading announcements.</p>';
            }
        }

        loadAnnouncements(); // Load announcements when the page is loaded
    } else {
        console.error('Form with ID "message-form" not found.');
    }
});
