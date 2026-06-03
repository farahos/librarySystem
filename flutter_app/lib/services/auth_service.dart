import 'package:dio/dio.dart';

import '../models/user_model.dart';
import 'api_client.dart';

class AuthResponse {
  const AuthResponse({
    required this.user,
    required this.token,
  });

  final UserModel user;
  final String token;
}

class AuthService {
  AuthService(this._apiClient);

  final ApiClient _apiClient;

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.dio.post<Map<String, dynamic>>(
      '/user/loginUser',
      data: {'email': email, 'password': password},
    );

    final data = response.data ?? <String, dynamic>{};
    return AuthResponse(
      user: UserModel.fromJson(data),
      token: (data['token'] ?? '').toString(),
    );
  }

  Future<void> register({
    required String username,
    required String email,
    required String password,
  }) async {
    await _apiClient.dio.post<Map<String, dynamic>>(
      '/user/registerUser',
      data: {
        'username': username,
        'email': email,
        'password': password,
      },
    );
  }

  Future<UserModel> getCurrentUser() async {
    final response =
        await _apiClient.dio.get<Map<String, dynamic>>('/user/me');
    return UserModel.fromJson(response.data ?? <String, dynamic>{});
  }

  Future<UserModel> updateProfile({
    required String username,
    required String email,
    required String phone,
    required String bio,
  }) async {
    final response = await _apiClient.dio.put<Map<String, dynamic>>(
      '/user/profile',
      data: {
        'username': username,
        'email': email,
        'phone': phone,
        'bio': bio,
      },
    );

    return UserModel.fromJson(response.data ?? <String, dynamic>{});
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _apiClient.dio.put<Map<String, dynamic>>(
      '/user/change-password',
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }

  static String extractMessage(Object error) {
    if (error is DioException) {
      final dynamic data = error.response?.data;
      if (data is Map<String, dynamic> && data['message'] != null) {
        return data['message'].toString();
      }
      if (data is String && data.isNotEmpty) {
        return data;
      }
    }
    return 'Something went wrong. Please try again.';
  }
}
