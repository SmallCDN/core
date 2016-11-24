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

    Stream<FileSystemEntity> folderStream = await folder
        .list();
    for (FileSystemEntity version in await folderStream.toList()) {
      if (!await FileSystemEntity.isDirectory(version.path)) return;
      versions.add(
          version.path.replaceFirst(new RegExp(r"libraries\/libs\\\S+\\"), ''));
    }

    print(versions);
  });
}
