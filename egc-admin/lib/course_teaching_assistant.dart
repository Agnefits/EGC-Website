import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf_multipart/form_data.dart';
import 'package:sqlite3/sqlite3.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');
    _db.execute('''
 CREATE TABLE IF NOT EXISTS course_teaching_assistant (
        courseId INTEGER NOT NULL REFERENCES courses(id),
        teaching_assistantId INTEGER NOT NULL REFERENCES teaching_assistants(id),
        primary key (courseId,teaching_assistantId)
      )     
    ''');
  }

  static void add_teaching_assistant(Map<String, dynamic>courseTeachingAssistant ) {
    final statement = _db.prepare('''
      INSERT INTO course_teaching_assistant (courseId,teaching_assistantId )
      VALUES (?, ? )
    ''');
    statement.execute([
      courseTeachingAssistant['courseId'],
      courseTeachingAssistant['teaching_assistantId'],
    
    ]);
    statement.dispose();
  }



  static void delete_course_teaching(  int courseId ,int teachingAssistantid) {
    final statement = _db.prepare('DELETE FROM course_teaching_assistant WHERE courseId = ? and teaching_assistantId =?');
    statement.execute([  courseId , teachingAssistantid]);
    statement.dispose();
  }




}

class CourseTeachingAssistant {
  final router;
  CourseTeachingAssistant(this.router) {
    main();
  }

  void main() async {
    // تهيئة قاعدة البيانات
    DatabaseHelper.init();

   router.get('/course-teaching-assistants/<courseId>', (Request request,String courseId) async {
      try {
        final results = DatabaseHelper._db.select(
            'SELECT id, name, email, phone, username, major, photo FROM teaching_assistants join course_teaching_assistant on id = teaching_assistantId where courseId = ?',[courseId]);
        final teachingAssistantList = results
            .map((row) => {
                  'id': row['id'],
                  'name': row['name'],
                  'email': row['email'],
                  'phone': row['phone'],
                  'major': row['major'],
                  "photo": row['photo'].length > 0

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


    // إضافة مادة جديدة
    router.post('/join_course_teaching_assistant', (Request request) async {
      try {
        final form = request.multipartFormData;
        final data = <String, dynamic>{};
        
        await for (final formData in form) {
         data.addAll({formData.name: await formData.part.readString()});
        
        }
        final result=
        DatabaseHelper._db.select('select 1 FROM course_teaching_assistant WHERE courseId =  ? and teaching_assistantId =?',[data['courseId'],
      data['teaching_assistantId'],]);
      if(result.isEmpty){
        DatabaseHelper.add_teaching_assistant(data);

      }
      else{
        return Response.internalServerError(
            body: 'Error processing request',
            headers: {'Content-Type': 'application/json', "Error": 'the teaching assistant already is here'});
      
      }

        return Response.ok(' teaching assistant joined successfully', headers: {
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
    router.delete('/delete-course-teaching-assistant/<courseId>/<teaching_assistantId>', (Request request,String courseId ,String teachingAssistantid ) async {
      try {
        DatabaseHelper.delete_course_teaching(int.parse(courseId),int.parse(teachingAssistantid));
        return Response.ok('teaching is deleted successfully', headers: {
          'Access-Control-Allow-Origin': '*',
        });
      } catch (e) {
        return Response.internalServerError(body: 'Error: $e');
      }
    });

   }
}
