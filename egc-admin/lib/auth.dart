// import 'package:dart_backend/configurations.dart';
// import 'package:firebase_dart/auth.dart';
// import 'package:firebase_dart/core.dart';

// class Authentication {
//   static var userCredential;
//   static FirebaseAuth? auth;
//   static FirebaseApp? app;
//   Future<FirebaseApp> initApp() async {
//     late FirebaseApp app;

//     try {
//       app = Firebase.app();
//     } catch (e) {
//       app = await Firebase.initializeApp(
//           options: FirebaseOptions.fromMap(Configurations.firebaseConfig));
//     }

//     return app;
//   }

//   void Login(){
//     try{
//     initApp().then(
//       (app) {
//         Authentication.app = app;
//         auth = FirebaseAuth.instanceFor(app: app);
//         auth!
//             .signInWithEmailAndPassword(
//               email: 'abdallah.itec@gmail.com',
//               password: '12345678',
//             )
//             .then(
//               (user) => userCredential = user,
//             );
//       },
//     );
//     }catch(e){};
//   }
// }
