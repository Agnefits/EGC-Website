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
      CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        saveAs TEXT NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        file BLOB,
        courseId INTEGER NOT NULL REFERENCES courses(id),
        doctorId INTEGER REFERENCES doctors(id),
        teaching_assistantId INTEGER REFERENCES teaching_assistants(id)
      )
    ''');
  }

  static void addMaterial(Map<String, dynamic> materialData, Uint8List? file) {
    final statement = _db.prepare('''
      INSERT INTO materials (courseId, filename, saveAs, date, note, file, ${materialData.containsKey("doctorId")? "doctorId" : "teaching_assistantId"})
      VALUES (?, ?, ?, ?, ?, ?, ?)
    ''');
    statement.execute([
      materialData['courseId'],
      materialData['fileName'],
      materialData['saveAs'],
      materialData['date'],
      materialData['note'],
      file ?? "NULL",
      materialData[materialData.containsKey("doctorId")? "doctorId" : "teaching_assistantId"]
    ]);
    statement.dispose();
  }

  static void updateMaterial(
      String id, Map<String, dynamic> materialData, Uint8List? file) {
    final statement = _db.prepare('''
      UPDATE materials
      SET saveAs = ?, date = ?, note = ? ${file != null && file.isNotEmpty ? ",filename = ?,  file = ?" : ""}
      WHERE id = ?
    ''');
    List data = [
      materialData['saveAs'],
      materialData['date'],
      materialData['note'] ?? '',
    ];

    if (file != null && file.isNotEmpty) {
      data.add(materialData['fileName']);
      data.add(file);
    }
    data.add(id);
    statement.execute(data);
    statement.dispose();
  }

  static void deleteMaterial(int id) {
    final statement = _db.prepare('DELETE FROM materials WHERE id = ?');
    statement.execute([id]);
    statement.dispose();
  }

  static List<Map<String, dynamic>> getAllMaterials() {
    final results = _db.select(
        'SELECT M.id, M.filename, M.saveAs, M.date, M.note, M.file, CASE WHEN M.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM materials M LEFT JOIN doctors D ON M.doctorId = D.id LEFT JOIN teaching_assistants T ON M.teaching_assistantId = T.id');
    return results
        .map((row) => {
              'id': row['id'],
              'filename': row['filename'],
              'saveAs': row['saveAs'],
              'date': row['date'],
              'note': row['note'],
              'file': row['file'].length > 0,
              'instructor' : row['instructor'],
            })
        .toList();
  }


  static List<Map<String, dynamic>> getMaterials(String courseId) {
    final results = _db.select(
        'SELECT M.id, M.filename, M.saveAs, M.date, M.note, M.file, CASE WHEN M.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM materials M LEFT JOIN doctors D ON M.doctorId = D.id LEFT JOIN teaching_assistants T ON M.teaching_assistantId = T.id WHERE M.courseId = $courseId');
    return results
        .map((row) => {
              'id': row['id'],
              'filename': row['filename'],
              'saveAs': row['saveAs'],
              'date': row['date'],
              'note': row['note'],
              'file': row['file'].length > 0,
              'instructor' : row['instructor'],
            })
        .toList();
  }

  static Map<String, dynamic> getMaterial(String id) {
    final results = _db.select(
        'SELECT M.id, M.filename, M.saveAs, M.date, M.note, M.file, CASE WHEN M.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM materials M LEFT JOIN doctors D ON M.doctorId = D.id LEFT JOIN teaching_assistants T ON M.teaching_assistantId = T.id WHERE M.id = $id');
    var material = results.first;
    return {
      'id': material['id'],
      'filename': material['filename'],
      'saveAs': material['saveAs'],
      'date': material['date'],
      'note': material['note'],
      'file': material['file'].length > 0,
      'instructor' : material['instructor'],
    };
  }
}

class Material {
  final router;
  Material(this.router) {
    main();
  }

  void main() async {
    // تهيئة قاعدة البيانات
    DatabaseHelper.init();

  router.get('/materials', (Request request) async {
    try {
      final materials = DatabaseHelper.getAllMaterials();
      final jsonMaterials = jsonEncode(materials);
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






    // عرض المواد
    router.get('/courses-materials/<courseId>',
        (Request request, String courseId) async {
      try {
        final materials = DatabaseHelper.getMaterials(courseId);
        final jsonMaterials = jsonEncode(materials);
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

    // عرض أحد المواد
    router.get('/courses/materials/<id>', (Request request, String id) async {
      try {
        final materials = DatabaseHelper.getMaterial(id);
        final jsonMaterials = jsonEncode(materials);
        return Response.ok(
          jsonMaterials,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        );
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });

    router.get('/courses/materials/file/<id>',
        (Request request, String id) async {
      try {
        // Query the database to get the profile picture
        final result = DatabaseHelper._db
            .select('SELECT filename, file FROM materials WHERE id = ?', [id]);

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
          return Response.notFound('Meterial not found');
        }
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    // إضافة مادة جديدة
    router.post('/add-material', (Request request) async {
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

        DatabaseHelper.addMaterial(data, file);

        return Response.ok('Material added successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // تعديل مادة
    router.put('/update-material/<id>', (Request request, String id) async {
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

        DatabaseHelper.updateMaterial(id, data, file);

        return Response.ok('Material updated successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });
  
    // حذف مادة
    router.delete('/delete-material/<id>', (Request request, String id) async {
      try {
        DatabaseHelper.deleteMaterial(int.parse(id));
        return Response.ok('Material deleted successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });

   }
}
