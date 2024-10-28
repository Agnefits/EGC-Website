import 'dart:convert';
import 'dart:typed_data';
import 'package:mime/mime.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf_multipart/form_data.dart';
import 'package:sqlite3/sqlite3.dart';
import 'package:shelf_router/shelf_router.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');

    // Drop the old table if it exists
    //dropTableIfExists('announcements');

    // Create the new table with the updated schema
    _db.execute('''
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT,
        file BLOB,
        filename TEXT,
        courseId INTEGER NOT NULL REFERENCES courses(id),
        doctorId INTEGER REFERENCES users(id), -- Nullable, if added by doctor
        teachingAssistantId INTEGER REFERENCES users(id) -- Nullable, if added by teaching assistant
        )
    ''');
  }

  static void dropTableIfExists(String tableName) {
    _db.execute('DROP TABLE IF EXISTS $tableName');
  }

  static void addAnnouncement(
      Map<String, dynamic> announcementData, Uint8List? file) {
    final statement = _db.prepare('''
      INSERT INTO announcements (courseId, date, description, filename, file, ${announcementData.containsKey("doctorId") ? "doctorId" : "teachingAssistantId"})
      VALUES (?, ?, ?, ?, ?, ?)
    ''');

    statement.execute([
      announcementData['courseId'],
      announcementData['date'],
      announcementData['description'],
      announcementData['fileName'],
      file ?? "NULL",
      announcementData[announcementData.containsKey("doctorId")
          ? "doctorId"
          : "teaching_assistantId"]
    ]);

    statement.dispose();
  }

  static List<Map<String, dynamic>> getAnnouncements(String id) {
    final results = _db.select(
        'SELECT An.id, An.date, An.description, An.filename, An.file, CASE WHEN An.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM announcements An LEFT JOIN doctors D ON An.doctorId = D.id LEFT JOIN teaching_assistants T ON An.teachingAssistantId = T.id WHERE An.courseId = $id ORDER BY An.date DESC');
    return results
        .map((row) => {
              'id': row['id'],
              'date': row['date'],
              'description': row['description'],
              'filename': row['filename'],
              'file': row['file'].length > 0,
              'instructor': row['instructor'],
            })
        .toList();
  }

  static Map<String, dynamic> getAnnouncement(String id) {
    final results = _db.select(
        'SELECT An.id, An.date, An.description, An.filename, An.file, CASE WHEN An.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM announcements An LEFT JOIN doctors D ON An.doctorId = D.id LEFT JOIN teaching_assistants T ON An.teachingAssistantId = T.id WHERE An.courseId = $id ORDER BY An.date DESC');
    var announcement = results.first;
    return {
      'id': announcement['id'],
      'date': announcement['date'],
      'description': announcement['description'],
      'filename': announcement['filename'],
      'file': announcement['file'].length > 0,
      'instructor': announcement['instructor'],
    };
  }

  static List<Map<String, dynamic>> getAllStudentAssignments(String studentId) {
    final results = _db.select(
        'SELECT An.id, An.date, An.description, An.filename, An.file, '
        'CASE WHEN An.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor '
        'FROM announcements An '
        'LEFT JOIN doctors D ON An.doctorId = D.id '
        'LEFT JOIN teaching_assistants T ON An.teachingAssistantId = T.id '
        'WHERE An.courseId IN ('
        'SELECT C.id FROM courses C '
        'WHERE C.department = (SELECT department FROM students WHERE id = ?) '
        'AND C.year = (SELECT year_level FROM students WHERE id = ?))',
        [studentId, studentId]);
    return results
        .map((row) => {
              'id': row['id'],
              'date': row['date'],
              'description': row['description'],
              'filename': row['filename'],
              'file': row['file'].length > 0,
              'instructor': row['instructor'],
            })
        .toList();
  }
}

class AnnouncementService {
  // Save a new announcement to the database
  static void saveAnnouncement(
      Map<String, dynamic> announcementData, Uint8List? file) {
    try {
      DatabaseHelper.addAnnouncement(announcementData, file);
      print('Announcement saved successfully!');
    } catch (e) {
      print('Error saving announcement: $e');
      // Handle error (e.g., log it, rethrow, etc.)
    }
  }

  // Fetch all announcements from the database
  static List<Map<String, dynamic>> fetchAnnouncements(String id) {
    try {
      List<Map<String, dynamic>> announcements =
          DatabaseHelper.getAnnouncements(id);
      print('Fetched ${announcements.length} announcements successfully!');
      return announcements;
    } catch (e) {
      print('Error fetching announcements: $e');
      // Handle error (e.g., log it, return an empty list, etc.)
      return [];
    }
  }
}

class Announcement {
  final Router router;

  Announcement(this.router) {
    main();
  }

  void main() async {
    // Initialize the database
    DatabaseHelper.init();

    // Get a specific announcement details
    router.get('/courses/announcements/<id>',
        (Request request, String id) async {
      try {
        final announcement = DatabaseHelper.getAnnouncements(id);
        final jsonAnnouncement = jsonEncode(announcement);
        return Response.ok(
          jsonAnnouncement,
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

    router.get('/student/courses-announcements/<studentId>',
        (Request request, String studentId) async {
      try {
        final assignments = DatabaseHelper.getAllStudentAssignments(studentId);
        final jsonMaterials = jsonEncode(assignments);
        return Response.ok(
          jsonMaterials,
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

    router.get('/courses/announcements/file/<id>',
        (Request request, String id) async {
      try {
        // Query the database to get the profile picture
        final result = DatabaseHelper._db.select(
            'SELECT filename, file FROM announcements WHERE id = ?', [id]);

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
          return Response.notFound('announcements not found');
        }
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    // Add a new announcement
    router.post('/add-announcement', (Request request) async {
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
            print(
                'Uploaded file name: $fileName'); // Use or store the file name
            data.addAll({"fileName": fileName});
            file = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        }

        data.addAll({"date": DateTime.now().toString()});

        // Determine if the sender is a doctor or a teaching assistant
        if (data['senderRole'] == 'Doctor') {
          data['doctorId'] =
              data['senderId']; // Use the senderId from form data
          data['teachingAssistantId'] = null;
        } else if (data['senderRole'] == 'Teaching Assistant') {
          data['doctorId'] = null;
          data['teachingAssistantId'] =
              data['senderId']; // Use the senderId from form data
        }

        AnnouncementService.saveAnnouncement(data, file);

        return Response.ok('Announcement added successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(
            body: 'Error processing request: $e');
      }
    });
  }
}
