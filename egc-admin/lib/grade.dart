import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:sqlite3/sqlite3.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');

    Future<Response> insertStudentDegrees(Request request) async {
      try {
        // قراءة البيانات من الطلب (السنة والقسم وcourseId)
        final payload = await request.readAsString();
        final data = jsonDecode(payload);

        final String year = data['year'];
        final String department = data['department'];
        final int courseId = data['courseId']; // استقبل courseId

        // جلب الطلاب الذين يتطابقون مع السنة والقسم
        final ResultSet students = _db.select('''
      SELECT id FROM students WHERE year_level = ? AND department = ?
    ''', [year, department]);

        // التحقق من وجود طلاب
        if (students.isEmpty) {
          return Response.ok(
              jsonEncode({
                'message':
                    'No students found for the specified year and department.'
              }),
              headers: {'Content-Type': 'application/json'});
        }

        // إدراج الدرجات الافتراضية لكل طالب
        for (final student in students) {
          _db.execute('''
        INSERT INTO student_course_degrees (
          finalExamDegree, midtermDegree, practicalDegree, sectionAttendance, lectureAttendance, course_id, student_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ''', [
            '0',
            '0',
            '0',
            '0',
            '0',
            courseId,
            student['id']
          ]); // استخدم courseId هنا
        }


        return Response.ok(
            jsonEncode({'message': 'Data inserted successfully'}),
            headers: {'Content-Type': 'application/json'});
      } catch (e) {
        return Response.internalServerError(
            body: jsonEncode({'error': e.toString()}),
            headers: {'Content-Type': 'application/json'});
      }
    }

    //  _db.execute('''
    //    DROP TABLE student_course_degrees;  -- Only if you're okay with losing data
    // ''');
    _db.execute('''
      CREATE TABLE IF NOT EXISTS student_course_degrees (
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
      )
    ''');
  }

  static List<Map<String, dynamic>> getGrades() {
    final results = _db.select('''
      SELECT s.id, s.name AS studentName, 
             scd.practicalDegree, 
             scd.midtermDegree, 
             scd.finalExamDegree, 
             c.lectureAttendance * (
                SELECT COUNT(*)
                FROM student_attendance sa
                JOIN attendance a ON sa.attendanceId = a.id
                WHERE sa.status = 'p'
                AND sa.studentId = s.id
                AND a.courseId = scd.course_id
                AND a.sectionNo = 1
             ) AS lectureAttendance,
             c.sectionAttendance * (
                SELECT COUNT(*)
                FROM student_attendance sa
                JOIN attendance a ON sa.attendanceId = a.id
                WHERE sa.status = 'p'
                AND sa.studentId = s.id
                AND a.courseId = scd.course_id
                AND a.sectionNo = 2
             ) AS sectionAttendance
      FROM students s 
      LEFT JOIN student_course_degrees scd ON s.id = scd.student_id
      LEFT JOIN courses c ON scd.course_id = c.id
    ''');

    return results
        .map((row) => {
              'id': row['id'],
              'studentName': row['studentName'],
              'practicalDegree': row['practicalDegree'],
              'midtermDegree': row['midtermDegree'],
              'finalExamDegree': row['finalExamDegree'],
              'lectureAttendance': row['lectureAttendance'],
              'sectionAttendance': row['sectionAttendance'],
            })
        .toList();
}

}

class Grades {
  final router;
  Grades(this.router) {
    main();
  }
  void main() async {
    // Initialize the database
    DatabaseHelper.init();

    // Endpoint to get grades
    router.get('/get-grades', (Request request) async {
      try {
        final grades = DatabaseHelper.getGrades();
        final jsonGrades = jsonEncode(grades);
        return Response.ok(
          jsonGrades,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        );
      } catch (e) {
        print(e);
        return Response.internalServerError(body: 'Error: $e');
      }
    });

    // مسار لتحديث الدرجات
    router.post('/update-grades', (Request request) async {
      try {
        final payload = await request.readAsString();
        final List<dynamic> updatedGrades = jsonDecode(payload);

        for (var grade in updatedGrades) {
          final results = DatabaseHelper._db.select('''
            SELECT s.name AS studentName, 
                  scd.practicalDegree, 
                  scd.midtermDegree, 
                  scd.finalExamDegree, 
                  scd.lectureAttendance, 
                  scd.sectionAttendance
            FROM students s LEFT JOIN student_course_degrees scd
            ON s.id = scd.student_id WHERE student_id = (SELECT id FROM students WHERE name = ?)
          ''', [grade['studentName']]);
          if (results.isEmpty) {
            DatabaseHelper._db.execute('''
            insert into student_course_degrees 
            (practicalDegree, midtermDegree, finalExamDegree, sectionAttendance, lectureAttendance, course_id, student_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ''', [
              grade['practicalDegree'],
              grade['midtermDegree'],
              grade['finalExamDegree'],
              0,
              0,
              grade['courseId'],
              grade['id']
            ]);
          } else {
            DatabaseHelper._db.execute('''
            update student_course_degrees 
            SET practicalDegree = ?, midtermDegree = ?, finalExamDegree = ? 
            WHERE student_id = ?
          ''', [
              grade['practicalDegree'],
              grade['midtermDegree'],
              grade['finalExamDegree'],
              grade['id']
            ]);
          }
        }

        return Response.ok('Grades updated successfully');
      } catch (e) {
        print(e);
        return Response.internalServerError(body: 'Error: $e');
      }
    });

    // إعداد CORS وتشغيل السيرفر
    // هنا تضيف إعدادات CORS وتشغيل السيرفر
  }
}

    // Setup CORS and run the serve
  

