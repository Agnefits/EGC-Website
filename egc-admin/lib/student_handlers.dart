import 'dart:convert';
import 'dart:io';

import 'package:egc_website/course.dart' as course_db;
import 'package:shelf/shelf.dart';

class StudentHandlers {
  final router;
  StudentHandlers(this.router) {
    main();
  }
  void main() async {
    router.get('/student/courses/<studentId>',
        (Request request, String studentId) async {
      try {
        final results = course_db.DatabaseHelper.db.select(
            'SELECT c.id, c.name, c.courseId FROM courses c INNER JOIN students s ON s.year_level = c.year AND s.department = c.department WHERE s.id = $studentId');
        final courseList = results
            .map((row) => {
                  'id': row[0],
                  'name': row[1],
                  'courseId': row[2],
                })
            .toList();

        return Response.ok(jsonEncode(courseList), headers: {
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
  }
}

///Dashboard
Future<Response> getStudentDashboardHandler(Request request) async {
  try {
    var html = File('web/page/StudentDashboard.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

//student_announcement
Future<Response> getstudentannouncementsHandler(Request request) async {
  try {
    var html = File('web/page/student-announcements.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

//All-assignments
Future<Response> getallassignmentsHandler(Request request) async {
  try {
    var html = File('web/page/all-assignments.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

///AllQuizzes
Future<Response> getStudentAllQuizzesdHandler(Request request) async {
  try {
    var html = File('web/page/showStudentAllQuizzes.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

//AllMaterials
Future<Response> getStudentAllMaterialsHandler(Request request) async {
  try {
    var html = File('web/page/showStudentAllMaterials.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getStudentGradesHandler(Request request) async {
  try {
    var html = File('web/page/student-grades.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getStudentStaffHandler(Request request) async {
  try {
    var html = File('web/page/student-staff.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}
