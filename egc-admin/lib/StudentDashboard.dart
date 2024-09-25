/*import 'dart:html';
import 'dart:convert';

void main() {
  final quizCountElement = querySelector('#quiz-count') as HeadingElement;

  // Fetch the quiz count from the server
  fetchQuizCount(quizCountElement);
}

void fetchQuizCount(HeadingElement quizCountElement) {
  final courseId = '1'; // Replace with actual course ID if necessary

  HttpRequest.getString('/courses-quizzes/$courseId/count') // Adjust endpoint as needed
    .then((response) {
      final data = jsonDecode(response);
      quizCountElement.text = data['count'].toString(); // Update the count in the card
    })
    .catchError((error) {
      print('Error fetching quiz count: $error');
    });
}*/
