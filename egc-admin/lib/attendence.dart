import 'package:sqlite3/sqlite3.dart';

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');
    _db.execute('''
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        sectionNo INTEGER NOT NULL,
        note TEXT,
        courseId INTEGER NOT NULL REFERENCES courses(id),
        doctorId INTEGER REFERENCES doctors(id),
        teaching_assistantId INTEGER REFERENCES teaching_assistants(id)
      )
    ''');


        _db.execute('''
      CREATE TABLE IF NOT EXISTS student_attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT NOT NULL,
        attendanceId INTEGER NOT NULL REFERENCES attendance(id),
        studentId INTEGER REFERENCES students(id)
      )
    ''');

    _db.execute('''
        INSERT INTO attendance (
           date,  sectionNo,  note, courseId,  doctorId,  teaching_assistantId
        ) VALUES (?, ?, ?, ?, ?, ?)
      ''', [
            'today',
            '1',
            'NOTE',
            '1',
            '1',
            '1',
          ]); 

           _db.execute('''
        INSERT INTO attendance (
           date,  sectionNo,  note, courseId,  doctorId,  teaching_assistantId
        ) VALUES (?, ?, ?, ?, ?, ?)
      ''', [
            'monday',
            '1',
            'NOTE',
            '1',
            '1',
            '1',
          ]); 

              _db.execute('''
        INSERT INTO student_attendance (
           status, attendanceId,  studentId
        ) VALUES (?, ?, ?)
      ''', [
            'p',
            '1',
            '1',
          ]); 

           _db.execute('''
        INSERT INTO student_attendance (
           status, attendanceId,  studentId
        ) VALUES (?, ?, ?)
      ''', [
            't',
            '2',
            '1',
          ]); 

          final tables = _db.select('''
  SELECT name FROM sqlite_master WHERE type='table' AND name='student_attendance';
''');

if (tables.isNotEmpty) {
  print('Table student_attendance exists');
} else {
  print('Table student_attendance does not exist');
}

  }

  
  void main() async {
    // تهيئة قاعدة البيانات
    DatabaseHelper.init();

  
    
   }
}
