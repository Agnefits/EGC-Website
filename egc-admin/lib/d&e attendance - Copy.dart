import 'dart:html';
import 'dart:convert';

void main() {
  // Initialize event listeners
  querySelector('#department')?.onChange.listen((_) => loadStudents());
  querySelector('#yearlevel')?.onChange.listen((_) => loadStudents());
  querySelector('#n_section')?.onChange.listen((_) => loadStudents());

  loadSections().then((_) {
    querySelector('#n_section')?.onChange.listen((event) {
      final sectionId = (event.target as SelectElement).value;
      if (sectionId != null && sectionId.isNotEmpty) {
        fetchStudents(sectionId);
      } else {
        querySelector('#studentsTableBody')?.innerHtml = '';
      }
    });
  });

  querySelector('#save-notes-btn')?.onClick.listen((_) => saveNotes());
  querySelector('#submit-attendance-btn')?.onClick.listen((_) => submitAttendance());
}

Future<void> loadStudents() async {
  final department = (querySelector('#department') as SelectElement).value;
  final yearLevel = (querySelector('#yearlevel') as SelectElement).value;
  final section = (querySelector('#n_section') as SelectElement).value;

  try {
    final response = await HttpRequest.getString('/students');
    final List students = json.decode(response);

    final filteredStudents = students.where((student) {
      return ((department == null || department.isEmpty) || student['department'] == department) &&
             ((yearLevel == null || yearLevel.isEmpty) || student['year_level'] == yearLevel) &&
             ((section == null || section.isEmpty) || student['no_section'] == section);
    }).toList();

    populateStudentsTable(filteredStudents);
  } catch (error) {
    print('Error: $error');
    window.alert('Error loading students');
  }
}


void populateStudentsTable(List students) {
  final studentsTableBody = querySelector('#studentsTableBody');
  studentsTableBody?.innerHtml = '';

  if (students.isEmpty) {
    studentsTableBody?.appendHtml('<li>No students found</li>');
    return;
  }

  for (var student in students) {
    final listItem = LIElement();
    listItem.dataset['id'] = student['id'].toString(); // Store student ID
    listItem.innerHtml = '''
      <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
              <button class="attendance-button" data-attendance="A">A</button>
              <button class="attendance-button" data-attendance="P">P</button>
          </div>
          <span style="margin-left: auto;">${student['name'] ?? 'N/A'}</span>
      </div>
    ''';

    listItem.querySelector('button[data-attendance="P"]')?.onClick.listen((_) => markAttendance(listItem, 'P'));
    listItem.querySelector('button[data-attendance="A"]')?.onClick.listen((_) => markAttendance(listItem, 'A'));

    studentsTableBody?.append(listItem);
  }
}

void markAttendance(LIElement listItem, String status) {
  listItem.classes.remove('present');
  listItem.classes.remove('absent');

  if (status == 'P') {
    listItem.classes.add('present');
    listItem.style.backgroundColor = '#c6efce'; // Light green
  } else if (status == 'A') {
    listItem.classes.add('absent');
    listItem.style.backgroundColor = '#ffc7ce'; // Light red
  }

  updateAttendanceSummary();
}

void updateAttendanceSummary() {
  final totalStudents = querySelectorAll('#studentsTableBody li').length;
  int totalPresent = 0;
  int totalAbsent = 0;

  for (var listItem in querySelectorAll('#studentsTableBody li')) {
    if (listItem.classes.contains('present')) {
      totalPresent++;
    } else if (listItem.classes.contains('absent')) {
      totalAbsent++;
    }
  }

  querySelector('#totalStudents')?.text = totalStudents.toString();
  querySelector('#totalPresent')?.text = totalPresent.toString();
  querySelector('#totalAbsent')?.text = totalAbsent.toString();
}


void saveNotes() async {
  final notesText = (querySelector('#notes-textarea') as TextAreaElement).value;

  try {
    final response = await HttpRequest.request(
      '/save-notes', // Your server endpoint for saving notes
      method: 'POST',
      requestHeaders: {'Content-Type': 'application/json'},
      sendData: json.encode({'notes': notesText}),
    );

    if (response.status == 200) {
      window.alert('Notes saved successfully!');
    } else {
      window.alert('Failed to save notes: ${response.statusText}');
    }
  } catch (error) {
    print('Error saving notes: $error');
    window.alert('Error saving notes');
  }
}



Future<void> submitAttendance() async {
  final attendanceData = <Map<String, String>>[];

  for (var listItem in querySelectorAll('#studentsTableBody li')) {
    final studentId = listItem.dataset['id'];
    final status = listItem.classes.contains('present') ? 'P' : listItem.classes.contains('absent') ? 'A' : 'N'; // N for not marked

    if (studentId != null) {
      attendanceData.add({
        'student_id': studentId,
        'status': status,
      });
    }
  }

  try {
    final response = await HttpRequest.request(
      '/submit-attendance', // Your server endpoint for saving attendance
      method: 'POST',
      requestHeaders: {'Content-Type': 'application/json'},
      sendData: json.encode(attendanceData),
    );

    if (response.status == 200) {
      window.alert('Attendance submitted successfully!');
    } else {
      window.alert('Failed to submit attendance: ${response.statusText}');
    }
  } catch (error) {
    print('Error submitting attendance: $error');
    window.alert('Error submitting attendance');
  }
}

Future<void> loadSections() async {
  final sectionSelect = querySelector('#n_section') as SelectElement;
  final response = await HttpRequest.getString('/Get-Sections');

  if (response.isNotEmpty) {
    final List sections = json.decode(response);
    for (var section in sections) {
      final option = OptionElement(data: section['name'], value: section['id']);
      sectionSelect.append(option);
    }
  }
}

Future<void> fetchStudents(String sectionId) async {
  final response = await HttpRequest.getString('/Get-Students/$sectionId');

  if (response.isNotEmpty) {
    final List students = json.decode(response);
    final studentsTableBody = querySelector('#studentsTableBody');
    studentsTableBody?.innerHtml = '';

    for (var student in students) {
      final listItem = LIElement()..text = student['name'];
      studentsTableBody?.append(listItem);
    }
  }
}






