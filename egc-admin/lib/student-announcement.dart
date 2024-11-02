import 'dart:html';
import 'dart:convert';

void main() {
  // Load initial announcements from the server
  loadAnnouncements();

  // Setup event listeners for course filter
  querySelector('#coursefilter')?.onChange.listen((event) {
    filterAnnouncements();
  });
}

// Function to load announcements from the server
void loadAnnouncements() async {
  try {
    final response = await HttpRequest.getString('/student/Announcements'); // Fetch from server
    List<dynamic> announcements = json.decode(response); // Parse JSON response
    displayAnnouncements(announcements); // Display the fetched announcements
  } catch (error) {
    print('Error fetching announcements: $error');
    querySelector('#messages-container')?.innerHtml = '<p>Failed to load announcements</p>';
  }
}

// Function to display announcements in the container
void displayAnnouncements(List announcements) {
  var container = querySelector('#messages-container'); // Corrected to target the right container
  container?.children.clear(); // Clear existing announcements

  for (var announcement in announcements) {
    var announcementDiv = DivElement()..classes.add('announcement');
    
    // Set data-course attribute for filtering
    announcementDiv.setAttribute('data-course', announcement['course'] ?? '');

    // Create profile container
    var profileContainer = DivElement()..classes.add('profile-container');
    var profileImg = ImageElement(src: announcement['profilePicture'] ?? '../img/default-profile.png');
    var instructorName = HeadingElement.h4()..text = announcement['senderName'] ?? 'Unknown';
    
    profileContainer.append(profileImg);
    profileContainer.append(instructorName);

    // Announcement description
    var description = ParagraphElement()..text = announcement['text'] ?? 'No content available.';

    // File download section
    var fileDownload = DivElement()..classes.add('file-download');
    if (announcement['fileLink'] != null) {
      var fileLink = AnchorElement(href: announcement['fileLink'])..text = 'Download file'..setAttribute('download', '');
      fileDownload.append(fileLink);
    }

    // Append all parts to the announcement div
    announcementDiv.append(profileContainer);
    announcementDiv.append(description);
    announcementDiv.append(fileDownload);

    // Append the announcement to the container
    container?.append(announcementDiv);
  }
}

// Function to filter announcements based on selected course
void filterAnnouncements() {
  var selectedCourse = (querySelector('#coursefilter') as SelectElement).value;

  var announcementRows = querySelectorAll('.announcement');

  for (var row in announcementRows) {
    var course = row.getAttribute('data-course') ?? ''; // Provide a default empty string if null
    if (selectedCourse == null || selectedCourse.isEmpty || course == selectedCourse) {
      row.style.display = ''; // Show the row
    } else {
      row.style.display = 'none'; // Hide the row
    }
  }
}



