import 'dart:convert';
import 'dart:typed_data';
import 'package:shelf/shelf.dart';
import 'package:shelf_multipart/form_data.dart';
import 'package:sqlite3/sqlite3.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');
    // _db.execute('DROP TABLE IF EXISTS courses');
    _db.execute('''
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        courseId TEXT NOT NULL UNIQUE,
        description TEXT,
        hours REAL NOT NULL,
        lectureAttendance REAL NOT NULL,
        sectionAttendance REAL NOT NULL,
        practicalDegree REAL NOT NULL,
        midtermDegree REAL NOT NULL,
        finalExamDegree REAL NOT NULL,
        photo BLOB,
        department TEXT NOT NULL,
        year TEXT NOT NULL,
        doctorId INTEGER NOT NULL REFERENCES doctors(id)
      )
    ''');
  }

  static Database get db => _db;

  static void addCourse(Map<String, dynamic> courseData, Uint8List? image) {
    final existingCourse = _db.select(
        'SELECT id FROM courses WHERE courseId = ?', [courseData['courseId']]);
    if (existingCourse.isNotEmpty) {
      throw Exception('courseId already in use');
    }

    final statement = _db.prepare('''
    INSERT INTO courses (doctorId, name, courseId, description, hours, lectureAttendance, sectionAttendance, practicalDegree, midtermDegree, finalExamDegree, photo, department, year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ''');
    statement.execute([
      courseData["doctorId"],
      courseData["name"],
      courseData["courseId"],
      courseData["description"],
      courseData["hours"],
      courseData["lectureAttendance"],
      courseData["sectionAttendance"],
      courseData["practicalDegree"],
      courseData["midtermDegree"],
      courseData["finalExamDegree"],
      image ?? Uint8List(0),
      courseData["department"], // تأكد من تمرير department
      courseData["year"], // تأكد من تمرير year
    ]);
    statement.dispose();
  }

  static void updateCourse(
      String id, Map<String, dynamic> courseData, Uint8List? image) {
    final statement = _db.prepare('''
    UPDATE courses
    SET name = ?, courseId = ?, description = ?, hours = ?, lectureAttendance = ?, sectionAttendance = ?, practicalDegree = ?, midtermDegree = ?, finalExamDegree = ?, department = ?, year = ? ${image != null ? ", photo = ?" : ""}
    WHERE id = ?
  ''');
    List<dynamic> data = [
      courseData["name"],
      courseData["courseId"],
      courseData["description"],
      courseData["hours"],
      courseData["lectureAttendance"],
      courseData["sectionAttendance"],
      courseData["practicalDegree"],
      courseData["midtermDegree"],
      courseData["finalExamDegree"],
      courseData["department"], // تأكد من تمرير department
      courseData["year"], // تأكد من تمرير year
      ...(image != null ? [image] : []),
      id,
    ];
    statement.execute(data);
    statement.dispose();
  }

  static void deleteCourse(String id) {
    final deleteStatement = _db.prepare('DELETE FROM courses WHERE id = ?');
    deleteStatement.execute([id]);
    deleteStatement.dispose();
  }

  static bool courseExists(String id) {
    final result = _db.select('SELECT 1 FROM courses WHERE id = ?', [id]);
    return result.isNotEmpty;
  }

  static void dispose() {
    _db.dispose();
  }
}

class Course {
  final router;
  Course(this.router) {
    main();
  }

