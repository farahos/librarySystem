import 'package:flutter/foundation.dart';

import '../models/post_model.dart';
import '../services/api_client.dart';
import '../services/post_service.dart';
import '../services/storage_service.dart';

enum PostFilter { all, withPdf, withAudio, withImage }

class LibraryController extends ChangeNotifier {
  LibraryController({
    required ApiClient apiClient,
    required PostService postService,
    required StorageService storageService,
  })  : _apiClient = apiClient,
        _postService = postService,
        _storageService = storageService;

  final ApiClient _apiClient;
  final PostService _postService;
  final StorageService _storageService;

  String? _userId;
  String? _token;
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';
  PostFilter _filter = PostFilter.all;
  List<PostModel> _posts = <PostModel>[];
  Set<String> _favoriteIds = <String>{};

  bool get isLoading => _isLoading;
  String? get error => _error;
  String get searchQuery => _searchQuery;
  PostFilter get filter => _filter;
  List<PostModel> get posts => _posts;
  List<PostModel> get featuredPosts =>
      _posts.where((post) => post.hasImage).take(5).toList();

  List<PostModel> get filteredPosts {
    final query = _searchQuery.trim().toLowerCase();
    return _posts.where((post) {
      final matchesQuery = query.isEmpty ||
          post.title.toLowerCase().contains(query) ||
          post.content.toLowerCase().contains(query) ||
          post.author.toLowerCase().contains(query) ||
          (post.uploadedBy?.username.toLowerCase().contains(query) ?? false);

      final matchesFilter = switch (_filter) {
        PostFilter.all => true,
        PostFilter.withPdf => post.hasPdf,
        PostFilter.withAudio => post.hasAudio,
        PostFilter.withImage => post.hasImage,
      };

      return matchesQuery && matchesFilter;
    }).toList();
  }

  List<PostModel> get favoritePosts =>
      _posts.where((post) => _favoriteIds.contains(post.id)).toList();

  void syncAuth({required String? userId, required String? token}) {
    if (_userId == userId && _token == token) return;
    _userId = userId;
    _token = token;
    _apiClient.setToken(token);
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    _favoriteIds = (await _storageService.readFavorites(_userId)).toSet();
    notifyListeners();
  }

  Future<void> fetchPosts({bool force = false}) async {
    if (_posts.isNotEmpty && !force) return;
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _posts = await _postService.getPosts();
    } catch (error) {
      _error = error.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() => fetchPosts(force: true);

  Future<PostModel> getPostById(String id) => _postService.getPostById(id);

  Future<void> toggleFavorite(String postId) async {
    if (_favoriteIds.contains(postId)) {
      _favoriteIds.remove(postId);
    } else {
      _favoriteIds.add(postId);
    }

    await _storageService.saveFavorites(_userId, _favoriteIds.toList());
    notifyListeners();
  }

  bool isFavorite(String postId) => _favoriteIds.contains(postId);

  void setSearchQuery(String value) {
    _searchQuery = value;
    notifyListeners();
  }

  void setFilter(PostFilter filter) {
    _filter = filter;
    notifyListeners();
  }
}
