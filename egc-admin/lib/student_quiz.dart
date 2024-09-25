import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf_multipart/form_data.dart';
import 'package:sqlite3/sqlite3.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');

    _db.execute('''
      CREATE TABLE IF NOT EXISTS student_quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        score INTEGER,
        quizId INTEGER NOT NULL REFERENCES quizzes(id),
        studentId INTEGER NOT NULL REFERENCES students(id)
      );
      CREATE TABLE IF NOT EXISTS student_question_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        answers TEXT NOT NULL,
        questionId INTEGER NOT NULL REFERENCES questions(id),
        studentId INTEGER NOT NULL REFERENCES students(id)
      )
    ''');
  }

  static void addStudentQuizAttempt(Map<String, dynamic> quizData) {
    final statement = _db.prepare('''
      INSERT INTO student_quiz_attempts (quizId, studentId, date, score)
      VALUES (?, ?, ?, ?)
    ''');
    statement.execute([
      quizData['quizId'],
      quizData['studentId'],
      quizData['date'],
      quizData['score'],
    ]);
    statement.dispose();
  }

  static void updateStudentQuizAttempt(
      String id, Map<String, dynamic> quizData) {
    final statement = _db.prepare('''
      UPDATE student_quiz_attempts
      SET degree = ? ${quizData['date'] != null ? "date = ?," : ""}
      WHERE id = ?
    ''');
    List data = [
      quizData['degree'],
    ];

    if (quizData['date'] != null) {
      data.add(quizData['date']);
    }

    data.add(id);
    statement.execute(data);
    statement.dispose();
  }

  static void deleteStudentQuizAttempt(int id) {
    final statement =
        _db.prepare('DELETE FROM student_quiz_attempts WHERE id = ?');
    statement.execute([id]);
    statement.dispose();
  }

  static List<Map<String, dynamic>> getStudentQuizAttempts(String quizId) {
    final results = _db.select(
        'SELECT SQ.id, SQ.date, SQ.score, S.Name student FROM student_quiz_attempts SQ LEFT JOIN students S ON SQ.studentId = S.id WHERE SQ.quizId = ' +
            quizId);
    return results
        .map((row) => {
              'id': row['id'],
              'date': row['date'],
              'score': row['score'],
              'student': row['student'],
            })
        .toList();
  }

  static Map<String, dynamic> getStudentQuizAttempt(String id) {
    final results = _db.select(
        'SELECT SQ.id, SQ.date, SQ.score, S.Name student FROM student_quiz_attempts SQ LEFT JOIN students S ON SQ.studentId = S.id WHERE SQ.id = ' +
            id);
    var studentQuiz = results.first;
    return {
      'id': studentQuiz['id'],
      'date': studentQuiz['date'],
      'score': studentQuiz['score'],
      'student': studentQuiz['student'],
    };
  }
}

class StudentQuiz {
  final router;
  StudentQuiz(this.router) {
    main();
  }

  void main() async {
    // تهيئة قاعدة البيانات
    DatabaseHelper.init();

    // عرض المواد
    router.get('/student-quizzes/<quizId>',
        (Request request, String quizId) async {
      try {
        final quizzes = DatabaseHelper.getStudentQuizAttempts(quizId);
        final jsonQuizzes = jsonEncode(quizzes);
        return Response.ok(
          jsonQuizzes,
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
    router.get('/courses/student-quizzes/<id>',
        (Request request, String id) async {
      try {
        final quizzes = DatabaseHelper.getStudentQuizAttempt(id);
        final jsonQuizzes = jsonEncode(quizzes);
        return Response.ok(
          jsonQuizzes,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        );
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });

    // إضافة مادة جديدة
    router.post('/add-student-quiz', (Request request) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};

        await for (final formData in form) {
          data.addAll({formData.name: await formData.part.readString()});
        }
        data.addAll({"date": DateTime.now().toString()});

        DatabaseHelper.addStudentQuizAttempt(data);

        return Response.ok('Quiz added successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // تعديل مادة
    router.put('/update-student-quiz/<id>', (Request request, String id) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};

        await for (final formData in form) {
          data.addAll({formData.name: await formData.part.readString()});
        }

        DatabaseHelper.updateStudentQuizAttempt(id, data);

        return Response.ok('Quiz updated successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // حذف مادة
    router.delete('/delete-student-quiz/<id>',
        (Request request, String id) async {
      try {
        DatabaseHelper.deleteStudentQuizAttempt(int.parse(id));
        return Response.ok('Quiz deleted successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });
  }
}
