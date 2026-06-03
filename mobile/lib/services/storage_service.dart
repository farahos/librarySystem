import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_model.dart';

class StorageService {
  static const _userKey = 'mobile_user';
  static const _tokenKey = 'mobile_token';
  static const _rememberedEmailKey = 'remembered_email';
  static const _themeModeKey = 'theme_mode';
  static const _notificationsKey = 'notifications_enabled';
  static const _autoplayAudioKey = 'autoplay_audio';
  static const _wifiOnlyDownloadsKey = 'wifi_only_downloads';

  Future<SharedPreferences> get _prefs async => SharedPreferences.getInstance();

  Future<void> saveSession({
    required UserModel user,
    required String token,
  }) async {
    final prefs = await _prefs;
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
    await prefs.setString(_tokenKey, token);
  }

  Future<UserModel?> readUser() async {
    final prefs = await _prefs;
    final raw = prefs.getString(_userKey);
    if (raw == null || raw.isEmpty) return null;
    return UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  Future<String?> readToken() async {
    final prefs = await _prefs;
    return prefs.getString(_tokenKey);
  }

  Future<void> clearSession() async {
    final prefs = await _prefs;
    await prefs.remove(_userKey);
    await prefs.remove(_tokenKey);
  }

  Future<void> saveRememberedEmail(String email) async {
    final prefs = await _prefs;
    await prefs.setString(_rememberedEmailKey, email);
  }

  Future<void> clearRememberedEmail() async {
    final prefs = await _prefs;
    await prefs.remove(_rememberedEmailKey);
  }

  Future<String?> readRememberedEmail() async {
    final prefs = await _prefs;
    return prefs.getString(_rememberedEmailKey);
  }

  Future<List<String>> readFavorites(String? userId) async {
    if (userId == null || userId.isEmpty) return <String>[];
    final prefs = await _prefs;
    return prefs.getStringList('favorites_$userId') ?? <String>[];
  }

  Future<void> saveFavorites(String? userId, List<String> ids) async {
    if (userId == null || userId.isEmpty) return;
    final prefs = await _prefs;
    await prefs.setStringList('favorites_$userId', ids);
  }

  Future<void> saveThemeMode(String value) async {
    final prefs = await _prefs;
    await prefs.setString(_themeModeKey, value);
  }

  Future<String?> readThemeMode() async {
    final prefs = await _prefs;
    return prefs.getString(_themeModeKey);
  }

  Future<void> saveNotificationsEnabled(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool(_notificationsKey, value);
  }

  Future<bool> readNotificationsEnabled() async {
    final prefs = await _prefs;
    return prefs.getBool(_notificationsKey) ?? true;
  }

  Future<void> saveAutoplayAudio(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool(_autoplayAudioKey, value);
  }

  Future<bool> readAutoplayAudio() async {
    final prefs = await _prefs;
    return prefs.getBool(_autoplayAudioKey) ?? false;
  }

  Future<void> saveWifiOnlyDownloads(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool(_wifiOnlyDownloadsKey, value);
  }

  Future<bool> readWifiOnlyDownloads() async {
    final prefs = await _prefs;
    return prefs.getBool(_wifiOnlyDownloadsKey) ?? true;
  }
}
