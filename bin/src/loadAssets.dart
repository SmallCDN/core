import 'dart:io';
import 'dart:async';

Future<Map<String, Map<String, dynamic>>> loadAssets() async {
  Map<String, Map<String, dynamic>> libraries = {};
  Map<String, Map<String, dynamic>> updaters = {};

  await new Directory('libraries/libs')
      .list()
      .listen((FileSystemEntity folder) async {
    if (await FileSystemEntity.isFile(folder.path)) return;

    List<String> versions = [];

    await folder.list().listen((FileSystemEntity version) async {
      if (!await FileSystemEntity.isDirectory(version.path)) return;
      print(
          version.path.replaceFirst(new RegExp(r"libraries\/libs\\\S+\\"), ''));
      
    });
  });
}
