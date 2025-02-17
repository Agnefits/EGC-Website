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
static void addStudentQuestionAnswers(String quizId, String studentId, List<Map<String, dynamic>> answersList) {
    final statement = _db.prepare(''' 
      INSERT INTO student_question_answers (answers, questionId, studentId) 
      VALUES (?, ?, ?) 
    ''');

    print('Executing statement for quizId: $quizId, studentId: $studentId, answersList: $answersList');
    
    try {
    for (var answerData in answersList) {
        statement.execute([
            answerData['answers'], 
            answerData['questionId'], 
            studentId,
        ]);
    }
} catch (e) {
    print('Database insertion error: $e');
    throw Exception('Error inserting student answers');
}

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

static List<Map<String, dynamic>> getStudentQuizAttempts(String studentId , String quizId) {
  final results = _db.select(
      'SELECT SQ.id, SQ.date, SQ.score, SQ.studentId, SQ.quizId FROM student_quiz_attempts SQ WHERE SQ.quizId = ' +
          quizId + ' AND SQ.studentId = ' + studentId);
  return results
      .map((row) => {
            'id': row['id'],
            'quizId': row['quizId'],
            'date': row['date'],
            'score': row['score'],
            'studentId': row['studentId'],
          })
      .toList();
}



static Map<String, dynamic> getQuizQuestionsWithCount(String quizId) {
  final results = _db.select('''
    SELECT q.*, quizzes.time 
    FROM quiz_questions q
    JOIN quizzes ON q.quizId = quizzes.id
    WHERE q.quizId = ?
  ''', [quizId]);

  List<Map<String, dynamic>> questions = results.map((row) {
    List<dynamic> answers = [];
    // تحقق من وجود قيمة صالحة قبل فك التشفير
    if (row['answers'] != null && row['answers'].isNotEmpty) {
      try {
        answers = jsonDecode(row['answers']);
      } catch (e) {
        print("Error decoding answers: $e");
        answers = [];  // في حال حدوث خطأ، قم بتعيين الإجابات إلى قائمة فارغة
      }
    }

    return {
      'id': row['id'],
      'title': row['title'],
      'type': row['type'],
      'answers': answers,
      'correctAnswer': row['correctAnswer'],
      'degree': row['degree'],
      'time': row['time'], // إضافة الوقت هنا
    };
  }).toList();

  int count = results.length;

  // إرجاع time مع count
  return {
    'questions': questions,
    'count': count,
    'time': results.isNotEmpty ? results.first['time'] : null, // إرجاع قيمة time من السطر الأول
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
router.get('/student-quizzes/<quizId>', (Request request, String quizId) async {
    try {
        final questions = DatabaseHelper.getQuizQuestionsWithCount(quizId);

        // إذا كانت الأسئلة فارغة أو غير موجودة، قم بإرجاع استجابة مع رسالة مناسبة
        if (questions['questions'].isEmpty) {
            return Response.notFound(
                jsonEncode({'message': 'No questions found for this quiz.'}),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            );
        }

        // إرجاع الأسئلة بشكل JSON صحيح
        final jsonQuestions = jsonEncode(questions);
        return Response.ok(
            jsonQuestions,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        );
    } catch (e) {
        print("Error fetching quiz questions: $e");
        return Response.internalServerError(
            body: jsonEncode({'message': 'Error fetching quiz questions.', 'error': e.toString()}),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        );
    }
});



    // عرض أحد المواد
    // Endpoint لجلب المحاولات السابقة للطالب بناءً على studentId
router.get('/courses/student-quizzes/<studentId>/<quizId>', (Request request, String studentId, String quizId) async {
    try {
        // الحصول على محاولات الطالب بناءً على studentId و quizId
        final attempts = await DatabaseHelper.getStudentQuizAttempts(studentId,quizId);
        
        // تحويل النتائج إلى JSON
        final jsonAttempts = jsonEncode(attempts);
        
        // إرجاع النتيجة مع رأس HTTP
        return Response.ok(
            jsonAttempts,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        );
    } catch (e) {
        // في حال حدوث خطأ
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


// Endpoint for registering student's answers
router.post('/add-student-question-answers', (Request request) async {
    try {
        final payload = jsonDecode(await request.readAsString());

        String quizId = payload['quizId'];
        String studentId = payload['studentId'];
        List<Map<String, dynamic>> answers = payload['answers'];

        print('Quiz ID: $quizId, Student ID: $studentId, Answers: $answers');

        DatabaseHelper.addStudentQuestionAnswers(quizId, studentId, answers);

        return Response.ok('Answers recorded successfully', headers: {
            'Access-Control-Allow-Origin': '*',
        });
    } catch (e) {
        print('Error: $e');
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
