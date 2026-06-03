import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../controllers/library_controller.dart';
import '../widgets/post_card.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LibraryController>().fetchPosts();
    });
  }

  @override
  Widget build(BuildContext context) {
    final library = context.watch<LibraryController>();

    return Scaffold(
      appBar: AppBar(title: const Text('My saved books')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (library.favoritePosts.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 64),
              child: Center(
                child: Text(
                  'No favorites yet. Tap the heart icon on a post to save it.',
                  textAlign: TextAlign.center,
                ),
              ),
            )
          else
            ...library.favoritePosts.map(
              (post) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: PostCard(
                  post: post,
                  isFavorite: true,
                  onFavoriteToggle: () => library.toggleFavorite(post.id),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
