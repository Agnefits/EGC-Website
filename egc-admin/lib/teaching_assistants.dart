import 'dart:convert';
import 'dart:typed_data';
import 'package:shelf/shelf.dart';
import 'package:shelf_multipart/form_data.dart';
//import 'package:shelf/shelf_io.dart' as io;
//import 'package:shelf_router/shelf_router.dart';
import 'package:sqlite3/sqlite3.dart';
//import 'package:shelf_cors_headers/shelf_cors_headers.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');

    // حذف الجدول إذا كان موجودًا
    /*
    _db.execute('DROP TABLE IF EXISTS teaching_assistants');
    */
    _db.execute('''
      CREATE TABLE IF NOT EXISTS teaching_assistants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        major TEXT NOT NULL,
        password TEXT NOT NULL,
        photo BLOB,
        cvFile BLOB
      )
    ''');
  }

  static void addTeachingAssistant(Map<String, dynamic> teachingAssistantData,
      Uint8List? image, Uint8List? cvFile) {
    final existingUser = _db.select(
        'SELECT id FROM teaching_assistants WHERE username = ?',
        [teachingAssistantData['username']]);
    if (existingUser.isNotEmpty) {
      throw Exception('Username already exists');
    }
    final existingEmail = _db.select(
        'SELECT id FROM teaching_assistants WHERE email = ?',
        [teachingAssistantData['email']]);
    if (existingEmail.isNotEmpty) {
      throw Exception('Email already exists');
    }

    final statement = _db.prepare('''
      INSERT INTO teaching_assistants (name, email, phone, username, major, password, photo, cvFile)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''');
    statement.execute([
      teachingAssistantData['name'],
      teachingAssistantData['email'],
      teachingAssistantData['phone'],
      teachingAssistantData['username'],
      teachingAssistantData['major'],
      teachingAssistantData['password'],
      image ?? "NULL",
      cvFile ?? "NULL",
    ]);
    statement.dispose();
  }

  static void updateTeachingAssistant(
      String id,
      Map<String, dynamic> teachingAssistantData,
      Uint8List? image,
      Uint8List? cvFile) {
    final statement = _db.prepare('''
      UPDATE teaching_assistants
      SET name = ?, email = ?, phone = ?, username = ?, major = ?, password = ? ${image != null && image.isNotEmpty ? ", photo = ?" : ""} ${cvFile != null && cvFile.isNotEmpty ? ", cvFile = ?" : ""}
      WHERE id = ?
    ''');
    List data = [
      teachingAssistantData['name'] ?? '',
      teachingAssistantData['email'] ?? '',
      teachingAssistantData['phone'] ?? '',
      teachingAssistantData['username'] ?? '',
      teachingAssistantData['major'] ?? '',
      teachingAssistantData['password'] ?? '',
    ];
    if (image != null && image.isNotEmpty) {
      data.add(image);
    }
    if (cvFile != null && cvFile.isNotEmpty) {
      data.add(cvFile);
    }
    data.add(id);
    statement.execute(data);
    statement.dispose();
  }

  static void deleteTeachingAssistant(String id) {
    final deleteStatement =
        _db.prepare('DELETE FROM teaching_assistants WHERE id = ?');
    deleteStatement.execute([id]);
    deleteStatement.dispose();
  }

  static bool teachingAssistantExists(String id) {
    final result =
        _db.select('SELECT 1 FROM teaching_assistants WHERE id = ?', [id]);
    return result.isNotEmpty;
  }

  static void dispose() {
    _db.dispose();
  }
}

class TeachingAssistant {
  final router;
  TeachingAssistant(this.router) {
    main();
  }

