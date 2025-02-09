import 'dart:convert';
import 'dart:typed_data';
// import 'package:firebase_dart/firebase_dart.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf_multipart/form_data.dart';
//import 'package:shelf/shelf_io.dart' as io;
//import 'package:shelf_router/shelf_router.dart';
import 'package:sqlite3/sqlite3.dart';
//import 'package:shelf_cors_headers/shelf_cors_headers.dart';
// import 'package:shelf_static/shelf_static.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');

    // حذف الجدول إذا كان موجودًا

    // _db.execute('DROP TABLE IF EXISTS students');
    _db.execute('''
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        department TEXT NOT NULL,
        year_level TEXT,
        password TEXT NOT NULL,
        national_id TEXT NOT NULL,
        gender TEXT NOT NULL,
        number INTEGER NOT NULL,
        sectionNo INTEGER NOT NULL,
        showDegrees TEXT DEFAULT 'hide',
        photo BLOB
      )
    ''');
  }

  static int getLastStudentNumber(String department, String yearLevel) {
    final existingUser = _db.select(
        "SELECT number FROM students WHERE department = '$department' AND year_level = '$yearLevel' ORDER BY number DESC  Limit 1");
    if (existingUser.isNotEmpty) {
      return int.parse(existingUser.first['number'].toString()) + 1;
    } else {
      return 1;
    }
  }

  static void addStudent(Map<String, dynamic> studentData, Uint8List? image) {
    final existingUser = _db.select(
        'SELECT id FROM students WHERE username = ?',
        [studentData['username']]);
    if (existingUser.isNotEmpty) {
      throw Exception('Username already exists');
    }
    final existingEmail = _db.select(
        'SELECT id FROM students WHERE email = ?', [studentData['email']]);
    if (existingEmail.isNotEmpty) {
      throw Exception('Email already exists');
    }
    final statement = _db.prepare('''
      INSERT INTO students (name, email, phone, username, department, year_level, password, national_id, gender, number, sectionNo, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''');
    statement.execute([
      studentData['firstname'] + " " + studentData['lastname'],
      studentData['email'],
      studentData['phone_no'],
      studentData['username'],
      studentData['department'],
      studentData['year_level'],
      studentData['password'],
      studentData['national_id'],
      studentData['gender'],
      studentData['No_list'],
      ((int.parse(studentData['No_list'].toString()) - 1) / 30 + 1)
          .floor()
          .toString(),
      image ?? "NULL",
    ]);
    statement.dispose();
  }

  static void updateStudent(
      String id, Map<String, dynamic> studentData, Uint8List? image) {
    final statement = _db.prepare('''
      UPDATE students
      SET name = ?, email = ?, phone = ?, username = ?, department = ?, year_level = ?, password = ?, national_id = ?, gender = ?, number = ?, sectionNo = ? ${image != null && image.isNotEmpty ? ", photo = ? ,  showDegrees = ?" : ""}
      WHERE id = ?
    ''');
    List data = [
      studentData['firstname'] + " " + studentData['lastname'],
      studentData['email'],
      studentData['phone_no'],
      studentData['username'],
      studentData['department'],
      studentData['year_level'],
      studentData['password'],
      studentData['national_id'],
      studentData['gender'],
      studentData['showDegrees'],
      studentData['No_list'],
      ((int.parse(studentData['No_list'].toString()) - 1) / 30 + 1)
          .floor()
          .toString(),
    ];
    if (image != null && image.isNotEmpty) {
      data.add(image);
    }
    data.add(id);
    statement.execute(data);
    statement.dispose();
  }

  static void deleteStudent(String id) {
    final deleteStatement = _db.prepare('DELETE FROM students WHERE id = ?');
    deleteStatement.execute([id]);
    deleteStatement.dispose();
  }

  static bool studentExists(String id) {
    final result = _db.select('SELECT 1 FROM students WHERE id = ?', [id]);
    return result.isNotEmpty;
  }

  static void dispose() {
    _db.dispose();
  }
}

class Student {
  final router;
  Student(this.router) {
    main();
  }

