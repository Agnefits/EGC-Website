import 'dart:convert';
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
     _db.execute('DROP TABLE IF EXISTS courses');
     */

    _db.execute('''
      CREATE TABLE IF NOT EXISTS class_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        instructor TEXT NOT NULL,
        place TEXT NOT NULL,
        day TEXT NOT NULL,
        timeFrom TEXT NOT NULL,
        timeTo TEXT NOT NULL,
        department TEXT NOT NULL,
        year_level TEXT NOT NULL,
        sectionNo TEXT NOT NULL
      )
    ''');
  }

  static void addClassSchedule(Map<String, dynamic> scheduleData) {
    final statement = _db.prepare('''
      INSERT INTO class_schedules (title, instructor, place, day, timeFrom, timeTo, department, year_level, sectionNo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''');
    statement.execute([
      scheduleData["title"],
      scheduleData["instructor"],
      scheduleData["place"],
      scheduleData["day"],
      scheduleData["timeFrom"],
      scheduleData["timeTo"],
      scheduleData["department"],
      scheduleData["year_level"],
      scheduleData["sectionNo"],
    ]);
    statement.dispose();
  }

  static void updateClassSchedule(
      String id, Map<String, dynamic> scheduleData) {
    final statement = _db.prepare('''
      UPDATE class_schedules
      SET title = ?, instructor = ?, place = ?, day = ?, timeFrom = ?, timeTo = ?, department = ?, year_level = ?, sectionNo = ?
      WHERE id = ?
    ''');
    List data = [
      scheduleData["title"],
      scheduleData["instructor"],
      scheduleData["place"],
      scheduleData["day"],
      scheduleData["timeFrom"],
      scheduleData["timeTo"],
      scheduleData["department"],
      scheduleData["year_level"],
      scheduleData["sectionNo"],
    ];

    data.add(id);
    statement.execute(data);
    statement.dispose();
  }

  static void deleteClassSchedule(String id) {
    final deleteStatement =
        _db.prepare('DELETE FROM class_schedules WHERE id = ?');
    deleteStatement.execute([id]);
    deleteStatement.dispose();
  }

  static bool ClassScheduleExists(String id) {
    final result =
        _db.select('SELECT 1 FROM class_schedules WHERE id = ?', [id]);
    return result.isNotEmpty;
  }

  static void dispose() {
    _db.dispose();
  }
}

class ClassSchedule {
  final router;
  ClassSchedule(this.router) {
    main();
  }

  void main() async {
    DatabaseHelper.init();

    // عرض الكورس
    router.get('/class-schedule/<department>/<year-level>/<sectionNo>',
        (Request request, String department, String yearLevel,
            String sectionNo) async {
      try {
        final results = DatabaseHelper._db.select(
            'SELECT id, title, instructor, place, day, timeFrom, timeTo, department, year_level, sectionNo FROM class_schedules WHERE department = \'' +
                department +
                "' AND year_level = '" +
                yearLevel +
                "' AND sectionNo = '" +
                sectionNo +
                "'");
        final classScheduleList = results
            .map((row) => {
                  'id': row['id'],
                  'title': row['title'],
                  'instructor': row['instructor'],
                  'place': row['place'],
                  'day': row['day'],
                  'timeFrom': row['timeFrom'],
                  'timeTo': row['timeTo'],
                  'department': row['department'],
                  'year_level': row['year_level'],
                  'sectionNo': row['sectionNo'],
                })
            .toList();

        final jsonResponse = jsonEncode(classScheduleList);
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
    // إضافة كورس
    router.post('/add-class-schedule', (Request request) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};

        await for (final formData in form) {
          data.addAll({formData.name: await formData.part.readString()});
        }

        DatabaseHelper.addClassSchedule(data);

        return Response.ok('Class Schedule added successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // تحديث كورس
    router.put('/update-class-schedule/<id>',
        (Request request, String id) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};

        await for (final formData in form) {
          data.addAll({formData.name: await formData.part.readString()});
        }

        if (!DatabaseHelper.ClassScheduleExists(id)) {
          return Response.notFound('Class Schedule not found');
        }

        DatabaseHelper.updateClassSchedule(id, data);

        return Response.ok('Class Schedule updated successfully',
            headers: {'Access-Control-Allow-Origin': '*'});
      } catch (e) {
        print('Error: $e');
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Access-Control-Allow-Origin': '*'});
      }
    });

    // حذف دكتور
    router.delete('/delete-class-schedule/<id>', (Request request, String id) async {
      try {
        if (!DatabaseHelper.ClassScheduleExists(id)) {
          return Response.notFound('Class Schedule not found');
        }

        DatabaseHelper.deleteClassSchedule(id);

        return Response.ok('Class Schedule deleted successfully',
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
