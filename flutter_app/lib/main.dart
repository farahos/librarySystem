import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'controllers/auth_controller.dart';
import 'controllers/app_settings_controller.dart';
import 'controllers/library_controller.dart';
import 'services/api_client.dart';
import 'services/auth_service.dart';
import 'services/post_service.dart';
import 'services/storage_service.dart';

void main() {
  final storageService = StorageService();
  final apiClient = ApiClient();
  final authService = AuthService(apiClient);
  final postService = PostService(apiClient);

  runApp(
    MultiProvider(
      providers: [
        Provider.value(value: storageService),
        Provider.value(value: apiClient),
        Provider.value(value: authService),
        Provider.value(value: postService),
        ChangeNotifierProvider(
          create: (_) => AuthController(
            authService: authService,
            storageService: storageService,
          )..bootstrap(),
        ),
        ChangeNotifierProvider(
          create: (_) => AppSettingsController(
            storageService: storageService,
          )..bootstrap(),
        ),
        ChangeNotifierProxyProvider<AuthController, LibraryController>(
          create: (_) => LibraryController(
            apiClient: apiClient,
            postService: postService,
            storageService: storageService,
          ),
          update: (_, auth, library) =>
              library!..syncAuth(userId: auth.user?.id, token: auth.token),
        ),
      ],
      child: const DhaxalBookApp(),
    ),
  );
}
