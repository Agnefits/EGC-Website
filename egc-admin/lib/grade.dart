
import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:sqlite3/sqlite3.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');
    // إنشاء الجداول إذا لم تكن موجودة
    _db.execute('''CREATE TABLE IF NOT EXISTS student_course_degrees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      finalExamDegree TEXT NOT NULL,
      midtermDegree TEXT NOT NULL,
      practicalDegree TEXT NOT NULL,
      sectionAttendance TEXT NOT NULL,
      lectureAttendance TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )''');

    // إنشاء جداول أخرى حسب الحاجة
    // ...

  }


static List<Map<String, dynamic>> getGrades(int courseId) {
  final results = _db.select('''
    SELECT s.id AS studentId, s.name AS studentName,
      COALESCE(scd.practicalDegree, '0') AS practicalDegree,
      COALESCE(scd.midtermDegree, '0') AS midtermDegree,
      COALESCE(scd.finalExamDegree, '0') AS finalExamDegree,
      COALESCE(scd.sectionAttendance, '0') AS sectionAttendance,
      COALESCE(scd.lectureAttendance, '0') AS lectureAttendance
    FROM students s 
    LEFT JOIN student_course_degrees scd ON s.id = scd.student_id AND scd.course_id = ?
    WHERE s.year_level = (SELECT year FROM courses WHERE id = ?)
  ''', [courseId, courseId]);

  return results.map((row) => {
    'studentId': row['studentId'],
    'studentName': row['studentName'],
    'practicalDegree': row['practicalDegree'],
    'midtermDegree': row['midtermDegree'],
    'finalExamDegree': row['finalExamDegree'],
    'lectureAttendance': row['lectureAttendance'],
    'sectionAttendance': row['sectionAttendance'],
  }).toList();
}


  // دالة لتحديث درجات الطلاب بناءً على courseId
 static void updateGradesByCourseId(int courseId, int studentId, Map<String, dynamic> newGrades) {
   print("Starting update for student_id: $studentId and course_id: $courseId");
   _db.execute('''
      UPDATE student_course_degrees
      SET practicalDegree = ?, midtermDegree = ?, finalExamDegree = ?
      WHERE course_id = ? AND student_id = ?
   ''', [
      newGrades['practicalDegree'],
      newGrades['midtermDegree'],
      newGrades['finalExamDegree'],
      courseId,
      studentId
   ]);
   print("Update completed for student_id: $studentId and course_id: $courseId");
}

static List<Map<String, dynamic>> fetchStudentGrades(int studentId) {
    final db = sqlite3.open('egcDB.db');
    final results = db.select(
        'SELECT c.id , g.course_id, g.finalExamDegree , g.midtermDegree , g.practicalDegree , g.sectionAttendance , g.lectureAttendance, c.name from courses c left JOIN student_course_degrees g  on g.course_id = c.id WHERE g.student_id = ?',
        [studentId]);

    // Convert the results to a list of maps
    final List<Map<String, dynamic>> grades = [];
    for (var row in results) {
      grades.add({
        'name': row['name'],
        'finalExamDegree': row['finalExamDegree'],
        'midtermDegree': row['midtermDegree'],
        'practicalDegree': row['practicalDegree'],
        'sectionAttendance': row['sectionAttendance'],
        'lectureAttendance': row['lectureAttendance']
      });
    }

    db.dispose();
    return grades;
  }
}

class Grades {
  final router;
  Grades(this.router) {
    main();
  }

  void main() async {
    DatabaseHelper.init();
/*
router.post('/update-grades', (Request request) async {
  final db = DatabaseHelper._db;
  db.execute('BEGIN TRANSACTION');

  try {
    final payload = await request.readAsString();
    final List<dynamic> updatedGrades = jsonDecode(payload);

    for (var grade in updatedGrades) {
      final studentId = grade['student_id'];
      final courseId = grade['courseId'];

      final results = db.select('SELECT id FROM student_course_degrees WHERE student_id = ? AND course_id = ?', [studentId, courseId]);

      if (results.isEmpty) {
        db.execute(''' 
          INSERT INTO student_course_degrees 
          (practicalDegree, midtermDegree, finalExamDegree, sectionAttendance, lectureAttendance, course_id, student_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', [
          grade['practicalDegree'],
          grade['midtermDegree'],
          grade['finalExamDegree'],
          0,
          0,
          courseId,
          studentId
        ]);
      } else {
        db.execute(''' 
          UPDATE student_course_degrees 
          SET practicalDegree = ?, midtermDegree = ?, finalExamDegree = ? 
          WHERE student_id = ? AND course_id = ?
        ''', [
          grade['practicalDegree'],
          grade['midtermDegree'],
          grade['finalExamDegree'],
          studentId,
          courseId
        ]);
      }
    }

    db.execute('COMMIT');
    return Response.ok('Grades updated successfully');
  } catch (e) {
    db.execute('ROLLBACK');
    print(e);
    return Response.internalServerError(body: 'Error: $e');
  }
});

*/


router.post('/update-grades', (Request request) async {
  final db = DatabaseHelper._db;
  db.execute('BEGIN TRANSACTION');

  try {
    final payload = await request.readAsString();
    final List<dynamic> updatedGrades = jsonDecode(payload);

    for (var grade in updatedGrades) {
      final studentId = grade['student_id'];
      final courseId = grade['courseId'];

      final results = db.select('SELECT id FROM student_course_degrees WHERE student_id = ? AND course_id = ?', [studentId, courseId]);

      if (results.isEmpty) {
        db.execute(''' 
          INSERT INTO student_course_degrees 
          (practicalDegree, midtermDegree, finalExamDegree, sectionAttendance, lectureAttendance, course_id, student_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', [
          grade['practicalDegree'],
          grade['midtermDegree'],
          grade['finalExamDegree'],
          0,
          0,
          courseId,
          studentId
        ]);
      } else {
        db.execute(''' 
          UPDATE student_course_degrees 
          SET practicalDegree = ?, midtermDegree = ?, finalExamDegree = ? 
          WHERE student_id = ? AND course_id = ?
        ''', [
          grade['practicalDegree'],
          grade['midtermDegree'],
          grade['finalExamDegree'],
          studentId,
          courseId
        ]);
      }
    }

    db.execute('COMMIT');
    return Response.ok('Grades updated successfully');
  } catch (e) {
    db.execute('ROLLBACK');
    print(e);
    return Response.internalServerError(body: 'Error: $e');
  }
});

    // نقطة النهاية لاسترجاع درجات الطلاب
    router.get('/student/get-student-grades/<studentId>', (Request request, String studentId) async {
      try {
        final grades = DatabaseHelper.fetchStudentGrades(int.parse(studentId));
        return Response.ok(
          jsonEncode(grades),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        );
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });


    router.get('/get-grades/<courseId>', (Request request, String courseId) async {
  try {
    final grades = DatabaseHelper.getGrades(int.parse(courseId)); // Pass courseId here
    return Response.ok(
      jsonEncode(grades),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    );
  } catch (e) {
    return Response.internalServerError(body: 'Error: $e');
  }
});

  }
}
