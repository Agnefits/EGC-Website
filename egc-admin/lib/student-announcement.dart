import 'dart:html';
import 'dart:convert';

void main() {
  // Load initial data
  loadAnnouncements();

  // Setup event listeners
  querySelector('#coursefilter')?.onChange.listen((event) {
    filterAnnouncements();
  });
}

void loadAnnouncements() {
  // Simulating fetching announcements from local storage
  String? data = window.localStorage['announcements'];
  
  if (data != null) {
    List announcements = json.decode(data);
    displayAnnouncements(announcements);
  }
}

void displayAnnouncements(List announcements) {
  var container = querySelector('.main-content');
  container?.children.clear(); // Clear existing announcements

  for (var announcement in announcements) {
    var commentDiv = DivElement()..classes.add('comment2');
    var profileContainer = DivElement()..classes.add('profile-container');

    var profileImg = ImageElement(src: announcement['profilePic']);
    var instructorName = HeadingElement.h4()..text = announcement['instructor'];

    profileContainer.append(profileImg);
    profileContainer.append(instructorName);
    
    var description = ParagraphElement()..text = announcement['description'];
    
    var fileDownload = DivElement()..classes.add('file-download');
    if (announcement['file'] != null) {
      var fileLink = AnchorElement(href: announcement['file'])..text = 'Download File'..setAttribute('download', '');
      fileDownload.append(fileLink);
    }

    commentDiv.append(profileContainer);
    commentDiv.append(description);
    commentDiv.append(fileDownload);
    
    container?.append(commentDiv);
  }
}

void filterAnnouncements() {
  var selectedCourse = (querySelector('#coursefilter') as SelectElement).value;
  var announcementRows = querySelectorAll('.comment2');

  for (var row in announcementRows) {
    var course = row.getAttribute('data-course');
    if (selectedCourse == '' || course == selectedCourse) {
      row.style.display = ''; // Show the row
    } else {
      row.style.display = 'none'; // Hide the row
    }
  }
}
