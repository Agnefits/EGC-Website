function filterAttendance() {
    const nameFilter = document.getElementById('name').value.toLowerCase();
    const majorFilter = document.getElementById('major').value;
    const yearFilter = document.getElementById('year').value;
    const sectionFilter = document.getElementById('section').value;
    const courseFilter = document.getElementById('coursefilter').value;
    const dateFrom = new Date(document.getElementById('date-from').value);
    const dateTo = new Date(document.getElementById('date-to').value);
    const rows = document.querySelectorAll('#attendance-table tbody tr');

    rows.forEach(row => {
        const major = row.getAttribute('data-major');
        const year = row.getAttribute('data-year');
        const section = row.getAttribute('data-section');
        const course = row.getAttribute('data-course');
        const rowDate = new Date(row.getAttribute('data-date'));
        
        // Extracting name from the student info section
        const studentName = document.querySelector('.student-info h2').textContent.split(': ')[1].toLowerCase();

        // Filtering logic
        const isNameMatch = nameFilter === '' || studentName.includes(nameFilter);
        const isMajorMatch = majorFilter === 'all' || major === majorFilter;
        const isYearMatch = yearFilter === 'all' || year === yearFilter;
        const isSectionMatch = sectionFilter === 'all' || section === sectionFilter;
        const isCourseMatch = courseFilter === 'all' || course === courseFilter;
        const isDateMatch = (!dateFrom || rowDate >= dateFrom) && (!dateTo || rowDate <= dateTo);

        if (isNameMatch && isMajorMatch && isYearMatch && isSectionMatch && isCourseMatch && isDateMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
