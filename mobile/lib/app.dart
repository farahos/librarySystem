import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'controllers/app_settings_controller.dart';
import 'controllers/auth_controller.dart';
import 'core/app_theme.dart';
import 'screens/admin/admin_dashboard_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/main_shell_screen.dart';
import 'screens/splash_screen.dart';

class DhaxalBookApp extends StatelessWidget {
  const DhaxalBookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DhaxalBook Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: context.watch<AppSettingsController>().themeMode,
      home: Consumer2<AuthController, AppSettingsController>(
        builder: (_, auth, settings, __) {
          if (auth.isBootstrapping || settings.isBootstrapping) {
            return const SplashScreen();
          }

          if (auth.user == null) {
            return const LoginScreen();
          }

          if (auth.user!.isAdmin) {
            return const AdminDashboardScreen();
          }

          return const MainShellScreen();
        },
      ),
    );
  }
}
