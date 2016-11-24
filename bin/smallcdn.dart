import 'dart:io';
import 'dart:async';
import 'src/loadAssets.dart';
import 'package:git/git.dart' as git;
import 'package:dotenv/dotenv.dart' as dotenv;

Future<Null> main() async {
  dotenv.load();
  if (!dotenv.isEveryDefined(['PORT', 'LIBRARY_GITHUB_REPO']))
    throw new Exception('Config not complete.');

  if (await new Directory('libraries').exists()) {
    await git.runGit(['pull'], processWorkingDir: 'libraries');
  } else {
    await new Directory('libraries').create();
    await git.runGit(['clone', dotenv.env['LIBRARY_GITHUB_REPO'], '.'],
        processWorkingDir: 'libraries');
  }

  await loadAssets();

  HttpServer server = await HttpServer.bind(
      InternetAddress.ANY_IP_V6, int.parse(dotenv.env['PORT']));
  print('CDN listening on port ${dotenv.env['PORT']}');

  server.listen((HttpRequest request) {
    new File('libraries/libs/jquery/3.1.1/jquery.min.js')
        .readAsString()
        .then((content) {
      request.response.write(content);
      request.response.close();
    });
  });
}
