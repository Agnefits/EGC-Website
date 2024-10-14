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
     _db.execute('DROP TABLE IF EXISTS doctors');
     */
    _db.execute('''
      CREATE TABLE IF NOT EXISTS doctors (
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

  static void addDoctor(
      Map<String, dynamic> doctorData, Uint8List? image, Uint8List? cvFile) {
    final existingUser = _db.select(
        'SELECT id FROM doctors WHERE username = ?', [doctorData['username']]);
    if (existingUser.isNotEmpty) {
      throw Exception('Username already exists');
    }

    final existingEmail = _db.select(
        'SELECT id FROM doctors WHERE email = ?', [doctorData['email']]);
    if (existingEmail.isNotEmpty) {
      throw Exception('Email already exists');
    }

    final statement = _db.prepare('''
      INSERT INTO doctors (name, email, phone, username, major, password, photo, cvFile)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''');
    statement.execute([
      doctorData['name'],
      doctorData['email'],
      doctorData['phone'],
      doctorData['username'],
      doctorData['major'],
      doctorData['password'],
      image ?? "NULL",
      cvFile ?? "NULL",
    ]);
    statement.dispose();
  }

  static void updateDoctor(String id, Map<String, dynamic> doctorData,
      Uint8List? image, Uint8List? cvFile) {
    final statement = _db.prepare('''
      UPDATE doctors
      SET name = ?, email = ?, phone = ?, username = ?, major = ?, password = ? ${image != null && image.isNotEmpty ? ", photo = ?" : ""} ${cvFile != null && cvFile.isNotEmpty ? ", cvFile = ?" : ""}
      WHERE id = ?
    ''');
    List data = [
      doctorData['name'] ?? '',
      doctorData['email'] ?? '',
      doctorData['phone'] ?? '',
      doctorData['username'] ?? '',
      doctorData['major'] ?? '',
      doctorData['password'] ?? '',
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

  static void deleteDoctor(String id) {
    final deleteStatement = _db.prepare('DELETE FROM doctors WHERE id = ?');
    deleteStatement.execute([id]);
    deleteStatement.dispose();
  }

  static bool doctorExists(String id) {
    final result = _db.select('SELECT 1 FROM doctors WHERE id = ?', [id]);
    return result.isNotEmpty;
  }

  static void dispose() {
    _db.dispose();
  }
}

class Doctor {
  final router;
  Doctor(this.router) {
    main();
  }

  void main() async {
    DatabaseHelper.init();

    // عرض الدكتور
    router.get('/doctors', (Request request) async {
      try {
        final results = DatabaseHelper._db.select(
            'SELECT id, name, email, phone, username, major FROM doctors');
        final doctorList = results
            .map((row) => {
                  'id': row['id'],
                  'name': row['name'],
                  'email': row['email'],
                  'phone': row['phone'],
                  'username': row['username'],
                  'major': row['major'],
                })
            .toList();

        final jsonResponse = jsonEncode(doctorList);
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

    // عرض دكتور حسب ID
    router.get('/doctors/<id>', (Request request, String id) async {
      try {
        final result = DatabaseHelper._db.select(
            'SELECT id, name, email, phone, username, major, password, photo, cvFile FROM doctors WHERE id = ?',
            [id]);
        if (result.isEmpty) {
          return Response.notFound('Doctor not found');
        }
        final doctor = result.first;
        final doctorData = {
          'id': doctor['id'],
          'name': doctor['name'],
          'email': doctor['email'],
          'phone': doctor['phone'],
          'username': doctor['username'],
          'major': doctor['major'],
          'password': doctor['password'],
          "photo": doctor['photo'].length > 0,
          "cvFile": doctor['cvFile'].length > 0
        };
        final jsonResponse = jsonEncode(doctorData);
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

    router.get('/doctors/photo/<id>', (Request request, String id) async {
      try {
        // Query the database to get the profile picture
        final result = DatabaseHelper._db
            .select('SELECT photo FROM doctors WHERE id = ?', [id]);

        if (result.isNotEmpty) {
          final profilePictureBytes = result.first['photo'];

          // Set the appropriate content-type header (assuming the image is in PNG format)
          return Response.ok(profilePictureBytes, headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'inline; filename="profile_picture.png"',
            'Access-Control-Allow-Origin': '*'
          });
        } else {
          return Response.notFound('Doctor not found');
        }
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    // إضافة دكتور
    router.post('/add-doctor', (Request request) async {
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

        DatabaseHelper.addDoctor(data, image, cvFile);

        return Response.ok('Doctor added successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // تحديث دكتور
    router.put('/update-doctor/<id>', (Request request, String id) async {
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

        if (!DatabaseHelper.doctorExists(id)) {
          return Response.notFound('Student not found');
        }

        DatabaseHelper.updateDoctor(id, data, image, cvFile);

        return Response.ok('Doctor updated successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    // حذف دكتور
    router.delete('/delete-doctor/<id>', (Request request, String id) async {
      try {
        if (!DatabaseHelper.doctorExists(id)) {
          return Response.notFound('Doctor not found');
        }

        DatabaseHelper.deleteDoctor(id);

        return Response.ok('Doctor deleted successfully',
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
        "SELECT id, username, name, email, phone, major, photo FROM doctors WHERE username = '$username' AND password = '$password'");
    if (result.isNotEmpty) {
      return result.first;
    }
    return null;
  }
}