  void main() async {
    DatabaseHelper.init();
    // عرض الكورس

 router.get('/TotalAttendance', (Request request) async {
  try {
    // استعلام SQL لجلب البيانات المطلوبة من الجداول المختلفة
    final results = await DatabaseHelper._db.select('''
      SELECT 
        s.name AS "Student Name", 
        s.department AS "Department", 
        s.year_level AS "Year Level", 
        c.name AS "Course Name", 
        s.sectionNo AS "Section", 
        COUNT(CASE WHEN sa.status = 'P' THEN 1 ELSE NULL END) AS "Presence Total", 
        COUNT(CASE WHEN sa.status = 'A' THEN 1 ELSE NULL END) AS "Absence Total", 
        ROUND(
          (COUNT(CASE WHEN sa.status = 'Present' THEN 1 ELSE NULL END) * 100.0) / 
          COUNT(sa.status), 2) AS "Percentage" 
      FROM 
        students s
      JOIN 
        student_attendance sa ON s.id = sa.studentId
      JOIN 
        attendance a ON sa.attendanceId = a.id
      JOIN 
        courses c ON a.courseId = c.id
      GROUP BY 
        s.id, c.id
      ORDER BY 
        s.name, c.name;
    ''');

    final attendanceList = results.map((row) => {
      'studentName': row['Student Name'],
      'department': row['Department'],
      'yearLevel': row['Year Level'],
      'courseName': row['Course Name'],
      'section': row['Section'],
      'presenceTotal': row['Presence Total'],
      'absenceTotal': row['Absence Total'],
      'percentage': row['Percentage'],
    }).toList();

    // تحويل القائمة إلى JSON وإرجاعها كاستجابة
    final jsonResponse = jsonEncode(attendanceList);
    return Response.ok(jsonResponse, headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
  } catch (e) {
    print('Error: $e');
    return Response.internalServerError(
      body: 'Error processing request',
      headers: {'Access-Control-Allow-Origin': '*'}
    );
  }
});


    router.get('/courses', (Request request) async {
  try {
    final results = await DatabaseHelper._db.select(
      'SELECT id, name, courseId, year FROM courses'  // اختيار فقط الأعمدة المطلوبة
    );

    final courseList = results.map((row) => {
      'id': row['id'],
      'name': row['name'],
      'courseId': row['courseId'],
      'year': row['year'],
    }).toList();

    final jsonResponse = jsonEncode(courseList);
    return Response.ok(jsonResponse, headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
  } catch (e) {
    print('Error: $e');
    return Response.internalServerError(
      body: 'Error processing request',
      headers: {'Access-Control-Allow-Origin': '*'}
    );
  }
});


   router.get('/doctor/courses/<doctorId>', (Request request, String doctorId) async {
  try {
    final queryParams = request.url.queryParameters;
    final limit = int.tryParse(queryParams['limit'] ?? '3') ?? 3;  // Default limit of 3 courses
    final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;  // Default to page 1
    final offset = (page - 1) * limit;  // Calculate offset based on page

    final results = DatabaseHelper._db.select(
      'SELECT id, name, courseId, description, hours, lectureAttendance, sectionAttendance, '
      'practicalDegree, midtermDegree, finalExamDegree, department, year, photo '
      'FROM courses WHERE doctorId = ? LIMIT ? OFFSET ?',
      [doctorId, limit, offset]
    );

    final courseList = results.map((row) => {
      'id': row['id'],
      'name': row['name'],
      'courseId': row['courseId'],
      'description': row['description'],
      'hours': row['hours'],
      'lectureAttendance': row['lectureAttendance'],
      'sectionAttendance': row['sectionAttendance'],
      'practicalDegree': row['practicalDegree'],
      'midtermDegree': row['midtermDegree'],
      'finalExamDegree': row['finalExamDegree'],
      'department': row['department'],
      'year': row['year'],
      'photo': row['photo'] != null && row['photo'].length > 0,
    }).toList();

    final jsonResponse = jsonEncode(courseList);
    return Response.ok(jsonResponse, headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
  } catch (e) {
    print('Error: $e');
    return Response.internalServerError(
      body: 'Error processing request',
      headers: {'Access-Control-Allow-Origin': '*'}
    );
  }
});


    // عرض كورس حسب ID
    router.get('/courses/Details/<id>', (Request request, String id) async {
      try {
        final result = DatabaseHelper._db.select(
            'SELECT id, name, courseId, description, hours, lectureAttendance, sectionAttendance, practicalDegree, midtermDegree, finalExamDegree, department, year, photo FROM courses WHERE id = ?',
            [id]);
        if (result.isEmpty) {
          return Response.notFound('Course not found');
        }
        final course = result.first;
        final courseData = {
          'id': course['id'],
          'name': course['name'],
          'courseId': course['courseId'],
          'description': course['description'],
          'hours': course['hours'],
          'lectureAttendance': course['lectureAttendance'],
          'sectionAttendance': course['sectionAttendance'],
          'practicalDegree': course['practicalDegree'],
          'midtermDegree': course['midtermDegree'],
          'finalExamDegree': course['finalExamDegree'],
          'department': course['department'],
          'year': course['year'],
          "photo": course['photo'].length > 0,
        };
        final jsonResponse = jsonEncode(courseData);
        return Response.ok(jsonResponse, headers: {
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

    router.get('/courses/photo/<id>', (Request request, String id) async {
      try {
        // Query the database to get the profile picture
        final result = DatabaseHelper._db
            .select('SELECT photo FROM courses WHERE id = ?', [id]);

        if (result.isNotEmpty) {
          final profilePictureBytes = result.first['photo'];

          // Set the appropriate content-type header (assuming the image is in PNG format)
          return Response.ok(profilePictureBytes, headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'inline; filename="profile_picture.png"',
            'Access-Control-Allow-Origin': '*'
          });
        } else {
          return Response.notFound('Course not found');
        }
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    // إضافة كورس
    router.post('/add-course', (Request request) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};
        Uint8List? image;

        await for (final formData in form) {
          if (formData.name == "course_image") {
            image = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        }

        DatabaseHelper.addCourse(data, image);

        return Response.ok('Course added successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // تحديث كورس
    router.put('/update-course/<id>', (Request request, String id) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};
        Uint8List? image;

        await for (final formData in form) {
          if (formData.name == "course_image") {
            image = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        }

        if (!DatabaseHelper.courseExists(id)) {
          return Response.notFound('Course not found');
        }

        DatabaseHelper.updateCourse(id, data, image);

        return Response.ok('Course updated successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    // حذف دكتور
    router.delete('/delete-course/<id>', (Request request, String id) async {
      try {
        if (!DatabaseHelper.courseExists(id)) {
          return Response.notFound('Course not found');
        }

        DatabaseHelper.deleteCourse(id);

        return Response.ok('Course deleted successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });
  }
}
