import 'package:crypto/crypto.dart';
import 'dart:convert';

import 'package:sqlite3/sqlite3.dart'; // for the utf8.encode method

class DatabaseHelper {
  static late Database _db;

  static void init() {
    _db = sqlite3.open('egcDB.db');

    // حذف الجدول إذا كان موجودًا
    /*
     _db.execute('DROP TABLE IF EXISTS doctors');
     */

    _db.execute('''
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        photo BLOB
      )
    ''');
    final result = _db.select('SELECT 1 FROM admins');
    if (result.isEmpty) {
      final statement = _db.prepare('''
      INSERT INTO admins (name, email, phone, username, password, photo)
      VALUES (?, ?, ?, ?, ?, ?)
    ''');
      statement.execute([
        'Admin',
        'admin@gmail.com',
        '',
        'admin',
        'admin',
        'NULL',
      ]);
    }
  }

  static void dispose() {
    _db.dispose();
  }
}

class Admin {
  Admin() {
    main();
  }

  void main(){
    DatabaseHelper.init();
  }

// Function to hash passwords
  String hashPassword(String password) {
    var bytes = utf8.encode(password);
    return sha256.convert(bytes).toString();
  }

  // Function to authenticate user
  static Future<Map<String, dynamic>?> authenticateUser(
      String username, String password) async {
    final result = DatabaseHelper._db.select(
        "SELECT id, username, name, email, phone, photo FROM admins WHERE username = '$username' AND password = '$password'");
    if (result.isNotEmpty) {
      return result.first;
    }
    return null;
  }
}
