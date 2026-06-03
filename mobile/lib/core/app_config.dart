import 'package:flutter/foundation.dart';

class AppConfig {
  static const appName = 'DhaxalBook Mobile';

  static const String _definedBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  static String get apiBaseUrl {
    // Haddii build time la siiyo API_BASE_URL
    if (_definedBaseUrl.isNotEmpty) {
      return _definedBaseUrl;
    }

    // PRODUCTION (marka app-ka la release gareeyo)
    if (kReleaseMode) {
      return 'https://dhaxalbook.onrender.com/api';
    }

    // DEVELOPMENT
    if (kIsWeb) {
      return 'http://127.0.0.1:8000/api';
    }

    return 'http://10.0.2.2:8000/api';
  }
}