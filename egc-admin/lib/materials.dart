import 'package:sqlite3/sqlite3.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');

  }

 // Get all materials
static List<Map<String, dynamic>> getAllMaterials(String courseId) {
    final results = _db.select(
      'SELECT M.id, M.saveAs AS title, M.date, M.note, M.courseId, CASE WHEN M.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM materials M LEFT JOIN doctors D ON M.doctorId = D.id LEFT JOIN teaching_assistants T ON M.teaching_assistantId = T.id WHERE M.courseId = ' + courseId
    );
    return results.map((row) => {
    'id': row['id'],
    'filename': row['filename'],
    'saveAs': row['saveAs'],
    'date': row['date'],
    'instructor': row['instructor'],
    }).toList();
  }
}


