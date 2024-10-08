document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages-container');

    async function loadAnnouncements() {
        const messagesContainer = document.getElementById('messages-container');
    
        try {
            const response = await fetch('/student/announcements');
            if (response.ok) {
                const announcements = await response.json();
                messagesContainer.innerHTML = ''; // Clear previous announcements
    
                announcements.forEach(announcement => {
                    const announcementDiv = document.createElement('div');
                    announcementDiv.classList.add('announcement'); // Optional: Add a class for styling
    
                    // Create content for the announcement
                    announcementDiv.innerHTML = `
                        <strong>Sender: ${announcement.senderName}</strong>
                        <p><strong>Description:</strong> ${announcement.description}</p>
                        ${announcement.file ? `<p><strong>File:</strong> <a href="${announcement.file}" target="_blank">Download File</a></p>` : ''}
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
});
