import 'dart:convert';
import 'dart:typed_data';
import 'package:mime/mime.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf_multipart/form_data.dart';
import 'package:sqlite3/sqlite3.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');

    _db.execute('''
      CREATE TABLE IF NOT EXISTS student_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        date TEXT NOT NULL,
        file BLOB NOT NULL,
        degree REAL,
        assignmentId INTEGER NOT NULL REFERENCES assignments(id),
        studentId INTEGER NOT NULL REFERENCES students(id)
      )
    ''');
  }

  static void addStudentAssignment(
      Map<String, dynamic> assignmentData, Uint8List? file) {
    final statement = _db.prepare('''
      INSERT INTO student_assignments (courseId, studentId, filename, date, file)
      VALUES (?, ?, ?, ?, ?)
    ''');
    statement.execute([
      assignmentData['courseId'],
      assignmentData['studentId'],
      assignmentData['fileName'],
      assignmentData['date'],
      file,
    ]);
    statement.dispose();
  }

  static void updateStudentAssignment(
      String id, Map<String, dynamic> assignmentData, Uint8List? file) {
    final statement = _db.prepare('''
      UPDATE student_assignments
      SET degree = ? ${assignmentData['date'] != null? "date = ?," : ""} ${file != null && file.isNotEmpty ? ", filename = ?, file = ?" : ""}
      WHERE id = ?
    ''');
    List data = [
      assignmentData['degree'],
    ];

    if (assignmentData['date'] != null) {
      data.add(assignmentData['date']);
    }

    if (file != null && file.isNotEmpty) {
      data.add(assignmentData['fileName']);
      data.add(file);
    }
    data.add(id);
    statement.execute(data);
    statement.dispose();
  }

  static void deleteStudentAssignment(int id) {
    final statement =
        _db.prepare('DELETE FROM student_assignments WHERE id = ?');
    statement.execute([id]);
    statement.dispose();
  }

  static List<Map<String, dynamic>> getStudentAssignments(String assignmentId) {
    final results = _db.select(
        'SELECT SA.id, SA.filename, SA.date, SA.degree, SA.file, S.Name student FROM student_assignments SA LEFT JOIN students S ON SA.studentId = S.id WHERE SA.assignmentId = ' +
            assignmentId);
    return results
        .map((row) => {
              'id': row['id'],
              'filename': row['filename'],
              'date': row['date'],
              'degree': row['degree'],
              'file': row['file'].length > 0,
              'student': row['student'],
            })
        .toList();
  }

  static Map<String, dynamic> getStudentAssignment(String id) {
    final results = _db.select(
        'SELECT SA.id, SA.filename, SA.date, SA.degree, SA.file, S.Name student FROM student_assignments SA LEFT JOIN students S ON SA.studentId = S.id WHERE SA.id = ' +
            id);
    var studentAssignment = results.first;
    return {
      'id': studentAssignment['id'],
      'filename': studentAssignment['filename'],
      'date': studentAssignment['date'],
      'degree': studentAssignment['degree'],
      'file': studentAssignment['file'].length > 0,
      'student': studentAssignment['student'],
    };
  }
}

class StudentAssignment {
  final router;
  StudentAssignment(this.router) {
    main();
  }

  void main() async {
    // تهيئة قاعدة البيانات
    DatabaseHelper.init();

    // عرض المواد
    router.get('/student-assignments/<assignmentId>',
        (Request request, String assignmentId) async {
      try {
        final assignments = DatabaseHelper.getStudentAssignments(assignmentId);
        final jsonAssignments = jsonEncode(assignments);
        return Response.ok(
          jsonAssignments,
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

    // عرض أحد المواد
    router.get('/courses/student-assignments/<id>',
        (Request request, String id) async {
      try {
        final assignments = DatabaseHelper.getStudentAssignment(id);
        final jsonAssignments = jsonEncode(assignments);
        return Response.ok(
          jsonAssignments,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        );
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });

    router.get('/courses/student-assignments/file/<id>',
        (Request request, String id) async {
      try {
        // Query the database to get the profile picture
        final result = DatabaseHelper._db.select(
            'SELECT filename, file FROM student_assignments WHERE id = ?',
            [id]);

        if (result.isNotEmpty) {
          final fileBytes = result.first['file'];

          final mimeType = lookupMimeType(result.first['filename']) ??
              'application/octet-stream';
          // Set the appropriate content-type header (assuming the image is in PNG format)
          return Response.ok(fileBytes, headers: {
            'Content-Type': mimeType,
            'Content-Disposition':
                'inline; filename="${result.first['filename']}"',
            'Access-Control-Allow-Origin': '*'
          });
        } else {
          return Response.notFound('Assignment not found');
        }
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    // إضافة مادة جديدة
    router.post('/add-student-assignment', (Request request) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};
        Uint8List? file;

        await for (final formData in form) {
          if (formData.name == "attachment") {
            final fileName = formData.part.headers['content-disposition']
                ?.split(';')
                .firstWhere((element) => element.trim().startsWith('filename='))
                .split('=')[1]
                .replaceAll('"', ''); // Extract and clean the filename
            print(
                'Uploaded file name: $fileName'); // Use or store the file name
            data.addAll({"fileName": fileName});

            file = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        }
        data.addAll({"date": DateTime.now().toString()});

        DatabaseHelper.addStudentAssignment(data, file);

        return Response.ok('Assignment added successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // تعديل مادة
    router.put('/update-student-assignment/<id>',
        (Request request, String id) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};
        Uint8List? file;

        await for (final formData in form) {
          if (formData.name == "attachment") {
            final fileName = formData.part.headers['content-disposition']
                ?.split(';')
                .firstWhere((element) => element.trim().startsWith('filename='))
                .split('=')[1]
                .replaceAll('"', ''); // Extract and clean the filename
            print(
                'Uploaded file name: $fileName'); // Use or store the file name
            data.addAll({"fileName": fileName});

            file = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        } 

        DatabaseHelper.updateStudentAssignment(id, data, file);

        return Response.ok('Assignment updated successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // حذف مادة
    router.delete('/delete-student-assignment/<id>',
        (Request request, String id) async {
      try {
        DatabaseHelper.deleteStudentAssignment(int.parse(id));
        return Response.ok('Assignment deleted successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });
  }
}
