import 'dart:convert';
import 'package:shelf/shelf.dart';
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



  // دالة لإضافة إجابات الطالب
  static void addStudentQuestionAnswers(Map<String, dynamic> answersData) {
    final statement = _db.prepare('''
      INSERT INTO student_question_answers (answers, questionId, studentId)
      VALUES (?, ?, ?)
    ''');

    statement.execute([
      answersData['answers'], // الإجابات
      answersData['questionId'], // رقم السؤال
      answersData['studentId'], // رقم الطالب
    ]);

    statement.dispose();
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
      'quizId': studentQuiz['quizId'], // إضافته

    };
  }


static List<Map<String, dynamic>> getQuizQuestions(String quizId) {
    final results = _db.select('SELECT * FROM quiz_questions WHERE quizId = ?', [quizId]);
    return results.map((row) => {
        'id': row['id'],
        'title': row['title'],
        'type': row['type'],
        'answers': jsonDecode(row['answers']), // افترض أنك خزنت الإجابات كـ JSON
        'correctAnswer': row['correctAnswer'],
        'degree': row['degree'],
    }).toList();
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
router.get('/student-quizzes/<quizId>', (Request request, String quizId) async {
    try {
        final questions = DatabaseHelper.getQuizQuestions(quizId);
        final jsonQuestions = jsonEncode(questions);
        return Response.ok(
            jsonQuestions,
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
    // Endpoint لجلب المحاولات السابقة للطالب بناءً على studentId
router.get('/courses/student-quizzes/<studentId>', (Request request, String studentId) async {
    try {
        final attempts = DatabaseHelper.getStudentQuizAttempt(studentId);
        final jsonAttempts = jsonEncode(attempts);
        return Response.ok(
            jsonAttempts,
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
        final payload = jsonDecode(await request.readAsString());
        DatabaseHelper.addStudentQuizAttempt(payload);

        return Response.ok('Quiz added successfully', headers: {
            'Access-Control-Allow-Origin': '*',
        });
    } catch (e) {
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'}
        );
    }
});


// Endpoint لتسجيل إجابات الطالب
router.post('/add-student-question-answers', (Request request) async {
    try {
        final payload = jsonDecode(await request.readAsString());
        DatabaseHelper.addStudentQuestionAnswers(payload);  // تسجيل الإجابات في قاعدة البيانات

        return Response.ok('Answers recorded successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
    } catch (e) {
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'}
        );
    }
});


   // Endpoint لتحديث بيانات محاولة الطالب
router.put('/update-student-quiz/<id>', (Request request, String id) async {
    try {
        final payload = jsonDecode(await request.readAsString());
        DatabaseHelper.updateStudentQuizAttempt(id, payload);

        return Response.ok('Quiz updated successfully', headers: {
            'Access-Control-Allow-Origin': '*',
        });
    } catch (e) {
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'}
        );
    }
});

// Endpoint لحذف محاولة الطالب بناءً على id
router.delete('/delete-student-quiz/<id>', (Request request, String id) async {
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
