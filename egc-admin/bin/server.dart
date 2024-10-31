import 'dart:io';

//import 'package:dart_backend/auth.dart';
//import 'package:firebase_dart/firebase_dart.dart';
import 'package:egc_website/assignment.dart';
// import 'package:egc_website/attendence.dart';
import 'package:egc_website/class_schedules.dart';
import 'package:egc_website/course.dart';
import 'package:egc_website/doctor.dart';
import 'package:egc_website/admin_handlers.dart';
import 'package:egc_website/grade.dart';
import 'package:egc_website/material.dart';
import 'package:egc_website/quiz.dart';
import 'package:egc_website/staff_handlers.dart';
import 'package:egc_website/student.dart';
import 'package:egc_website/student_assignment.dart';
import 'package:egc_website/student_handlers.dart';
import 'package:egc_website/student_quiz.dart';
import 'package:egc_website/teaching_assistants.dart';
import 'package:egc_website/admin.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_router/shelf_router.dart';
import 'package:shelf_static/shelf_static.dart';

void main() async {
  final router = Router();
  //FirebaseDart.setup();
  //Authentication()..Login();

  Student(router);
  TeachingAssistant(router);
  Doctor(router);
  Admin();
  Course(router);
  Material(router);
  Assignment(router);
  StudentAssignment(router);
  Quiz(router);
  StudentQuiz(router);
  ClassSchedule(router);
  StudentHandlers(router);
  Grades(router);

  ///Define your routes
  ///Home, News and Login Pag
  router.get('/', getHomeHandler);
  router.get('/home', getHomeHandler);
  router.get('/news', getNewsHandler);
  router.get('/login', getLoginHandler);
  router.post('/login', postLoginHandler);

  ///Admin
  ///Doctor Pages
  router.get('/admin/Doctors', getDoctorsHandler);
  router.get('/admin/ShowDoctors', getShowDoctorsHandler);
  router.get('/admin/AddDoctor', getAddDoctorHandler);
  //router.post('/admin/AddDoctor', postAddDoctorHandler);
  router.get('/admin/EditDoctor', getEditDoctorHandler);
  //router.post('/admin/EditDoctor', postEditDoctorHandler);
  //router.post('/admin/DeleteDoctor', deleteDoctorHandler);

  ///Teaching Assistant Pages
  router.get('/admin/TeachingAssistants', getTeachingAssistantsHandler);
  router.get('/admin/ShowTeachingAssistants', getShowTeachingAssistantsHandler);
  router.get('/admin/AddTeachingAssistant', getAddTeachingAssistantHandler);
  //router.post('/admin/AddTeachingAssistant', postAddTeachingAssistantHandler);
  router.get('/admin/EditTeachingAssistant', getEditTeachingAssistantHandler);
  //router.post('/admin/EditTeachingAssistant', postEditTeachingAssistantHandler);
  //router.post('/admin/DeleteTeachingAssistant', deleteTeachingAssistantHandler);

  ///Student Pages
  router.get('/admin/Students', getStudentsHandler);
  router.get('/admin/ShowStudents', getShowStudentsHandler);
  router.get('/admin/AddStudent', getAddStudentHandler);
  //router.post('/admin/AddStudent', postAddStudentHandler);
  router.get('/admin/EditStudent', getEditStudentHandler);
  //router.post('/admin/EditStudent', postEditStudentHandler);
  //router.post('/admin/DeleteStudent', deleteStudentHandler);
  router.get('/admin/ShowStudentGrades', getShowStudentGradesHandler);
  router.get('/admin/Grades', getAdminGradesHandler);

  ///Student Attendance
  router.get('/admin/StudentAttendance', getAdminStudentAttendanceHandler);
  router.get('/admin/ShowStudentAttendance', getAdminShowStudentAttendanceHandler);
  router.get('/admin/TotalStudentsAttendance', getShowAdminTotalStudentsAttendanceHandler);
  router.get('/admin/SingleStudentAttendance', getAdminSingleStudentAttendanceHandler);

  ///Class Schedule
  router.get('/admin/ClassSchedules', getAdminClassSchedulesHandler);
  router.get('/admin/ShowClassSchedules', getShowAdminClassSchedulesHandler);
  router.get('/admin/AddClassSchedule', getAddAdminClassSchedulesHandler);

  ///Staff
  //Dashboard
  router.get('/staff/Dashboard', getStaffDashboardHandler);

  //Courses
  router.get('/staff/ShowCourses', getCoursesHandler);
  router.get('/staff/AddCourse', getAddCourseHandler);
  router.get('/staff/EditCourse', getEditCourseHandler);

  //Course
  router.get('/staff/Course/', getCourseHomeHandler);
  router.post('/staff/Course/grades', insertStudentDegrees);
  router.post('/insertStudentDegrees', insertStudentDegrees);
  router.get('/staff/Course/Home', getCourseHomeHandler);
  router.get('/staff/Course/Content', getCourseContentHandler);
  router.get(
      '/staff/Course/TeachingAssistants', getCourseTeachingAssistantsHandler);
  router.get('/staff/Course/JoinTeachingAssistant',
      getCourseJoinTeachingAssistantsHandler);
  router.get('/staff/Course/Students', getCourseStudentsHandler);
  router.get('/staff/Course/grades', getCourseGradesHandler);

  //Course Assignment
  router.get('/staff/Course/Assignments', getCourseAssignmentsHandler);
  router.get('/staff/Course/AddAssignment', getAddCourseAssignmentHandler);
  router.get('/staff/Course/EditAssignment', getEditCourseAssignmentHandler);
  router.get(
      '/staff/Course/AssignmentDetails', getCourseAssignmentDetailsHandler);

  //Course Materials
  router.get('/staff/Course/Materials', getCourseMaterialsHandler);
  router.get('/staff/Course/AddMaterial', getAddCourseMaterialHandler);
  router.get('/staff/Course/EditMaterial', getEditCourseMaterialHandler);

  //Course Quiz
  router.get('/staff/Course/Quizzes', getCourseQuizzesHandler);
  router.get('/staff/Course/AddQuiz', getAddCourseQuizHandler);
  router.get('/staff/Course/EditQuiz', getEditCourseQuizHandler);
  router.get('/staff/Course/QuizDetails', getCourseQuizDetailsHandler);

  //Student Attendance
  router.get('/staff/ShowStudentAttendance', getStudentAttendanceHandler);
  router.get('/staff/AddStudentAttendance', getAddStudentAttendanceHandler);

  ///Student
  router.get('/student/Dashboard', getStudentDashboardHandler);
  router.get('/student/Announcements', getstudentannouncementsHandler);
  router.get('/student/AllAssignments', getallassignmentsHandler);
  router.get('/student/AllQuizzes', getStudentAllQuizzesdHandler);
  router.get('/student/AllMaterials', getStudentAllMaterialsHandler);
  router.get('/student/Grades', getStudentGradesHandler);
  router.get('/student/Staff', getStudentStaffHandler);
  router.get('/student/Quiz.html',getQuizHandler);

  ///Get Files
  router.get('/style/<name>', () {
    return Response.ok({}, headers: {
      'Content-Type': 'text/json',
    });
  });
  router.get('/script/<name>', deleteStudentHandler);
  router.get('/img/<name>', deleteStudentHandler);

  // Path to your static files directory
  var staticFilesPath = Directory('web/public');

  // Create a handler to serve static files
  var staticFileHandler = createStaticHandler(staticFilesPath.path);

  // Add a cascade to handle different requests
  var cascade = Cascade().add(staticFileHandler).add(router);

  // Create a server handler
  var handler =
      const Pipeline().addMiddleware(logRequests()).addHandler(cascade.handler);

  // Start the server
  var server = await io.serve(handler, 'localhost', 8080);
  print(
      'Server listening on port http://${server.address.host}:${server.port}/');
}
