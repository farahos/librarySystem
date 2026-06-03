import 'package:flutter/material.dart';

import '../services/storage_service.dart';

class AppSettingsController extends ChangeNotifier {
  AppSettingsController({
    required StorageService storageService,
  }) : _storageService = storageService;

  final StorageService _storageService;

  ThemeMode _themeMode = ThemeMode.system;
  bool _notificationsEnabled = true;
  bool _autoplayAudio = false;
  bool _wifiOnlyDownloads = true;
  bool _isBootstrapping = true;

  ThemeMode get themeMode => _themeMode;
  bool get notificationsEnabled => _notificationsEnabled;
  bool get autoplayAudio => _autoplayAudio;
  bool get wifiOnlyDownloads => _wifiOnlyDownloads;
  bool get isBootstrapping => _isBootstrapping;

  Future<void> bootstrap() async {
    final savedMode = await _storageService.readThemeMode();
    _themeMode = switch (savedMode) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
    _notificationsEnabled = await _storageService.readNotificationsEnabled();
    _autoplayAudio = await _storageService.readAutoplayAudio();
    _wifiOnlyDownloads = await _storageService.readWifiOnlyDownloads();
    _isBootstrapping = false;
    notifyListeners();
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    await _storageService.saveThemeMode(
      switch (mode) {
        ThemeMode.light => 'light',
        ThemeMode.dark => 'dark',
        _ => 'system',
      },
    );
    notifyListeners();
  }

  Future<void> setNotificationsEnabled(bool value) async {
    _notificationsEnabled = value;
    await _storageService.saveNotificationsEnabled(value);
    notifyListeners();
  }

  Future<void> setAutoplayAudio(bool value) async {
    _autoplayAudio = value;
    await _storageService.saveAutoplayAudio(value);
    notifyListeners();
  }

  Future<void> setWifiOnlyDownloads(bool value) async {
    _wifiOnlyDownloads = value;
    await _storageService.saveWifiOnlyDownloads(value);
    notifyListeners();
  }
}
