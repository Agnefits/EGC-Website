import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf_multipart/form_data.dart';
import 'package:sqlite3/sqlite3.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');
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
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        answers TEXT,
        correctAnswer TEXT NOT NULL,
        degree INTEGER NOT NULL,
        quizId INTEGER NOT NULL REFERENCES quizzes(id)
        )
    ''');
  }

  static int addQuiz(Map<String, dynamic> quizData) {
    final statement = _db.prepare('''
      INSERT INTO quizzes (courseId, title, date, deadline, ${quizData.containsKey("doctorId") ? "doctorId" : "teaching_assistantId"})
      VALUES (?, ?, ?, ?, ?)
    ''');
    statement.execute([
      quizData['courseId'],
      quizData['title'],
      quizData['date'],
      quizData['deadline'],
      quizData[quizData.containsKey("doctorId")
          ? "doctorId"
          : "teaching_assistantId"]
    ]);
    statement.dispose();

    final results = _db.select(
        'SELECT id FROM quizzes WHERE title = \'${quizData['title']}\' ORDER BY id desc limit 1');
    var quiz = results.first;
    return int.parse(quiz['id'].toString());
  }

  static void updateQuiz(String id, Map<String, dynamic> quizData) {
    final statement = _db.prepare('''
      UPDATE quizzes
      SET title = ?, date = ?, deadline = ?
      WHERE id = ?
    ''');
    List data = [quizData['title'], quizData['date'], quizData['deadline'], id];

    statement.execute(data);
    statement.dispose();
  }

  static void deleteQuiz(int id) {
    final statement = _db.prepare('DELETE FROM quizzes WHERE id = ?');
    statement.execute([id]);
    statement.dispose();
  }


  static List<Map<String, dynamic>> getAllQuizzes(String studentId) {
final results = _db.select(
  'SELECT Q.id, Q.title, Q.date, Q.deadline, '
  'CASE WHEN Q.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor '
  'FROM quizzes Q '
  'LEFT JOIN doctors D ON Q.doctorId = D.id '
  'LEFT JOIN teaching_assistants T ON Q.teaching_assistantId = T.id '
  'WHERE Q.courseId IN ('
  'SELECT C.id FROM courses C '
  'WHERE C.department = (SELECT department FROM students WHERE id = ?) '
  'AND C.year = (SELECT year_level FROM students WHERE id = ?))',
  [studentId, studentId]
);

    return results
        .map((row) => {
              'id': row['id'],
              'title': row['title'],
              'date': row['date'],
              'deadline': row['deadline'],
              'instructor': row['instructor'],
            })
        .toList();
  }


  static List<Map<String, dynamic>> getQuizzes(String courseId) {
    final results = _db.select(
        'SELECT Q.id, Q.title, Q.date, Q.deadline, CASE WHEN Q.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM quizzes Q LEFT JOIN doctors D ON Q.doctorId = D.id LEFT JOIN teaching_assistants T ON Q.teaching_assistantId = T.id WHERE Q.courseId = $courseId');
    return results
        .map((row) => {
              'id': row['id'],
              'title': row['title'],
              'date': row['date'],
              'deadline': row['deadline'],
              'instructor': row['instructor'],
            })
        .toList();
  }

  static Map<String, dynamic> getQuiz(String id) {
    final results = _db.select(
        'SELECT Q.id, Q.title, Q.date, Q.deadline, CASE WHEN Q.doctorId IS NULL THEN T.Name ELSE D.Name END AS instructor FROM quizzes Q LEFT JOIN doctors D ON Q.doctorId = D.id LEFT JOIN teaching_assistants T ON Q.teaching_assistantId = T.id WHERE Q.id = $id');
    var quiz = results.first;
    return {
      'id': quiz['id'],
      'title': quiz['title'],
      'date': quiz['date'],
      'deadline': quiz['deadline'],
      'instructor': quiz['instructor'],
    };
  }

  static void addQuizQuestion(Map<String, dynamic> quizQuestionData, quizId) {
    final statement = _db.prepare('''
      INSERT INTO quiz_questions (quizId, title, type, answers, correctAnswer, degree)
      VALUES (?, ?, ?, ?, ?, ?)
    ''');
    statement.execute([
      quizId,
      quizQuestionData['title'],
      quizQuestionData['type'],
      quizQuestionData['answers'] ?? "NULL",
      quizQuestionData['correctAnswer'],
      quizQuestionData['degree'],
    ]);
    statement.dispose();
  }

  static void updateQuizQuestion(Map<String, dynamic> quizQuestionData) {
    final statement = _db.prepare('''
      UPDATE quiz_questions
      SET title = ?, type = ?, answers = ?, correctAnswer = ?, degree = ?
      WHERE id = ?
    ''');
    List data = [
      quizQuestionData['title'],
      quizQuestionData['type'],
      quizQuestionData['answers'] ?? "NULL",
      quizQuestionData['correctAnswer'],
      quizQuestionData['degree'],
      quizQuestionData['id'],
    ];

    statement.execute(data);
    statement.dispose();
  }

  static void deleteQuizQuestion(int id) {
    final statement = _db.prepare('DELETE FROM quiz_questions WHERE id = ?');
    statement.execute([id]);
    statement.dispose();
  }

  static List<Map<String, dynamic>> getQuizQuestions(String quizId) {
    final results = _db.select(
        'SELECT id, title, type, answers, correctAnswer, degree FROM quiz_questions WHERE quizId = $quizId');
    return results
        .map((row) => {
              'id': row['id'],
              'title': row['title'],
              'type': row['type'],
              'answers': row['type'].toString() == "multi"
                  ? jsonDecode(row['answers'])
                  : row['answers'],
              'correctAnswer': row['correctAnswer'],
              'degree': row['degree'],
            })
        .toList();
  }
}

class Quiz {
  final router;
  Quiz(this.router) {
    main();
  }

  void main() async {
    // تهيئة قاعدة البيانات
    DatabaseHelper.init();

    router.get('/quizzes/<studentId>',
        (Request request, String studentId) async {
      try {
        final quizzes = DatabaseHelper.getAllQuizzes(studentId);
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


    // عرض كويز
    router.get('/courses-quizzes/<courseId>',
        (Request request, String courseId) async {
      try {
        final quizzes = DatabaseHelper.getQuizzes(courseId);
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

    // عرض أحد الكويزات
    router.get('/courses/quizzes/<id>', (Request request, String id) async {
      try {
        List<Map<String, dynamic>> quizData = [];
        final quiz = DatabaseHelper.getQuiz(id);
        final quizQuestion = DatabaseHelper.getQuizQuestions(id);
        quizData.add(quiz);
        quizData.addAll(quizQuestion);
        final jsonQuizzes = jsonEncode(quizData);
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

    // إضافة كويز جديدة
    router.post('/add-quiz', (Request request) async {
      try {
        final form = request.multipartFormData;
        final quizData = <String, dynamic>{};
        Map<int, Map<String, dynamic>> questionsData = {};

        await for (final formData in form) {
          final nameParts = formData.name.split("-");
          if (nameParts.length > 1) {
            // Handling question-related data
            final questionField = nameParts[0];
            final questionNo = int.parse(nameParts.last);

            if (!questionsData.containsKey(questionNo)) {
              questionsData[questionNo] = {};
            }

            if (nameParts.length == 2) {
              questionsData[questionNo]![questionField] =
                  await formData.part.readString();
            } else {
              if (!questionsData[questionNo]!.containsKey(questionField)) {
                questionsData[questionNo]![questionField] = [];
              }

              questionsData[questionNo]![questionField]
                  .add(await formData.part.readString());
            }
          } else {
            // Handling quiz-related data
            quizData[formData.name] = await formData.part.readString();
          }
        }

        quizData.addAll({"date": DateTime.now().toString()});

        // Add quiz to the database here
        int quizId = DatabaseHelper.addQuiz(quizData);

        questionsData.forEach(
          (key, value) {
            if (value["type"] == "multi") {
              value["answers"] = jsonEncode(value["answers"]);
            }
            DatabaseHelper.addQuizQuestion(value, quizId);
          },
        );

        return Response.ok('Quiz added successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(
          body: 'Error processing request',
          headers: {'Content-Type': 'application/json', 'Error': '$e'},
        );
      }
    });

    // تعديل مادة
    router.put('/update-quiz/<id>', (Request request, String id) async {
      try {
        final form = request.multipartFormData;
        final quizData = <String, dynamic>{};
        Map<int, Map<String, dynamic>> questionsData = {};

        await for (final formData in form) {
          final nameParts = formData.name.split("-");
          if (nameParts.length > 1) {
            // Handling question-related data
            final questionField = nameParts[0];
            final questionNo = int.parse(nameParts.last);

            if (!questionsData.containsKey(questionNo)) {
              questionsData[questionNo] = {};
            }

            if (nameParts.length == 2) {
              questionsData[questionNo]![questionField] =
                  await formData.part.readString();
            } else {
              if (!questionsData[questionNo]!.containsKey(questionField)) {
                questionsData[questionNo]![questionField] = [];
              }

              questionsData[questionNo]![questionField]
                  .add(await formData.part.readString());
            }
          } else {
            // Handling quiz-related data
            quizData[formData.name] = await formData.part.readString();
          }
        }

        quizData.addAll({"date": DateTime.now().toString()});

        // Add quiz to the database here
        DatabaseHelper.updateQuiz(id, quizData);

        questionsData.forEach(
          (key, value) {
            if (value["type"] == "multi") {
              value["answers"] = jsonEncode(value["answers"]);
            }

            if (value.keys.length == 1) {
              DatabaseHelper.deleteQuizQuestion(int.parse(value["id"].toString()));
            } else if (value.keys.contains("id")) {
              DatabaseHelper.updateQuizQuestion(value);
            } else {
              DatabaseHelper.addQuizQuestion(value, id);
            }
          },
        );

        return Response.ok('Quiz updated successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
          print(e);
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": '$e'});
      }
    });

    // حذف مادة
    router.delete('/delete-quiz/<id>', (Request request, String id) async {
      try {
        DatabaseHelper.deleteQuiz(int.parse(id));
        return Response.ok('Quiz deleted successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });
  }
}
