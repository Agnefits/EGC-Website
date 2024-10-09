import 'dart:convert';
import 'dart:io';

//import 'package:dart_backend/auth.dart';
//import 'package:dart_backend/configurations.dart';
//import 'package:firebase_dart/firebase_dart.dart';
import 'package:egc_website/student.dart';
import 'package:shelf/shelf.dart';
import 'package:egc_website/admin.dart';
import 'package:egc_website/doctor.dart';
import 'package:egc_website/teaching_assistants.dart';
import 'package:shelf_multipart/form_data.dart';

//String privilage = "";
/*
String mode = "";
String status = "";

Map<String, Object> data = {};
*/

///Home, News and Login Pages
Future<Response> getHomeHandler(Request request) async {
  try {
    var html = File('web/index.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getNewsHandler(Request request) async {
  try {
    var html = File('web/page/news.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getLoginHandler(Request request) async {
  try {
    var html = File('web/page/login.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> postLoginHandler(Request request) async {
  try {
    final form = request.multipartFormData;
    final data = <String, dynamic>{};
    await for (final formData in form) {
      data.addAll({formData.name: await formData.part.readString()});
    }

    String username = data["username"]!;
    String password = data["password"]!;
    String privilage = data["login_mode"]!;

    if (privilage == "Admin") {
      var user = await Admin.authenticateUser(username, password);
      if (user == null) {
        return Response.unauthorized("Username or Password is wrong..",
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              "status": "failed",
              "message": "Username or Password is wrong.."
            });
      } else {
        Map<String, dynamic> data = {"role": privilage};
        data.addAll(user);

        final jsonResponse = jsonEncode(data);
        return Response.ok(jsonResponse, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          "status": "success",
        });
      }
    } else if (privilage == "Staff") {
      var user = await Doctor.authenticateUser(username, password);
      privilage = "Doctor";
      if (user == null) {
        user = await TeachingAssistant.authenticateUser(username, password);
        privilage = "TeachingAssistant";
      }
      if (user == null) {
        return Response.unauthorized("Username or Password is wrong..",
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              "status": "failed",
              "message": "Username or Password is wrong.."
            });
      } else {
        Map<String, dynamic> data = {"role": privilage};
        data.addAll(user);
        data["photo"] = data["photo"].length > 0;

        final jsonResponse = jsonEncode(data);
        return Response.ok(jsonResponse, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          "status": "success",
        });
      }
    } else if (privilage == "Student") {
      var user = await Student.authenticateUser(username, password);
      if (user == null) {
        return Response.unauthorized("Username or Password is wrong..",
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              "status": "failed",
              "message": "Username or Password is wrong.."
            });
      } else {
        Map<String, dynamic> data = {"role": privilage};
        data.addAll(user);
        data["photo"] = data["photo"].length > 0;

        final jsonResponse = jsonEncode(data);
        return Response.ok(jsonResponse, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          "status": "success",
        });
      }
    }

    return Response.unauthorized("Not prepared yet!", headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      "status": "failed",
      "message": "Not prepared yet!"
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

///Admin
///Doctor Pages
Future<Response> getDoctorsHandler(Request request) async {
  try {
    var html = File('web/page/admin-doctors.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getShowDoctorsHandler(Request request) async {
  try {
    var html = File('web/page/ShowDoctors.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getAddDoctorHandler(Request request) async {
  try {
    var html = File('web/page/add-doctor.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> postAddDoctorHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/ShowDoctors.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getEditDoctorHandler(Request request) async {
  try {
    var html = File('web/page/edit_doctor.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> postEditDoctorHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/ShowDoctors.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> deleteDoctorHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/ShowDoctors.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

///Teaching Assistant Pages
Future<Response> getTeachingAssistantsHandler(Request request) async {
  try {
    /*
    data = {};
    String modeP = mode;
    String statusP = status;
    */
    var html = File('web/page/admin-teaching-assistants.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getShowTeachingAssistantsHandler(Request request) async {
  try {
    /*
    data = {};
    String modeP = mode;
    String statusP = status;
    */
    var html = File('web/page/ShowTeachingAssistants.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getAddTeachingAssistantHandler(Request request) async {
  try {
    var html = File('web/page/add-teaching-assistants.html').readAsStringSync();

    /*Map<String, Object> header = {
        'Content-Type': 'text/html',
        'Mode': mode,
        'Status': status,
        "Name": data["Name"].toString(),
        "Email": data["Email"].toString(),
        "Phone": data["Phone"].toString(),
        "Username": data["Username"].toString(),
        "Password": data["Password"].toString(),
        "Major": data["Major"].toString()
      };
      print(data);

      status = "";
      data={};
      */
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> postAddTeachingAssistantHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);
    /*
    //Connect to database
    final db = FirebaseDatabase(
        app: Authentication.auth!.app, databaseURL: Configurations.databaseUrl);

    //Check duplication in email and username
    bool duplicated = false;
    final ref = db.reference().child('teaching-assistants/');

    Query query = ref
        .orderByChild('Username')
        .equalTo(queryParams["username"].toString().trim());
    DataSnapshot snapshot = await query.once();
    if (snapshot.value != null) duplicated = true;

    query = ref
        .orderByChild('Email')
        .equalTo(queryParams["email"].toString().toLowerCase().trim());
    snapshot = await query.once();
    if (snapshot.value != null) duplicated = true;

    if (duplicated) {
      mode = 'Add';
      status = 'Failed for duplication';

      Map<String, Object> header = {
        'Content-Type': 'text/html',
        'Mode': mode,
        'Status': status,
        "Name": queryParams["name"]!.trim(),
        "Email": queryParams["email"]!.trim(),
        "Phone": queryParams["phone"]!.trim(),
        "Username": queryParams["username"]!.trim(),
        "Password": queryParams["password"]!.trim(),
        "Major": queryParams["major"]!.trim()
      };
      data = {
        "Name": queryParams["name"]!.trim(),
        "Email": queryParams["email"]!.trim(),
        "Phone": queryParams["phone"]!.trim(),
        "Username": queryParams["username"]!.trim(),
        "Password": queryParams["password"]!.trim(),
        "Major": queryParams["major"]!.trim()};
      var html =
          File('web/page/add-teaching-assistants.html').readAsStringSync();
      return Response.ok(html, headers: header);
    }

    // Add new user in Using Email and Password
    FirebaseAuth AuthfirebaseAuth = FirebaseAuth.instance;

    var auth = await AuthfirebaseAuth.createUserWithEmailAndPassword(
        email: queryParams["email"]!.trim(),
        password: queryParams["password"]!.trim());

    // Add data to firebase in teaching-assistants with uid of the new user (user id)
    await ref.child(auth.user!.uid).set({
      "Name": queryParams["name"]!.trim(),
      "Email": queryParams["email"]!.toLowerCase().trim(),
      "Phone": queryParams["phone"]!.trim(),
      "Username": queryParams["username"]!.trim(),
      "Password": queryParams["password"]!.trim(),
      "Major": queryParams["major"]!.trim(),
    });

    mode = 'Add';
    status = 'Success';

        */
    var html = File('web/page/ShowTeachingAssistants.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getEditTeachingAssistantHandler(Request request) async {
  try {
    var html = File('web/page/edit_teaching_assistant.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> postEditTeachingAssistantHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/ShowTeachingAssistants.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> deleteTeachingAssistantHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/ShowTeachingAssistants.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

///Student Pages
Future<Response> getStudentsHandler(Request request) async {
  try {
    var html = File('web/page/admin-students.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getShowStudentsHandler(Request request) async {
  try {
    var html = File('web/page/ShowStudents.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getAddStudentHandler(Request request) async {
  try {
    var html = File('web/page/Add_Student.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}
Future<Response> getAdminGradesHandler(Request request) async {
  try {
    var html = File('web/page/student-all-grades.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}


Future<Response> getShowStudentGradesHandler(Request request) async {
  try {
    var html = File('web/page/ShowStudentsGrades.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> postAddStudentHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/ShowStudents.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> getEditStudentHandler(Request request) async {
  try {
    var html = File('web/page/edit_Student.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> postEditStudentHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/ShowStudents.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

Future<Response> deleteStudentHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/ShowStudents.html').readAsStringSync();
    return Response.ok(html, headers: {
      'Content-Type': 'text/html',
    });
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

///Show Admin Student Attendance
Future<Response> getAdminStudentAttendanceHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/admin attendance.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}

getAdminClassSchedulesHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/admin-schedules.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}
getAddAdminClassSchedulesHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/add-class-schedule.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}
getShowAdminClassSchedulesHandler(Request request) async {
  try {
    final body = await request.readAsString();
    Uri uri = Uri.parse("https://example.com/params?" + body);

    // Get the query parameters as a map
    Map<String, String> queryParams = uri.queryParameters;

    // Print the map
    print(queryParams);

    var html = File('web/page/admin-class-schedules.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}


Future<Response> getShowAdminTotalStudentsAttendanceHandler(Request request) async {
  try {
    var html = File('web/page/Total Students Att.html').readAsStringSync();
    return Response.ok(html, headers: {'Content-Type': 'text/html'});
  } catch (e) {
    return Response.internalServerError(body: e.toString());
  }
}
