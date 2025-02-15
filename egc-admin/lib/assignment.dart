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
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        deadline TEXT NOT NULL,
        description TEXT,
        degree REAL NOT NULL,
        file BLOB,
        courseId INTEGER NOT NULL REFERENCES courses(id),
        doctorId INTEGER REFERENCES doctors(id),
        teaching_assistantId INTEGER REFERENCES teaching_assistants(id)
      )
    ''');

    _db.execute('''
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        assignmentId INTEGER NOT NULL,
        filename TEXT NOT NULL,
        file BLOB,
        submissionDate TEXT NOT NULL
      )
    ''');
  
  }

  static void addAssignment(
      Map<String, dynamic> assignmentData, Uint8List? file) {
    final statement = _db.prepare('''
      INSERT INTO assignments (courseId, filename, title, date, deadline, description, degree, file, ${assignmentData.containsKey("doctorId") ? "doctorId" : "teaching_assistantId"})
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''');
    statement.execute([
      assignmentData['courseId'],
      assignmentData['fileName'],
      assignmentData['title'],
      assignmentData['date'],
      assignmentData['deadline'],
      assignmentData['description'],
      assignmentData['degree'],
      file ?? "NULL",
      assignmentData[assignmentData.containsKey("doctorId")
          ? "doctorId"
          : "teaching_assistantId"]
    ]);
    statement.dispose();
  }

  static void updateAssignment(
      String id, Map<String, dynamic> assignmentData, Uint8List? file) {
    final statement = _db.prepare('''
      UPDATE assignments
      SET title = ?, date = ?, deadline = ?, description = ?, degree = ? ${file != null && file.isNotEmpty ? ", filename = ?, file = ?" : ""}
      WHERE id = ?
    ''');
    List data = [
      assignmentData['title'],
      assignmentData['date'],
      assignmentData['deadline'],
      assignmentData['description'] ?? '',
      assignmentData['degree'],
    ];

    if (file != null && file.isNotEmpty) {
      data.add(assignmentData['fileName']);
      data.add(file);
    }
    data.add(id);
    statement.execute(data);
    statement.dispose();
  }

  static void deleteAssignment(int id) {
    final statement = _db.prepare('DELETE FROM assignments WHERE id = ?');
    statement.execute([id]);
    statement.dispose();
  }

  static List<Map<String, dynamic>> getAssignments(String courseId) {
    final results = _db.select(
        'SELECT A.id, A.filename, A.title, A.date, A.deadline, A.description, A.degree, A.file, CASE WHEN A.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM assignments A LEFT JOIN doctors D ON A.doctorId = D.id LEFT JOIN teaching_assistants T ON A.teaching_assistantId = T.id WHERE A.courseId = ' +
            courseId);
    return results
        .map((row) => {
              'id': row['id'],
              'filename': row['filename'],
              'title': row['title'],
              'date': row['date'],
              'deadline': row['deadline'],
              'description': row['description'],
              'degree': row['degree'],
              'file': row['file'].length > 0,
              'instructor': row['instructor'],
            })
        .toList();
  }

  static Map<String, dynamic> getAssignment(String id) {
    final results = _db.select(
        'SELECT A.id, A.filename, A.title, A.date, A.deadline, A.description, A.degree, A.file, CASE WHEN A.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM assignments A LEFT JOIN doctors D ON A.doctorId = D.id LEFT JOIN teaching_assistants T ON A.teaching_assistantId = T.id WHERE A.id = ' +
            id);
    var assignment = results.first;
    return {
      'id': assignment['id'],
      'filename': assignment['filename'],
      'title': assignment['title'],
      'date': assignment['date'],
      'deadline': assignment['deadline'],
      'description': assignment['description'],
      'degree': assignment['degree'],
      'file': assignment['file'].length > 0,
      'instructor': assignment['instructor'],
    };
  }
}

class Assignment {
  final router;
  Assignment(this.router) {
    main();
  }

  void main() async {
    // تهيئة قاعدة البيانات
    DatabaseHelper.init();

    // عرض المواد
    router.get('/courses-assignments/<courseId>',
        (Request request, String courseId) async {
      try {
        final assignments = DatabaseHelper.getAssignments(courseId);
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
    router.get('/courses/assignments/<id>', (Request request, String id) async {
      try {
        final assignments = DatabaseHelper.getAssignment(id);
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

    router.get('/courses/assignments/file/<id>',
        (Request request, String id) async {
      try {
        // Query the database to get the profile picture
        final result = DatabaseHelper._db.select(
            'SELECT filename, file FROM assignments WHERE id = ?', [id]);

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
    router.post('/add-assignment', (Request request) async {
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

        DatabaseHelper.addAssignment(data, file);

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
    router.put('/update-assignment/<id>', (Request request, String id) async {
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

        DatabaseHelper.updateAssignment(id, data, file);

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
    router.delete('/delete-assignment/<id>',
        (Request request, String id) async {
      try {
        DatabaseHelper.deleteAssignment(int.parse(id));
        return Response.ok('Assignment deleted successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });

  router.post('/student/submit-assignment', (Request request) async {
  try {
    final form = request.multipartFormData;
    final data = <String, dynamic>{};
    Uint8List? file;

    await for (final formData in form) {
      if (formData.name == "file") {
        final fileName = formData.part.headers['content-disposition']
            ?.split(';')
            .firstWhere((element) => element.trim().startsWith('filename='))
            .split('=')[1]
            .replaceAll('"', '');
        print('Uploaded file name: $fileName'); // Debugging
        data.addAll({"fileName": fileName});

        file = await formData.part.readBytes();
      } else {
        data.addAll({formData.name: await formData.part.readString()});
      }
    }

    // Debugging: Log the received data
    print('Received data: $data');

    // Ensure required fields are present
    if (!data.containsKey('studentId') || !data.containsKey('assignmentId')) {
      return Response.badRequest(body: 'Missing studentId or assignmentId');
    }

    // Check file size (10 MB limit)
    if (file != null && file.length > 10485760) {
      return Response.badRequest(body: 'File size exceeds 10 MB');
    }

    // Debugging: Log the database query
    print('Executing database query...');

    // Insert the assignment submission into the database
    final statement = DatabaseHelper._db.prepare('''
      INSERT INTO assignment_submissions (studentId, assignmentId, filename, file, submissionDate)
      VALUES (?, ?, ?, ?, ?)
    ''');
    statement.execute([
      int.parse(data['studentId']), // Convert to int
      int.parse(data['assignmentId']), // Convert to int
      data['fileName'],
      file ?? Uint8List(0),
      DateTime.now().toString(),
    ]);
    statement.dispose();

    return Response.ok('Assignment submitted successfully');
  } catch (e) {
    print('Error: $e'); // Log the error
    return Response.internalServerError(body: 'Error processing request: $e');
  }
});


    router.get('/student/get-assignments', (Request request, String id) async {
      try {
        var result = DatabaseHelper._db.select('SELECT * FROM assignments');

        DatabaseHelper._db.dispose();

        return Response.ok(result.toString());
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });
  }
}