  void main() async {
    DatabaseHelper.init();

    // عرض قائمة المعيدين
    router.get('/teaching-assistants', (Request request) async {
      try {
        final results = DatabaseHelper._db.select(
            'SELECT id, name, email, phone, username, major FROM teaching_assistants');
        final teachingAssistantList = results
            .map((row) => {
                  'id': row['id'],
                  'name': row['name'],
                  'email': row['email'],
                  'phone': row['phone'],
                  'username': row['username'],
                  'major': row['major']
                })
            .toList();

        final jsonResponse = jsonEncode(teachingAssistantList);
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

    // عرض معيد حسب ID
    router.get('/teaching-assistants/<id>', (Request request, String id) async {
      try {
        final result = DatabaseHelper._db.select(
            'SELECT id, name, email, phone, username, major, password, photo, cvFile FROM teaching_assistants WHERE id = ?',
            [id]);
        if (result.isEmpty) {
          return Response.notFound('Teaching Assistant not found');
        }
        final teachingAssistant = result.first;
        final teachingAssistantData = {
          'id': teachingAssistant['id'],
          'name': teachingAssistant['name'],
          'email': teachingAssistant['email'],
          'phone': teachingAssistant['phone'],
          'username': teachingAssistant['username'],
          'major': teachingAssistant['major'],
          'password': teachingAssistant['password'],
          "photo": teachingAssistant['photo'].length > 0,
          "cvFile": teachingAssistant['cvFile'].length > 0
        };
        final jsonResponse = jsonEncode(teachingAssistantData);
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

    router.get('/teaching-assistants/photo/<id>',
        (Request request, String id) async {
      try {
        // Query the database to get the profile picture
        final result = DatabaseHelper._db
            .select('SELECT photo FROM teaching_assistants WHERE id = ?', [id]);

        if (result.isNotEmpty) {
          final profilePictureBytes = result.first['photo'];

          // Set the appropriate content-type header (assuming the image is in PNG format)
          return Response.ok(profilePictureBytes, headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'inline; filename="profile_picture.png"',
            'Access-Control-Allow-Origin': '*'
          });
        } else {
          return Response.notFound('Teaching Assistant not found');
        }
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    // إضافة معيد
    router.post('/add-teaching-assistant', (Request request) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};
        Uint8List? image, cvFile;

        await for (final formData in form) {
          if (formData.name == "picture") {
            image = await formData.part.readBytes();
          } else if (formData.name == "cvUpload") {
            cvFile = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        }
        DatabaseHelper.addTeachingAssistant(data, image, cvFile);

        return Response.ok('Teaching Assistant added successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: e.toString(),
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    router.put('/update-teaching-assistants/<id>',
        (Request request, String id) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};
        Uint8List? image, cvFile;

        await for (final formData in form) {
          if (formData.name == "picture") {
            image = await formData.part.readBytes();
          } else if (formData.name == "cvUpload") {
            cvFile = await formData.part.readBytes();
          } else {
            data.addAll({formData.name: await formData.part.readString()});
          }
        }

        if (!DatabaseHelper.teachingAssistantExists(id)) {
          return Response.notFound('Teaching Assistant not found');
        }

        DatabaseHelper.updateTeachingAssistant(id, data, image, cvFile);

        return Response.ok('Teaching Assistant updated successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request: ${e.toString()}',
            headers: {'Content-Type': 'text/html', "Error": '$e'});
      }
    });

    // حذف معيد
    router.delete('/delete-teaching-assistant/<id>',
        (Request request, String id) async {
      try {
        if (!DatabaseHelper.teachingAssistantExists(id)) {
          return Response.notFound('Teaching Assistant not found');
        }

        DatabaseHelper.deleteTeachingAssistant(id);

        return Response.ok('Teaching Assistant deleted successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });
  }
 
  // Function to authenticate user
  static Future<Map<String, dynamic>?> authenticateUser(
      String username, String password) async {
    final result = DatabaseHelper._db.select(
        "SELECT id, username, name, email, phone, major, photo FROM teaching_assistants WHERE username = '$username' AND password = '$password'");
    if (result.isNotEmpty) {
      return result.first;
    }
    return null;
  }
}
