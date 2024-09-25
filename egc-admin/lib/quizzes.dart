import 'package:sqlite3/sqlite3.dart';
class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');

    // Create quizzes table
    _db.execute('''
      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        deadline TEXT NOT NULL,
        courseId INTEGER NOT NULL REFERENCES courses(id),
        doctorId INTEGER REFERENCES doctors(id),
        teaching_assistantId INTEGER REFERENCES teaching_assistants(id)
      );
    ''');
  }

  // Add quiz
  static void addQuiz(Map<String, dynamic> quizData) {
    final statement = _db.prepare('''
      INSERT INTO quizzes (title, date, deadline, courseId, ${quizData.containsKey("doctorId")? "doctorId" : "teaching_assistantId"})
      VALUES (?, ?, ?, ?, ?)
    ''');

    statement.execute([
      quizData['title'],
      quizData['date'],
      quizData['deadline'],
      quizData['courseId'],
      quizData[quizData.containsKey("doctorId")? "doctorId" : "teaching_assistantId"]
    ]);

    statement.dispose();
  }

  // Get all quizzes for a course
  static List<Map<String, dynamic>> getQuizzes(String courseId) {
    final results = _db.select(
      'SELECT Q.id, Q.title, Q.date, Q.deadline, Q.courseId, CASE WHEN Q.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM quizzes Q LEFT JOIN doctors D ON Q.doctorId = D.id LEFT JOIN teaching_assistants T ON Q.teaching_assistantId = T.id WHERE Q.courseId = ' + courseId
    );
    return results.map((row) => {
      'id': row['id'],
      'title': row['title'],
      'date': row['date'],
      'deadline': row['deadline'],
      'instructor': row['instructor'],
    }).toList();
  }
}

