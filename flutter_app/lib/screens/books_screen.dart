import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../controllers/library_controller.dart';
import '../widgets/post_card.dart';

class BooksScreen extends StatefulWidget {
  const BooksScreen({super.key});

  @override
  State<BooksScreen> createState() => _BooksScreenState();
}

class _BooksScreenState extends State<BooksScreen> {
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
      appBar: AppBar(title: const Text('Knowledge Library')),
      body: RefreshIndicator(
        onRefresh: library.refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              decoration: const InputDecoration(
                hintText: 'Search posts, authors, content...',
                prefixIcon: Icon(Icons.search_rounded),
              ),
              onChanged: library.setSearchQuery,
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                _FilterChipWidget(
                  label: 'All',
                  selected: library.filter == PostFilter.all,
                  onSelected: () => library.setFilter(PostFilter.all),
                ),
                _FilterChipWidget(
                  label: 'PDF',
                  selected: library.filter == PostFilter.withPdf,
                  onSelected: () => library.setFilter(PostFilter.withPdf),
                ),
                _FilterChipWidget(
                  label: 'Audio',
                  selected: library.filter == PostFilter.withAudio,
                  onSelected: () => library.setFilter(PostFilter.withAudio),
                ),
                _FilterChipWidget(
                  label: 'Images',
                  selected: library.filter == PostFilter.withImage,
                  onSelected: () => library.setFilter(PostFilter.withImage),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Text(
              '${library.filteredPosts.length} posts found',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            if (library.isLoading && library.posts.isEmpty)
              const Padding(
                padding: EdgeInsets.only(top: 48),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (library.filteredPosts.isEmpty)
              const Padding(
                padding: EdgeInsets.only(top: 32),
                child: Center(child: Text('No posts matched your filters.')),
              )
            else
              ...library.filteredPosts.map(
                (post) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: PostCard(
                    post: post,
                    isFavorite: library.isFavorite(post.id),
                    onFavoriteToggle: () => library.toggleFavorite(post.id),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _FilterChipWidget extends StatelessWidget {
  const _FilterChipWidget({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  final String label;
  final bool selected;
  final VoidCallback onSelected;

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onSelected(),
    );
  }
}
