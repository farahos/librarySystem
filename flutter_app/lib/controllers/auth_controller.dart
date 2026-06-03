import 'package:flutter/foundation.dart';

import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';

class AuthController extends ChangeNotifier {
  AuthController({
    required AuthService authService,
    required StorageService storageService,
  })  : _authService = authService,
        _storageService = storageService;

  final AuthService _authService;
  final StorageService _storageService;

  UserModel? _user;
  String? _token;
  String? _rememberedEmail;
  bool _isLoading = false;
  bool _isBootstrapping = true;
  bool _isUpdatingProfile = false;
  bool _isChangingPassword = false;

  UserModel? get user => _user;
  String? get token => _token;
  String? get rememberedEmail => _rememberedEmail;
  bool get isLoading => _isLoading;
  bool get isBootstrapping => _isBootstrapping;
  bool get isUpdatingProfile => _isUpdatingProfile;
  bool get isChangingPassword => _isChangingPassword;

  Future<void> bootstrap() async {
    _rememberedEmail = await _storageService.readRememberedEmail();
    _user = await _storageService.readUser();
    _token = await _storageService.readToken();
    _isBootstrapping = false;
    notifyListeners();
  }

  Future<void> login({
    required String email,
    required String password,
    required bool rememberEmail,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final result = await _authService.login(email: email, password: password);
      _user = result.user;
      _token = result.token;
      await _storageService.saveSession(user: result.user, token: result.token);
      if (rememberEmail) {
        await _storageService.saveRememberedEmail(email);
        _rememberedEmail = email;
      } else {
        await _storageService.clearRememberedEmail();
        _rememberedEmail = null;
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register({
    required String username,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.register(
        username: username,
        email: email,
        password: password,
      );
      await login(
        email: email,
        password: password,
        rememberEmail: true,
      );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    await _storageService.clearSession();
    notifyListeners();
  }

  Future<void> refreshCurrentUser() async {
    final refreshedUser = await _authService.getCurrentUser();
    _user = refreshedUser;
    if (_token != null) {
      await _storageService.saveSession(user: refreshedUser, token: _token!);
    }
    notifyListeners();
  }

  Future<void> updateProfile({
    required String username,
    required String email,
    required String phone,
    required String bio,
  }) async {
    _isUpdatingProfile = true;
    notifyListeners();

    try {
      final updatedUser = await _authService.updateProfile(
        username: username,
        email: email,
        phone: phone,
        bio: bio,
      );
      _user = updatedUser;
      if (_token != null) {
        await _storageService.saveSession(user: updatedUser, token: _token!);
      }
    } finally {
      _isUpdatingProfile = false;
      notifyListeners();
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    _isChangingPassword = true;
    notifyListeners();

    try {
      await _authService.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
    } finally {
      _isChangingPassword = false;
      notifyListeners();
    }
  }
}
