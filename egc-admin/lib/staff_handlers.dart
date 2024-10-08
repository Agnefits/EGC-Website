import 'dart:io';
import 'dart:convert';
//import 'package:dart_backend/auth.dart';
//import 'package:dart_backend/configurations.dart';
//import 'package:firebase_dart/firebase_dart.dart';
import 'package:shelf/shelf.dart';



//String privilage = "";
/*
String mode = "";
String status = "";

Map<String, Object> data = {};
*/


// Central function to read HTML files
Future<String> loadHtmlFile(String path) async {
  try {
    return await File(path).readAsString();
  } catch (e) {
    throw Exception('Failed to load HTML file: $path. Error: $e');
  }
}






///Dashboard
Future<Response> getStaffDashboardHandler(Request request) async {
  try {
    var html = File('web/page/Dashboard.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

///Courses
Future<Response> getCoursesHandler(Request request) async {
  try {
    var html = File('web/page/course.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getAddCourseHandler(Request request) async {
  try {
    var html = File('web/page/add course.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getEditCourseHandler(Request request) async {
  try {//Note: change to edit course.html
    var html = File('web/page/edit course.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}


  //Course
  Future<Response> getCourseHomeHandler(Request request) async {
  try {
    var html = File('web/page/nav.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}
  Future<Response> getCourseContentHandler(Request request) async {
  try {
    var html = File('web/page/coursework.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}
  Future<Response> getCourseTeachingAssistantsHandler(Request request) async {
  try {
    var html = File('web/page/staff.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}
Future<Response> getCourseJoinTeachingAssistantsHandler(Request request) async {
  try {
    var html = File('web/page/join.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}
  Future<Response> getCourseStudentsHandler(Request request) async {
  try {//Note: change to student.html
    var html = File('web/page/staff.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

///Courses Assignment
Future<Response> getCourseAssignmentsHandler(Request request) async {
  try {
    var html = File('web/page/courseAssignments.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getAddCourseAssignmentHandler(Request request) async {
  try {
    var html = File('web/page/assignment.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getEditCourseAssignmentHandler(Request request) async {
  try {//Note: change to edit Assignment.html
    var html = File('web/page/edit-assignment.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getCourseAssignmentDetailsHandler(Request request) async {
  try {//Note: change to edit Assignment.html
    var html = File('web/page/assignment_details.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

///Courses Material
Future<Response> getCourseMaterialsHandler(Request request) async {
  try {
    var html = File('web/page/courseMaterials.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getAddCourseMaterialHandler(Request request) async {
  try {
    var html = File('web/page/add_material.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getEditCourseMaterialHandler(Request request) async {
  try {//Note: change to edit Material.html
    var html = File('web/page/edit_material.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

///Courses Quizzes
Future<Response> getCourseQuizzesHandler(Request request) async {
  try {
    var html = File('web/page/courseQuizes.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getAddCourseQuizHandler(Request request) async {
  try {
    var html = File('web/page/add Quiz.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getEditCourseQuizHandler(Request request) async {
  try {//Note: change to edit Quiz.html
    var html = File('web/page/edit_Quiz.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getCourseQuizDetailsHandler(Request request) async {
  try {//Note: change to edit Quiz.html
    var html = File('web/page/quiz_details.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

//Student Attendance
Future<Response> getStudentAttendanceHandler(Request request) async {
  try {
    var html = File('web/page/Get Attendance.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getAddStudentAttendanceHandler(Request request) async {
  try {
    var html = File('web/page/d&e attendance.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}
Future<Response> getCourseGradesHandler(Request request) async {
  try {
    var html = File('web/page/grades.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}



Future<Response> insertStudentDegrees(Request request) async {
  try {
    var html = File('web/page/grades.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

// Generic request handler
Future<Response> handleRequest(String path) async {
  try {
    var html = await loadHtmlFile(path);
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}