  void main() async {
    DatabaseHelper.init();

    // عرض الطلاب
    router.get('/students', (Request request) async {
      try {
        final results = DatabaseHelper._db.select(
            'SELECT id, name, email, phone, username, department, year_level, national_id, gender, number, sectionNo, showDegrees, photo FROM students');
        final studentList = results
            .map((row) => {
                  'id': row['id'],
                  'name': row['name'],
                  'email': row['email'],
                  'phone': row['phone'],
                  'username': row['username'],
                  'department': row['department'],
                  'year_level': row['year_level'],
                  'national_id': row['national_id'],
                  'gender': row['gender'],
                  'number': row['number'],
                  'showDegrees': row['showDegrees'],
                  'No_section': row['sectionNo'],
                  "photo": row['photo'].length > 0
                })
            .toList();

        final jsonResponse = jsonEncode(studentList);
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

    // عرض طالب حسب ID
    router.get('/students/<id>', (Request request, String id) async {
      try {
        final result = DatabaseHelper._db.select(
            'SELECT id, name, email, phone, username, department, year_level, password, national_id, gender, number, sectionNo, photo, showDegrees FROM students WHERE id = ?',
            [id]);
        if (result.isEmpty) {
          return Response.notFound('Student not found');
        }
        final student = result.first;
        final studentData = {
          'id': student['id'],
          'name': student['name'],
          'email': student['email'],
          'phone': student['phone'],
          'username': student['username'],
          'department': student['department'],
          'year_level': student['year_level'],
          'password': student['password'],
          'national_id': student['national_id'],
          'gender': student['gender'],
          'number': student['number'],
          'showDegrees': student['showDegrees'],
          'No_section': "Section ${student['sectionNo']}",
          "photo": student['photo'].length > 0
        };

        final jsonResponse = jsonEncode(studentData);
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


router.put('/update-student-degree-visibility/<id>', (Request request, String id) async {
    try {
      final form = await request.readAsString();
      final data = jsonDecode(form);
      final showDegrees = data['showDegrees'];

      // تنفيذ عملية التحديث
      final statement = DatabaseHelper._db.prepare('UPDATE students SET showDegrees = ? WHERE id = ?');
      statement.execute([showDegrees, int.parse(id)]);
      statement.dispose();

      return Response.ok('Degree visibility updated successfully', headers: {'Access-Control-Allow-Origin': '*'});
    } catch (e) {
      print('Error: $e');
      return Response.internalServerError(
          body: 'Error processing request',
          headers: {'Content-Type': 'application/json', 'Error': '$e'});
    }
  });

    

    router.get('/students/photo/<id>', (Request request, String id) async {
      try {
        // Query the database to get the profile picture
        final result = DatabaseHelper._db
            .select('SELECT photo FROM students WHERE id = ?', [id]);

        if (result.isNotEmpty) {
          final profilePictureBytes = result.first['photo'];

          // Set the appropriate content-type header (assuming the image is in PNG format)
          return Response.ok(profilePictureBytes, headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'inline; filename="profile_picture.png"',
            'Access-Control-Allow-Origin': '*'
          });
        } else {
          return Response.notFound('Student not found');
        }
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    router.get('/Last-Student-Number/<year_level>/<department>',
        (Request request, String yearLevel, String department) async {
      try {
        int number = DatabaseHelper.getLastStudentNumber(department, yearLevel);
        return Response.ok("Last-Student-Number", headers: {
          'Content-Type': 'application/json',
          "Number": number.toString(),
          "Section": "Section ${((number - 1) / 30 + 1).floor()}"
        });
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    // إضافة طالب
    router.post('/Add_Student', (Request request) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};
        Uint8List? image;

        await for (final formData in form) {
          if (formData.name == "picture") {
            image = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        }

        DatabaseHelper.addStudent(data, image);

        return Response.ok('Student added successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // تحديث طالب
    router.put('/update-student/<id>', (Request request, String id) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};
        Uint8List? image;

        await for (final formData in form) {
          if (formData.name == "picture") {
            image = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        }

        if (!DatabaseHelper.studentExists(id)) {
          return Response.notFound('Student not found');
        }

        DatabaseHelper.updateStudent(id, data, image);

        return Response.ok('Student updated successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // حذف طالب
    router.delete('/delete-student/<id>', (Request request, String id) async {
      try {
        if (!DatabaseHelper.studentExists(id)) {
          return Response.notFound('Student not found');
        }

        DatabaseHelper.deleteStudent(id);

        return Response.ok('Student deleted successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });
  }

  static Future<Map<String, dynamic>?> authenticateUser(
      String username, String password) async {
    final result = DatabaseHelper._db.select(
        "SELECT * FROM students WHERE username = '$username' AND password = '$password'");
    if (result.isNotEmpty) {
      return result.first;
    }
    return null;
  }
}
