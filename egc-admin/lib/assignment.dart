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

     static void addAssignment(Map<String, dynamic> assignmentData, Uint8List? file) {
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
      assignmentData[assignmentData.containsKey("doctorId") ? "doctorId" : "teaching_assistantId"]
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
    print('Fetching assignments for courseId: $courseId');
    final results = _db.select('''
        SELECT A.id, A.filename, A.title, A.date, A.deadline, A.description, A.degree, A.file, 
               A.doctorId, A.teaching_assistantId, 
               COALESCE(CASE WHEN A.doctorId IS NULL THEN T.Name ELSE D.Name END, 'Not Assigned') AS instructor 
        FROM assignments A 
        LEFT JOIN doctors D ON A.doctorId = D.id 
        LEFT JOIN teaching_assistants T ON A.teaching_assistantId = T.id 
        WHERE A.courseId = ?
    ''', [courseId]);
    print('Query results: $results');
    return results.map((row) => {
        'id': row['id'],
        'filename': row['filename'],
        'title': row['title'],
        'date': row['date'],
        'deadline': row['deadline'],
        'description': row['description'],
        'degree': row['degree'],
        'file': row['file'].length > 0,
        'instructor': row['instructor'],
    }).toList();
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

  static void addStudentSubmission(Map<String, dynamic> submissionData, Uint8List? file) {
    final statement = _db.prepare('''
        INSERT INTO assignment_submissions (studentId, assignmentId, filename, file, submissionDate)
        VALUES (?, ?, ?, ?, ?)
    ''');
    statement.execute([
        submissionData['studentId'],
        submissionData['assignmentId'],
        submissionData['fileName'],
        file ?? Uint8List(0),
        DateTime.now().toString(),
    ]);
    statement.dispose();
  }

  static List<Map<String, dynamic>> getCourses() {
    final results = _db.select('SELECT id, name FROM courses');
    return results.map((row) => {
        'id': row['id'],
        'name': row['name'],
    }).toList();
  }

  static List<Map<String, dynamic>> getAllAssignments() {
    final results = _db.select('''
        SELECT A.id, A.filename, A.title, A.date, A.deadline, A.description, A.degree, A.file, 
               CASE WHEN A.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor 
        FROM assignments A 
        LEFT JOIN doctors D ON A.doctorId = D.id 
        LEFT JOIN teaching_assistants T ON A.teaching_assistantId = T.id
    ''');
    return results.map((row) => {
        'id': row['id'],
        'filename': row['filename'],
        'title': row['title'],
        'date': row['date'],
        'deadline': row['deadline'],
        'description': row['description'],
        'degree': row['degree'],
        'file': row['file'].length > 0,
        'instructor': row['instructor'],
    }).toList();
  }

static List<Map<String, dynamic>> getStudentSubmissions(String assignmentId) {
    final results = _db.select(
        'SELECT SA.id, SA.filename, SA.submissionDate, SA.file, S.Name student '
        'FROM assignment_submissions SA '
        'LEFT JOIN students S ON SA.studentId = S.id '
        'WHERE SA.assignmentId = ?', [assignmentId]);
    
    return results.map((row) => {
        'id': row['id'],
        'filename': row['filename'],
        'submissionDate': row['submissionDate'],
        'file': row['file'].length > 0,
        'student': row['student'],
    }).toList();
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
 router.get('/courses-assignments/<courseId>', (Request request, String courseId) async {
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

    // Fetch all assignments (without filtering by course)
    router.get('/courses-assignments', (Request request) async {
        try {
            final assignments = DatabaseHelper.getAllAssignments();
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

    // Fetch the list of all courses
    router.get('/courses', (Request request) async {
        try {
            final courses = DatabaseHelper.getCourses();
            final jsonCourses = jsonEncode(courses);
            return Response.ok(
                jsonCourses,
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

    // Fetch details of a specific assignment by its id
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

    // Fetch the file associated with a specific assignment by its id
    router.get('/courses/assignments/file/<id>', (Request request, String id) async {
        try {
            final result = DatabaseHelper._db.select(
                'SELECT filename, file FROM assignments WHERE id = ?', [id]);

            if (result.isNotEmpty) {
                final fileBytes = result.first['file'];
                final mimeType = lookupMimeType(result.first['filename']) ??
                    'application/octet-stream';
                return Response.ok(fileBytes, headers: {
                    'Content-Type': mimeType,
                    'Content-Disposition': 'inline; filename="${result.first['filename']}"',
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
                .replaceAll('"', '');
            data.addAll({"fileName": fileName});
            file = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        }

        data.addAll({"date": DateTime.now().toString()});
        DatabaseHelper.addAssignment(data, file);

        // Return the updated assignments after addition
        final updatedAssignments = DatabaseHelper.getAssignments(data['courseId']);
        return Response.ok(
          jsonEncode(updatedAssignments),
          headers: {'Content-Type': 'application/json'}
        );
      } catch (e) {
        return Response.internalServerError(
          body: jsonEncode({"error": "Error processing request: $e"}),
          headers: {'Content-Type': 'application/json'}
        );
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
                data.addAll({"fileName": fileName});
                file = await formData.part.readBytes();
            } else {
                data.addAll({formData.name: await formData.part.readString()});
            }
        }

        if (file == null || file.isEmpty) {
            return Response.internalServerError(body: 'No file received.');
        }

        DatabaseHelper.addStudentSubmission(data, file);

        // Fetch the submission details to return
        final submissions = DatabaseHelper.getStudentSubmissions(data['assignmentId']);
        final submission = submissions.firstWhere((sub) => sub['filename'] == data['fileName']);

        return Response.ok(
            jsonEncode(submission),
            headers: {'Content-Type': 'application/json'},
        );
    } catch (e) {
        return Response.internalServerError(body: 'Error processing request: $e');
    }
});
 router.get('/staff/Course/AssignmentDetails/<assignmentId>/submissions', (Request request, String assignmentId) async {
        try {
            final submissions = DatabaseHelper.getStudentSubmissions(assignmentId);
            final jsonSubmissions = jsonEncode(submissions);

            return Response.ok(
                jsonSubmissions,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            );
        } catch (e) {
            return Response.internalServerError(body: 'Error: $e');
        }
    });





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
                .replaceAll('"', '');
            data.addAll({"fileName": fileName});
            file = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        }
        data.addAll({"date": DateTime.now().toString()});
        
        DatabaseHelper.updateAssignment(id, data, file);
        
        return Response.ok(
          jsonEncode({"message": "Assignment updated successfully"}),
          headers: {'Content-Type': 'application/json'}
        );
      } catch (e) {
        return Response.internalServerError(
          body: jsonEncode({"error": "Error processing request: $e"}),
          headers: {'Content-Type': 'application/json'}
        );
      }
    });

    // Delete an assignment
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

router.delete('/student/delete-submission/<id>', (Request request, String id) async {
    try {
        final statement = DatabaseHelper._db.prepare('DELETE FROM assignment_submissions WHERE id = ?');
        statement.execute([id]);
        statement.dispose();
        return Response.ok('Submission deleted successfully', headers: {
            'Access-Control-Allow-Origin': '*',
        });
    } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
    }
});

router.get('/staff/Course/AssignmentDetails/<assignmentId>/submissions', (Request request, String assignmentId) async {
    try {
        print('Fetching submissions for assignment ID: $assignmentId');

        // Check if the assignment exists
        final assignment = DatabaseHelper.getAssignment(assignmentId);
        if (assignment == null) {
            return Response.notFound('Assignment not found');
        }

        // Fetch student submissions
        final submissions = DatabaseHelper.getStudentSubmissions(assignmentId);
        if (submissions.isEmpty) {
            return Response.ok(
                jsonEncode([]), // Return an empty array if no submissions are found
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            );
        }

        final jsonSubmissions = jsonEncode(submissions);
        return Response.ok(
            jsonSubmissions,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        );
    } catch (e) {
        print('Error fetching submissions: $e');
        return Response.internalServerError(body: 'Error: $e');
    }
});

router.get('/courses/student-assignments/file/<id>', (Request request, String id) async {
    try {
        // Fetch the student submission file from the database
        final result = DatabaseHelper._db.select(
            'SELECT filename, file FROM assignment_submissions WHERE id = ?', [id]);

        if (result.isNotEmpty) {
            final fileBytes = result.first['file'];
            final mimeType = lookupMimeType(result.first['filename']) ?? 'application/octet-stream';
            return Response.ok(
                fileBytes,
                headers: {
                    'Content-Type': mimeType,
                    'Content-Disposition': 'inline; filename="${result.first['filename']}"',
                    'Access-Control-Allow-Origin': '*',
                },
            );
        } else {
            return Response.notFound('Student submission not found');
        }
    } catch (e) {
        print('Error fetching student submission file: $e');
        return Response.internalServerError(body: 'Error: $e');
    }
});

router.get('/student/submission/<assignmentId>/<studentId>', (Request request, String assignmentId, String studentId) async {
    try {
        final results = DatabaseHelper._db.select(
            'SELECT id, filename, submissionDate FROM assignment_submissions WHERE assignmentId = ? AND studentId = ?',
            [assignmentId, studentId]
        );

        if (results.isNotEmpty) {
            final submissions = results.map((row) => ({
                'id': row['id'],
                'filename': row['filename'],
                'submissionDate': row['submissionDate'],
            })).toList();
            return Response.ok(
                jsonEncode(submissions),
                headers: {'Content-Type': 'application/json'},
            );
        } else {
            return Response.ok(
                jsonEncode([]), // Return an empty array if no submissions are found
                headers: {'Content-Type': 'application/json'},
            );
        }
    } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
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
