import 'dart:convert';

import 'package:shelf/shelf.dart';
import 'package:shelf_multipart/form_data.dart';
import 'package:sqlite3/sqlite3.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');
    _db.execute('''
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        sectionNo INTEGER NOT NULL,
        note TEXT,
        courseId INTEGER NOT NULL REFERENCES courses(id),
        doctorId INTEGER REFERENCES doctors(id),
        teaching_assistantId INTEGER REFERENCES teaching_assistants(id)
      )
    ''');

    _db.execute('''
      CREATE TABLE IF NOT EXISTS student_attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT NOT NULL,
        attendanceId INTEGER NOT NULL REFERENCES attendance(id),
        studentId INTEGER REFERENCES students(id)
      )
    ''');
  }

  static void addAttendance(Map<String, String> attendanceData,
      List<Map<String, String>> studentStatuses) {
    // Insert attendance data
    final attendanceStatement = _db.prepare('''
    INSERT INTO attendance (date, sectionNo, note, courseId, ${attendanceData.containsKey("doctorId") ? "doctorId" : "teaching_assistantId"})
    VALUES (?, ?, ?, ?, ?)
  ''');

    attendanceStatement.execute([
      attendanceData['date'],
      attendanceData['sectionNo'],
      attendanceData['note'],
      attendanceData['courseId'],
      attendanceData[attendanceData.containsKey("doctorId")
          ? "doctorId"
          : "teaching_assistantId"],
    ]);

    // Get the ID of the inserted attendance record
    final attendanceId = _db.lastInsertRowId;
    attendanceStatement.dispose();

    // Insert student attendance statuses
    final studentAttendanceStatement = _db.prepare('''
    INSERT INTO student_attendance (status, attendanceId, studentId)
    VALUES (?, ?, ?)
  ''');

    for (var studentStatus in studentStatuses) {
      studentAttendanceStatement.execute([
        studentStatus['status'],
        attendanceId,
        studentStatus['studentId'],
      ]);
    }

    studentAttendanceStatement.dispose();
  }
}

class Attendence {
  final router;
  Attendence(this.router) {
    main();
  }

  void main() async {
    // تهيئة قاعدة البيانات
    DatabaseHelper.init();

    router.post('/add-attendance', (Request request) async {
      try {
        final form = request.multipartFormData;
        final attendanceData = <String, String>{};
        List<Map<String, String>> studentStatuses = [];

        await for (final formData in form) {
          final nameParts = formData.name.split("-");

          if (nameParts.length > 1 && nameParts[0] == "student") {
            // Handling student-specific attendance data
            final field = nameParts[1];
            final studentId = int.parse(nameParts.last);

            final studentIndex = studentStatuses
                .indexWhere((student) => student['studentId'] == studentId);

            if (studentIndex == -1) {
              // Add a new entry for the student if not found
              studentStatuses.add({
                'studentId': studentId.toString(),
                'status': await formData.part.readString(),
              });
            } else {
              // Update the existing entry for the student
              studentStatuses[studentIndex][field] =
                  await formData.part.readString();
            }
          } else {
            // Handling general attendance data
            attendanceData[formData.name] = await formData.part.readString();
          }
        }

        // Add the current date to the attendance data
        attendanceData['date'] = DateTime.now().toString();

        // Insert attendance record into the database
        DatabaseHelper.addAttendance(attendanceData, studentStatuses);

        return Response.ok('Attendance added successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(
          body: 'Error processing request',
          headers: {'Content-Type': 'application/json', 'Error': '$e'},
        );
      }
    });
  
  router.get('/single-student-attendance/<studentId>', (Request request, String studentId) async {
     
        try {
        final results = DatabaseHelper._db.select(
            "SELECT a.date, a.courseId, sa.status FROM attendance a LEFT JOIN student_attendance sa ON a.id = sa.attendanceId WHERE sa.studentId = ${studentId}");
        final courseList = results
            .map((row) => {
                  'date': row[0],
                  'courseId': row[1],
                  'status': row[2],
                })
            .toList();

        return Response.ok(jsonEncode(courseList), headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });
 
  }
}
