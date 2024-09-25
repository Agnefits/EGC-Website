const headerEl = document.querySelector('.header');
document.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        headerEl.classList.add('header-scrolled');
    } else {
        headerEl.classList.remove('header-scrolled');
    }
});
const userData = JSON.parse(localStorage.getItem('userData'));
let privilage = "";
if (userData)
    privilage = userData["role"];

if (privilage === 'Admin') {
    document.getElementById("loginTab").remove();
    document.getElementById("studentDashboardTab").remove();
    document.getElementById("staffDashboardTab").remove();
} else if (privilage === 'Doctor' || privilage === 'TeachingAssistant') {
    document.getElementById("loginTab").remove();
    document.getElementById("studentDashboardTab").remove();
    document.getElementById("adminDashboardTab").remove();

} else if (privilage === 'Student') {
    document.getElementById("loginTab").remove();
    document.getElementById("adminDashboardTab").remove();
    document.getElementById("staffDashboardTab").remove();

} else {
    document.getElementById("adminDashboardTab").remove();
    document.getElementById("staffDashboardTab").remove();
    document.getElementById("studentDashboardTab").remove();
}